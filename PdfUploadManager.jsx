import React, { useState, useEffect, useCallback } from 'react';
import { subjects } from "@/data/subjectData"; // Assumindo que este caminho é válido no seu projeto
import { addUploadedMaterial, getMaterialsForSubject, removeUploadedMaterial } from './localStorageService'; // Ajuste o caminho se necessário
import { v4 as uuidv4 } from 'uuid'; // Para gerar IDs únicos

// Estilos básicos (podem ser substituídos por Tailwind CSS ou sua biblioteca de UI)
const styles = {
  container: { padding: '20px', fontFamily: 'Arial, sans-serif' },
  heading: { color: '#333' },
  formGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' },
  select: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' },
  input: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' },
  button: { padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' },
  removeButton: { padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8em' },
  list: { listStyleType: 'none', padding: 0 },
  listItem: { padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  fileInfo: { fontSize: '0.9em', color: '#555' },
  errorMessage: { color: 'red', marginTop: '10px' }
};

const PdfUploadManager = () => {
  const [selectedSubject, setSelectedSubject] = useState(subjects.length > 0 ? subjects[0].id : '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedMaterials, setUploadedMaterials] = useState([]);
  const [error, setError] = useState('');

  // Carrega os materiais da matéria selecionada ao montar o componente ou quando a matéria muda
  const loadMaterials = useCallback(() => {
    if (selectedSubject) {
      const materials = getMaterialsForSubject(selectedSubject);
      setUploadedMaterials(materials);
    }
  }, [selectedSubject]);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setError('');
    } else {
      setSelectedFile(null);
      setError('Por favor, selecione um arquivo PDF.');
    }
  };

  const handleSubjectChange = (event) => {
    setSelectedSubject(event.target.value);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setError('Nenhum arquivo PDF selecionado.');
      return;
    }
    if (!selectedSubject) {
      setError('Nenhuma matéria selecionada.');
      return;
    }

    const newMaterial = {
      id: uuidv4(), // Gera um ID único para o material
      fileName: selectedFile.name,
      subjectId: selectedSubject,
      fileSize: selectedFile.size,
      fileType: selectedFile.type,
      uploadedAt: new Date().toISOString(),
      // Nota: O arquivo em si NÃO é armazenado no localStorage devido a limitações.
      // Apenas os metadados são salvos.
      // Para armazenar o arquivo, seria necessário IndexedDB ou upload para um servidor.
    };

    addUploadedMaterial(newMaterial);
    setSelectedFile(null); // Limpa o input de arquivo
    document.getElementById('pdf-file-input').value = null; // Reseta o campo de input
    setError('');
    loadMaterials(); // Recarrega a lista de materiais para a matéria atual
  };

  const handleRemoveMaterial = (materialId) => {
    removeUploadedMaterial(materialId);
    loadMaterials(); // Recarrega a lista
  };

  if (subjects.length === 0) {
    return <div style={styles.container}><p>Nenhuma matéria configurada. Por favor, adicione matérias em `subjectData`.</p></div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Gerenciador de Materiais PDF (Frontend)</h2>
      
      <div style={styles.formGroup}>
        <label htmlFor="subject-select" style={styles.label}>Selecione a Matéria:</label>
        <select id="subject-select" value={selectedSubject} onChange={handleSubjectChange} style={styles.select}>
          {subjects.map(subject => (
            <option key={subject.id} value={subject.id}>{subject.title}</option>
          ))}
        </select>
      </div>

      <div style={styles.formGroup}>
        <label htmlFor="pdf-file-input" style={styles.label}>Selecione o arquivo PDF:</label>
        <input 
          type="file" 
          id="pdf-file-input"
          accept=".pdf" 
          onChange={handleFileChange} 
          style={styles.input} 
        />
      </div>

      <button onClick={handleUpload} style={styles.button}>Adicionar Material à Matéria</button>

      {error && <p style={styles.errorMessage}>{error}</p>}

      <h3 style={{...styles.heading, marginTop: '30px'}}>Materiais Carregados para: {subjects.find(s => s.id === selectedSubject)?.title || 'N/A'}</h3>
      {uploadedMaterials.length === 0 ? (
        <p>Nenhum material PDF carregado para esta matéria ainda.</p>
      ) : (
        <ul style={styles.list}>
          {uploadedMaterials.map(material => (
            <li key={material.id} style={styles.listItem}>
              <div>
                <strong>{material.fileName}</strong>
                <br />
                <span style={styles.fileInfo}>
                  Tamanho: {(material.fileSize / 1024).toFixed(2)} KB - 
                  Carregado em: {new Date(material.uploadedAt).toLocaleDateString()}
                </span>
              </div>
              <button onClick={() => handleRemoveMaterial(material.id)} style={styles.removeButton}>Remover</button>
            </li>
          ))}
        </ul>
      )}
      <div style={{marginTop: '20px', fontSize: '0.9em', color: '#666'}}>
        <p><strong>Nota Importante:</strong> Este componente demonstra o upload e gerenciamento de referências a arquivos PDF no frontend usando o localStorage. Os arquivos PDF em si <strong>não são armazenados</strong> no navegador devido a limitações de tamanho do localStorage. Para uma solução completa, seria necessário integrar com IndexedDB para armazenamento local de arquivos maiores ou um sistema de backend para upload e persistência de arquivos.</p>
      </div>
    </div>
  );
};

export default PdfUploadManager;

