/**
 * localStorageService.js
 * 
 * Este serviço encapsula a lógica para interagir com o localStorage
 * para armazenar e recuperar informações sobre os materiais em PDF carregados.
 */

const MATERIALS_KEY = "userUploadedMaterials";

/**
 * Recupera todos os materiais carregados do localStorage.
 * @returns {Array} Uma lista de objetos de material, ou um array vazio se nada for encontrado.
 */
export const getUploadedMaterials = () => {
  try {
    const materials = localStorage.getItem(MATERIALS_KEY);
    return materials ? JSON.parse(materials) : [];
  } catch (error) {
    console.error("Erro ao recuperar materiais do localStorage:", error);
    return [];
  }
};

/**
 * Adiciona um novo material à lista no localStorage.
 * @param {Object} material - O objeto do material a ser adicionado.
 *                           Ex: { id: string, fileName: string, subjectId: string, fileSize: number, fileType: string, uploadedAt: string }
 */
export const addUploadedMaterial = (material) => {
  try {
    const materials = getUploadedMaterials();
    materials.push(material);
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(materials));
  } catch (error) {
    console.error("Erro ao adicionar material ao localStorage:", error);
  }
};

/**
 * Remove um material da lista no localStorage pelo seu ID.
 * @param {string} materialId - O ID do material a ser removido.
 */
export const removeUploadedMaterial = (materialId) => {
  try {
    let materials = getUploadedMaterials();
    materials = materials.filter(material => material.id !== materialId);
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(materials));
  } catch (error) {
    console.error("Erro ao remover material do localStorage:", error);
  }
};

/**
 * Recupera materiais para uma matéria específica.
 * @param {string} subjectId - O ID da matéria.
 * @returns {Array} Uma lista de materiais para a matéria especificada.
 */
export const getMaterialsForSubject = (subjectId) => {
  const materials = getUploadedMaterials();
  return materials.filter(material => material.subjectId === subjectId);
};

