Dica ENEM - Plataforma de Estudos Focada em Incidência de Conteúdo
🎯 Descrição do Projeto
O DICA ENEM é uma plataforma frontend desenvolvida para auxiliar estudantes na preparação para o Exame Nacional do Ensino Médio (ENEM). O principal objetivo é fornecer informações sobre os conteúdos que tiveram maior incidência nas provas do ENEM entre os anos de 2009 e 2020, permitindo que os alunos organizem seus estudos de forma mais estratégica e eficiente.
A aplicação apresenta dados estatísticos por matéria, tópicos mais recorrentes e referências a materiais didáticos (originalmente SAS, mas adaptável). Além disso, inclui uma funcionalidade para que o usuário possa adicionar seus próprios materiais de estudo em formato PDF, associando-os às respectivas matérias para consulta e organização pessoal.
✨ Funcionalidades Principais

    Visualização de Incidência: Apresenta estatísticas detalhadas sobre a frequência de conteúdos por matéria no ENEM (2009-2020).
    Detalhes por Matéria: Permite explorar os tópicos mais importantes dentro de cada disciplina.
    Gerenciamento de Materiais PDF (Frontend):
        Upload (referência) de arquivos PDF para matérias específicas (Português, Matemática, etc.).
        Listagem dos materiais carregados por matéria.
        Remoção de materiais.
        Observação: Esta funcionalidade, na versão atual, armazena apenas metadados dos arquivos (nome, tipo, matéria associada) no localStorage do navegador. Os arquivos PDF em si não são armazenados na aplicação.
    Links para Criação de Plano de Estudos e Simulados (Estrutura): Interface preparada para futuras integrações com ferramentas de planejamento e testes.
    Design Responsivo: Interface adaptada para visualização em diferentes dispositivos.

🛠️ Tecnologias Utilizadas

    React: Biblioteca JavaScript para construção da interface de usuário.
    React Router DOM: Para gerenciamento de rotas na aplicação single-page.
    Tailwind CSS: Framework CSS utility-first para estilização rápida e customizável.
    Lucide Icons: Biblioteca de ícones SVG leves e customizáveis.
    JavaScript (ES6+): Linguagem base para a lógica da aplicação.
    HTML5 e CSS3: Estrutura e estilização.
    uuid: Para geração de identificadores únicos para os materiais PDF.

🚀 Configuração e Instalação
Para rodar este projeto localmente, siga os passos abaixo:

    Clone o repositório:
    bash

git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio

Instale as dependências:
Recomenda-se o uso de npm ou yarn. Certifique-se de ter o Node.js instalado.
bash

npm install
# ou
yarn install

Configure os dados das matérias:
Os dados das matérias e seus tópicos são geralmente definidos em um arquivo como src/data/subjectData.js. Verifique e ajuste conforme necessário.
O componente PdfUploadManager.jsx e localStorageService.js devem ser colocados em um local apropriado no seu projeto (ex: src/components/ ou src/services/)  e importados corretamente.
Inicie o servidor de desenvolvimento:
bash

    npm start
    # ou
    yarn start

    A aplicação deverá abrir automaticamente no seu navegador padrão, geralmente em http://localhost:3000.

📚 Como Utilizar o Gerenciador de Materiais PDF

    Navegue até a seção/página onde o componente PdfUploadManager foi integrado.
    Selecione a matéria desejada no menu dropdown (ex: Português, Matemática) .
    Clique em "Escolher arquivo" e selecione um arquivo PDF do seu computador.
    Clique no botão "Adicionar Material à Matéria".
    Os metadados do arquivo (nome, tamanho) serão listados abaixo, associados à matéria selecionada.
    Você pode remover um material clicando no botão "Remover" ao lado dele.

Lembrete: Esta funcionalidade é para organização pessoal no navegador e não faz upload dos arquivos para um servidor.
☁️ Opções de Deploy (Hospedagem)
Como esta é uma aplicação frontend estática (após o build), você pode hospedá-la gratuitamente ou a baixo custo em diversas plataformas:

    Vercel: Excelente integração com Git, deploys automáticos, HTTPS gratuito.
    Netlify: Similar à Vercel, com um ótimo plano gratuito e funcionalidades robustas.
    GitHub Pages: Solução gratuita e integrada para projetos hospedados no GitHub.
    Firebase Hosting: Oferece um plano gratuito com CDN global.

Para fazer o deploy:

    Execute o comando de build do seu projeto React:
    bash

    npm run build
    # ou
    yarn build

    Siga as instruções da plataforma de hospedagem escolhida para fazer o upload da pasta de build (geralmente build ou dist).

🔮 Possíveis Melhorias Futuras

    Integração com IndexedDB para permitir o armazenamento local dos arquivos PDF no navegador do usuário.
    Desenvolvimento de um backend para armazenamento persistente de arquivos e dados dos usuários.
    Funcionalidade de criação de planos de estudo personalizados.
    Módulo de simulados interativos.
    Autenticação de usuários.

🙏 Agradecimentos
Este projeto foi inspirado na necessidade de fornecer ferramentas eficazes para estudantes do ENEM. Agradecimentos especiais aos professores e colaboradores que contribuíram para o levantamento de dados de incidência (conforme mencionado na seção "Agradecimentos Especiais" da aplicação original).
