import { motion } from "framer-motion";
import { Download, Sparkles, FileText, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { DocumentRecord } from "@/types/document";
import { Badge } from "./ui/badge";

interface ResultsViewProps {
  document: DocumentRecord;
  onDownload: () => void;
  onNewAnalysis: () => void;
}

const ResultsView = ({ document, onDownload, onNewAnalysis }: ResultsViewProps) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-500";
    if (confidence >= 70) return "text-yellow-500";
    return "text-orange-500";
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) return "High";
    if (confidence >= 70) return "Medium";
    return "Low";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Enhanced Image */}
        <Card className="glass border-white/10 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-bold text-foreground">Enhanced Image</h3>
          </div>

          <div className="rounded-xl overflow-hidden border border-white/10 bg-card/30">
            <img
              src={document.enhancedImageData || document.imageData}
              alt="Enhanced document"
              className="w-full h-96 object-contain"
            />
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>{document.fileName}</span>
            <span>{new Date(document.timestamp).toLocaleDateString()}</span>
          </div>
        </Card>

        {/* Right: Extracted Results */}
        <div className="space-y-6">
          {/* Confidence Score */}
          <Card className="glass border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold text-foreground">Confidence Score</h3>
              </div>
              <Badge variant="outline" className={getConfidenceColor(document.confidence)}>
                {getConfidenceBadge(document.confidence)}
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className={`text-5xl font-bold ${getConfidenceColor(document.confidence)}`}>
                {document.confidence.toFixed(1)}%
              </div>
              <div className="flex-1">
                <div className="h-2 rounded-full bg-card/50 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${document.confidence}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${
                      document.confidence >= 90 
                        ? "bg-green-500" 
                        : document.confidence >= 70 
                        ? "bg-yellow-500" 
                        : "bg-orange-500"
                    }`}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Extracted Fields */}
          {document.fields && document.fields.length > 0 && (
            <Card className="glass border-white/10 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold text-foreground">Extracted Fields</h3>
              </div>

              <div className="space-y-3">
                {document.fields.map((field, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 rounded-lg bg-card/30 border border-white/5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-1">
                          {field.label}
                        </div>
                        <div className="text-foreground font-medium">
                          {field.value}
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {field.confidence}%
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          )}

          {/* Full Extracted Text */}
          <Card className="glass border-white/10 p-6">
            <h3 className="text-xl font-bold mb-4 text-foreground">Full Text</h3>
            <div className="max-h-64 overflow-y-auto p-4 rounded-lg bg-card/30 border border-white/5">
              <pre className="text-sm text-foreground whitespace-pre-wrap font-mono">
                {document.extractedText || "No text extracted"}
              </pre>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={onDownload}
              className="flex-1 bg-gradient-primary text-white font-semibold glow"
              size="lg"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
            <Button
              onClick={onNewAnalysis}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <FileText className="w-4 h-4 mr-2" />
              Analyze Again
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultsView;
