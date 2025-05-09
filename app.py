import os
import sqlite3
import tempfile
import pandas as pd
from bs4 import BeautifulSoup
import requests
from langchain_community.document_loaders import PyPDFLoader, WebBaseLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_openai import ChatOpenAI
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
import gradio as gr
from langchain_community.document_loaders import PyPDFLoader

# Configurações
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)

# Variáveis globais para armazenamento em memória
pdf_documents = []
vectordb_pdf = None
qa_chain_pdf = None

# Mapeamento de temas para links sobre a prova
temas_para_links = {
    "estruturas de prova": "https://www.florence.edu.br/blog/como-e-dividida-a-prova-do-enem/",
    "linguagens, códigos e suas tecnologias": "https://www.todamateria.com.br/linguagens-codigos-e-suas-tecnologias/",
    "Ciências Humanas e suas Tecnologias": "https://www.todamateria.com.br/ciencias-humanas-e-suas-tecnologias/",
    "Ciências da Natureza e suas Tecnologias": "https://www.todamateria.com.br/ciencias-da-natureza-e-suas-tecnologias/",
    "Matemática e suas Tecnologias": "https://fia.com.br/blog/matematica-e-suas-tecnologias/",
    "redação": "https://vestibular.brasilescola.uol.com.br/enem/saiba-tudo-sobre-a-redacao-do-enem.htm"
}

# Inicializa o LLM e a memória
llm = ChatOpenAI(
    model="deepseek/deepseek-r1:free", 
    temperature=0.4,
    openai_api_key=os.environ.get("OPENROUTER_API_KEY"),
    openai_api_base="https://openrouter.ai/api/v1"
)
memoria = ConversationBufferMemory(memory_key="chat_history", return_messages=True, output_key="answer")

# Cria banco de dados SQLite em memória
conn = sqlite3.connect(":memory:")
cursor = conn.cursor()
cursor.execute('''
CREATE TABLE IF NOT EXISTS conversas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aluno TEXT,
    pergunta TEXT,
    resposta TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)
''')
conn.commit()

# Funções auxiliares
def processar_pdfs(files):
    global pdf_documents, vectordb_pdf, qa_chain_pdf

    pdf_documents = []
    if not files:
        return "⚠️ Nenhum arquivo foi enviado."

    for file in files:
        try:
            # Se for NamedString
            if isinstance(file, gr.FileData) or hasattr(file, "path"):
                tmp_path = file.path
                file_name = getattr(file, 'name', 'Arquivo desconhecido')
            elif isinstance(file, str):
                tmp_path = file  # Assume que o 'file' é um caminho direto
                file_name = os.path.basename(file)
            else:
                return f"❌ Formato de arquivo não suportado: {str(type(file))}"

            if not tmp_path or not os.path.exists(tmp_path):
                return f"❌ Arquivo {file_name} não encontrado no caminho {tmp_path}"

            # Processa o arquivo PDF
            loader = PyPDFLoader(tmp_path)
            docs = loader.load_and_split(text_splitter)
            pdf_documents.extend(docs)

        except Exception as e:
            return f"❌ Erro ao processar {file_name if 'file_name' in locals() else 'PDF'}: {str(e)}"

    if pdf_documents:
        try:
            vectordb_pdf = FAISS.from_documents(pdf_documents, embeddings)
            qa_chain_pdf = ConversationalRetrievalChain.from_llm(
                llm=llm,
                retriever=vectordb_pdf.as_retriever(),
                memory=memoria,
                return_source_documents=True,
                output_key="answer"
            )
            return f"✅ {len(files)} PDF(s) processado(s) - {len(pdf_documents)} trechos!"
        except Exception as e:
            return f"❌ Erro ao criar vetores: {str(e)}"
    return "⚠️ Nenhum dado válido para processar."

def responder(pergunta, nome):
    try:
        # Primeiro tenta encontrar na documentação web
        link = identificar_tema(pergunta)
        if link:
            loader = WebBaseLoader(link)
            docs = loader.load()
            if docs:
                documents = text_splitter.split_documents(docs)
                vectordb = FAISS.from_documents(documents, embeddings)
                retriever = vectordb.as_retriever()
                resultado = ConversationalRetrievalChain.from_llm(
                    llm=llm,
                    retriever=retriever,
                    memory=memoria,
                    return_source_documents=True,
                    output_key="answer"
                ).invoke({"question": pergunta})
                resposta = resultado["answer"].content if hasattr(resultado["answer"], "content") else str(resultado["answer"])
                salvar_conversa(nome, pergunta, resposta)
                return resposta
        
        # Se não encontrou na web, tenta nos PDFs locais
        if pdf_documents:
            resultado = qa_chain_pdf.invoke({"question": pergunta})
            resposta = resultado["answer"]
            salvar_conversa(nome, pergunta, resposta)
            return resposta
        
        # Fallback para o LLM puro
        resposta = llm.invoke(pergunta).content
        salvar_conversa(nome, pergunta, resposta)
        return resposta

    except Exception as e:
        return f"❌ Erro ao processar sua pergunta: {str(e)}"

def resetar_memoria():
    memoria.clear()
    return "✅ Memória da conversa foi resetada!"

def exportar_conversas():
    df = pd.read_sql_query("SELECT * FROM conversas ORDER BY timestamp DESC", conn)
    
    # Cria arquivos temporários
    with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as tmp_csv:
        df.to_csv(tmp_csv.name, index=False)
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp_xlsx:
        df.to_excel(tmp_xlsx.name, index=False, engine="openpyxl")
    
    return [tmp_csv.name, tmp_xlsx.name]

# Interface Gradio
with gr.Blocks(title="Tutor de ENEM - Hugging Face") as app:
    gr.Markdown("## 🤖 Tutor de ENEM - Busca em Múltiplos PDFs")
    
    with gr.Tab("📚 Upload de PDFs"):
        file_input = gr.File(label="Selecione os PDFs", file_count="multiple", file_types=[".pdf"])
        upload_button = gr.Button("Processar PDFs")
        upload_status = gr.Textbox(label="Status")
        upload_button.click(processar_pdfs, inputs=file_input, outputs=upload_status)
    
    with gr.Tab("💬 Conversar"):
        with gr.Row():
            nome = gr.Textbox(label="Seu nome (opcional)", placeholder="Ex: João")
            pergunta = gr.Textbox(label="Sua dúvida sobre o ENEM", placeholder="Ex: Como se preparar para o ENEM?")
        resposta = gr.Markdown(value="ℹ️ Aguardando sua pergunta...")
        
        with gr.Row():
            botao_enviar = gr.Button("Enviar", variant="primary")
            botao_resetar = gr.Button("🔁 Resetar Memória")
            botao_exportar = gr.Button("📤 Exportar Histórico")

        botao_enviar.click(fn=responder, inputs=[pergunta, nome], outputs=resposta)
        botao_resetar.click(fn=resetar_memoria, outputs=resposta)
        
        export_files = gr.Files(label="Arquivos exportados")
        botao_exportar.click(fn=exportar_conversas, outputs=export_files)

app.launch()