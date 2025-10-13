import { DocumentRecord } from "@/types/document";

const STORAGE_KEY = "documentHistory";

export const saveDocument = (document: DocumentRecord): void => {
  const history = getDocumentHistory();

  // Create a lightweight version for storage (exclude large image data)
  const documentForStorage = {
    ...document,
    imageData: undefined, // Remove original image data
    enhancedImageData: undefined, // Remove enhanced image data
  };

  history.unshift(documentForStorage);
  // Keep unlimited history - no limit on stored documents
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
};

export const getDocumentHistory = (): DocumentRecord[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const deleteDocument = (id: string): void => {
  const history = getDocumentHistory();
  const filtered = history.filter(doc => doc.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const clearHistory = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

