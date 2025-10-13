import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy, PageViewport } from 'pdfjs-dist';

// Configure PDF.js worker - Use unpkg CDN for better compatibility
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export interface PDFPageImage {
  pageNumber: number;
  imageData: string;
}

export const extractPDFPages = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<PDFPageImage[]> => {
  console.log('🔍 Starting PDF extraction for:', file.name, 'Type:', file.type, 'Size:', file.size);
  
  try {
    console.log('📄 Reading file as ArrayBuffer...');
    const arrayBuffer = await file.arrayBuffer();
    console.log('✅ ArrayBuffer read successfully, size:', arrayBuffer.byteLength);
    
    console.log('📖 Loading PDF document...');
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf: PDFDocumentProxy = await loadingTask.promise;
    console.log('✅ PDF loaded successfully! Total pages:', pdf.numPages);
    
    const pageImages: PDFPageImage[] = [];
    const totalPages = pdf.numPages;

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      console.log(`📄 Processing page ${pageNum}/${totalPages}...`);
      
      const page: PDFPageProxy = await pdf.getPage(pageNum);
      console.log(`✅ Page ${pageNum} loaded`);
      
      const viewport: PageViewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
      console.log(`📐 Viewport size: ${viewport.width}x${viewport.height}`);
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Could not get canvas context');
      }

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      console.log(`🎨 Rendering page ${pageNum} to canvas...`);
      
      // Render the page with proper typing
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      } as const;
      
      await page.render(renderContext).promise;
      console.log(`✅ Page ${pageNum} rendered successfully`);
      
      const imageData = canvas.toDataURL('image/png');
      pageImages.push({
        pageNumber: pageNum,
        imageData,
      });
      console.log(`💾 Page ${pageNum} converted to image data`);

      if (onProgress) {
        onProgress((pageNum / totalPages) * 100);
      }
    }

    console.log('🎉 All pages extracted successfully!', pageImages.length, 'pages');
    return pageImages;
  } catch (error) {
    console.error('❌ PDF extraction error:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Provide more specific error messages
    let errorMessage = 'Failed to extract PDF. ';
    if (error instanceof Error) {
      if (error.message.includes('password') || error.message.includes('encrypted')) {
        errorMessage += 'The PDF appears to be password-protected. Please provide an unprotected PDF.';
      } else if (error.message.includes('InvalidPDFException') || error.message.includes('corrupt')) {
        errorMessage += 'The PDF file appears to be corrupted or invalid. Please try a different file.';
      } else if (error.message.includes('MissingPDFException')) {
        errorMessage += 'The PDF file could not be found or read. Please check the file and try again.';
      } else {
        errorMessage += `Error: ${error.message}`;
      }
    } else {
      errorMessage += 'An unknown error occurred while processing the PDF.';
    }

    throw new Error(errorMessage);
  }
};
