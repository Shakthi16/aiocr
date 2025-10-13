import { motion } from "framer-motion";
import { FileText, Trash2, Download, Search } from "lucide-react";
import { DocumentRecord } from "@/types/document";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useState } from "react";

interface HistoryPanelProps {
  documents: DocumentRecord[];
  onSelectDocument: (document: DocumentRecord) => void;
  onDeleteDocument: (id: string) => void;
  onDownloadDocument: (document: DocumentRecord) => void;
}

const HistoryPanel = ({
  documents,
  onSelectDocument,
  onDeleteDocument,
  onDownloadDocument,
}: HistoryPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocuments = documents.filter((doc) =>
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.extractedText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (documents.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-20"
      >
        <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 inline-block mb-4">
          <FileText className="w-12 h-12 text-primary" />
        </div>
        <h3 className="text-2xl font-bold mb-2 text-foreground">No Documents Yet</h3>
        <p className="text-muted-foreground">
          Upload and analyze documents to see them here
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-6xl mx-auto"
    >
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 glass border-white/10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((doc, index) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="glass border-white/10 p-4 hover:border-primary/50 transition-all cursor-pointer group">
              <div onClick={() => onSelectDocument(doc)}>
                {doc.imageData && (
                  <div className="mb-3 rounded-lg overflow-hidden border border-white/10">
                    <img
                      src={doc.imageData}
                      alt={doc.fileName}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}

                <div className="flex items-start gap-2 mb-2">
                  <FileText className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground truncate">
                      {doc.fileName}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {new Date(doc.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {doc.extractedText || "No text extracted"}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={
                      doc.confidence >= 90
                        ? "text-green-500"
                        : doc.confidence >= 70
                        ? "text-yellow-500"
                        : "text-orange-500"
                    }
                  >
                    {doc.confidence.toFixed(1)}% confidence
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownloadDocument(doc);
                  }}
                >
                  <Download className="w-3 h-3 mr-1" />
                  PDF
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteDocument(doc.id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredDocuments.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No documents match your search</p>
        </div>
      )}
    </motion.div>
  );
};

export default HistoryPanel;
