import { useState } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import UploadZone from "@/components/UploadZone";
import ProcessingView from "@/components/ProcessingView";
import ResultsView from "@/components/ResultsView";
import HistoryPanel from "@/components/HistoryPanel";
import { DocumentRecord } from "@/types/document";
import { performOCR, extractFields } from "@/utils/ocrProcessor";
import { enhanceImage } from "@/utils/imageEnhancer";
import { extractPDFPages } from "@/utils/pdfExtractor";
import { generatePDFReport } from "@/utils/pdfGenerator";
import { saveDocument, getDocumentHistory, deleteDocument } from "@/utils/documentStorage";
import { useToast } from "@/hooks/use-toast";
import heroBg from "@/assets/hero-bg.jpg";

type ProcessingStage = "enhancing" | "extracting" | "complete" | null;

const Index = () => {
  const [activeView, setActiveView] = useState("home");
  const [processingStage, setProcessingStage] = useState<ProcessingStage>(null);
  const [progress, setProgress] = useState(0);
  const [currentDocument, setCurrentDocument] = useState<DocumentRecord | null>(null);
  const [documentHistory, setDocumentHistory] = useState<DocumentRecord[]>(getDocumentHistory());
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    console.log('🎯 File selected:', file.name, 'Type:', file.type, 'Size:', file.size);
    
    try {
      setProcessingStage("enhancing");
      setProgress(0);

      let imagesToProcess: { imageData: string; pageNumber?: number }[] = [];

      // Check if it's a PDF or other supported formats
      if (file.type === 'application/pdf') {
        console.log('📑 PDF file detected, starting extraction...');
        
        toast({
          title: "Processing PDF",
          description: "Extracting pages from PDF document...",
        });

        try {
          const pdfPages = await extractPDFPages(file, (progress) => {
            setProgress(progress * 0.2); // PDF extraction is 20% of total progress
          });

          if (pdfPages.length === 0) {
            throw new Error('No pages found in PDF');
          }

          imagesToProcess = pdfPages.map(page => ({
            imageData: page.imageData,
            pageNumber: page.pageNumber,
          }));

          setPreviewImage(imagesToProcess[0].imageData);
          
          toast({
            title: "PDF Extracted",
            description: `Found ${pdfPages.length} page(s) to analyze`,
          });
        } catch (error) {
          console.error("PDF extraction error:", error);
          toast({
            title: "PDF Error",
            description: error instanceof Error ? error.message : "Failed to extract PDF. Please try a different file.",
            variant: "destructive",
          });
          setProcessingStage(null);
          return;
        }
      } else if (file.type.startsWith('image/')) {
        // Handle image files (PNG, JPG, JPEG, etc.)
        const reader = new FileReader();
        const imageData = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        imagesToProcess = [{ imageData }];
        setPreviewImage(imageData);
      } else {
        throw new Error(`Unsupported file type: ${file.type}. Please upload a PDF or image file (PNG, JPG, JPEG, etc.).`);
      }

      // Process all images/pages
      setProcessingStage("enhancing");
      const allExtractedText: string[] = [];
      const allFields: Array<{ label: string; value: string; confidence: number }> = [];
      let totalConfidence = 0;
      let enhancedPreview = imagesToProcess[0].imageData;

      for (let i = 0; i < imagesToProcess.length; i++) {
        const { imageData, pageNumber } = imagesToProcess[i];
        const baseProgress = 20 + (i / imagesToProcess.length) * 80;

        toast({
          title: pageNumber ? `Processing Page ${pageNumber}` : "Processing Image",
          description: `Analyzing ${i + 1} of ${imagesToProcess.length}...`,
        });

        try {
          // Enhance image
          const enhancedImage = await enhanceImage(imageData);
          if (i === 0) {
            enhancedPreview = enhancedImage;
            setPreviewImage(enhancedImage);
          }
          setProgress(baseProgress + 10);

          // Perform OCR
          setProcessingStage("extracting");
          const { text, confidence } = await performOCR(enhancedImage, (ocrProgress) => {
            setProgress(baseProgress + 10 + (ocrProgress.progress * 0.6));
          });

          // Extract fields from this page
          const pageFields = extractFields(text);

          // Combine results
          if (pageNumber) {
            allExtractedText.push(`=== Page ${pageNumber} ===\n${text}\n`);
          } else {
            allExtractedText.push(text);
          }
          
          allFields.push(...pageFields);
          totalConfidence += confidence;

        } catch (error) {
          console.error(`Error processing page ${pageNumber || i + 1}:`, error);
          // Continue processing other pages instead of failing completely
          console.warn(`Page ${pageNumber || i + 1} processing failed:`, error);
          allExtractedText.push(`\n=== Page ${pageNumber || i + 1} - Processing Error ===\n`);
          // Add a placeholder confidence for failed pages
          totalConfidence += 0;
        }
      }

      const avgConfidence = totalConfidence / imagesToProcess.length;

      // Create document record
      const document: DocumentRecord = {
        id: Date.now().toString(),
        fileName: file.name,
        fileType: file.type,
        timestamp: Date.now(),
        extractedText: allExtractedText.join('\n\n'),
        confidence: avgConfidence,
        fields: allFields.filter((field, index, self) => 
          index === self.findIndex((f) => f.label === field.label && f.value === field.value)
        ), // Remove duplicates
        imageData: imagesToProcess[0].imageData,
        enhancedImageData: enhancedPreview,
      };

      // Save to history
      saveDocument(document);
      setDocumentHistory(getDocumentHistory());

      // Show results
      setProcessingStage("complete");
      setProgress(100);
      setCurrentDocument(document);

      toast({
        title: "Success!",
        description: `Processed ${imagesToProcess.length} page(s) successfully`,
      });

      // Auto-transition to results after a brief delay
      setTimeout(() => {
        setProcessingStage(null);
      }, 1000);
    } catch (error) {
      console.error("Processing error:", error);
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process document. Please try again with a different file.",
        variant: "destructive",
      });
      setProcessingStage(null);
      setProgress(0);
    }
  };

  const handleDownloadReport = (doc: DocumentRecord) => {
    generatePDFReport(doc);
    toast({
      title: "Download Started",
      description: "Your report is being generated",
    });
  };

  const handleDeleteDocument = (id: string) => {
    deleteDocument(id);
    setDocumentHistory(getDocumentHistory());
    toast({
      title: "Deleted",
      description: "Document removed from history",
    });
  };

  const handleNewAnalysis = () => {
    setCurrentDocument(null);
    setPreviewImage(null);
    setActiveView("home");
  };

  const handleSelectDocument = (doc: DocumentRecord) => {
    setCurrentDocument(doc);
    setActiveView("home");
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-dark" />
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Navigation activeView={activeView} onViewChange={setActiveView} />

        <main className="container mx-auto px-6 pt-24 pb-12">
          {/* Home View */}
          {activeView === "home" && (
            <div className="space-y-8">
              {!processingStage && !currentDocument && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-12"
                >
                  <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                    Transform Documents with{" "}
                    <span className="text-primary">AI Intelligence</span>
                  </h2>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Upload any document and let AI extract, enhance, and analyze the content
                    instantly—all in your browser
                  </p>
                </motion.div>
              )}

              {processingStage ? (
                <ProcessingView
                  stage={processingStage}
                  progress={progress}
                  preview={previewImage || undefined}
                />
              ) : currentDocument ? (
                <ResultsView
                  document={currentDocument}
                  onDownload={() => handleDownloadReport(currentDocument)}
                  onNewAnalysis={handleNewAnalysis}
                />
              ) : (
                <UploadZone onFileSelect={handleFileSelect} />
              )}
            </div>
          )}

          {/* History View */}
          {activeView === "history" && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Document History
                </h2>
                <p className="text-muted-foreground">
                  View and manage your analyzed documents
                </p>
              </div>

              <HistoryPanel
                documents={documentHistory}
                onSelectDocument={handleSelectDocument}
                onDeleteDocument={handleDeleteDocument}
                onDownloadDocument={handleDownloadReport}
              />
            </div>
          )}

          {/* Reports View */}
          {activeView === "reports" && (
            <div className="text-center py-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 inline-block mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    ⚡
                  </motion.div>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-foreground">
                  Advanced Analytics Coming Soon
                </h3>
                <p className="text-muted-foreground">
                  Statistical insights and batch processing features
                </p>
              </motion.div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
