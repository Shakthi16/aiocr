export interface DocumentRecord {
  id: string;
  fileName: string;
  fileType: string;
  timestamp: number;
  extractedText: string;
  confidence: number;
  fields?: ExtractedField[];
  imageData?: string;
  enhancedImageData?: string;
}

export interface ExtractedField {
  label: string;
  value: string;
  confidence: number;
}

export interface OCRProgress {
  status: string;
  progress: number;
}
