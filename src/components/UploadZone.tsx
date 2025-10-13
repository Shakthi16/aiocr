import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Image } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
}

const UploadZone = ({ onFileSelect }: UploadZoneProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".bmp"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div
        {...getRootProps()}
        className={`
          relative overflow-hidden rounded-2xl glass border-2 border-dashed
          transition-all duration-300 cursor-pointer
          ${isDragActive 
            ? "border-primary glow-strong scale-105" 
            : "border-white/20 hover:border-primary/50 hover:glow"
          }
        `}
      >
        <input {...getInputProps()} />

        <div className="p-12 text-center">
          <motion.div
            animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
            className="mb-6 flex justify-center"
          >
            <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20">
              <Upload className="w-12 h-12 text-primary" />
            </div>
          </motion.div>

          <h3 className="text-2xl font-bold mb-2 text-foreground">
            {isDragActive ? "Drop your document here" : "Upload Document"}
          </h3>

          <p className="text-muted-foreground mb-6">
            Drag and drop or click to select a file
          </p>

          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/50">
              <Image className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground">Images</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/50">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground">PDF</span>
            </div>
          </div>

          <Button
            className="bg-gradient-primary text-white font-semibold glow"
            size="lg"
          >
            Choose File
          </Button>

          <p className="mt-4 text-xs text-muted-foreground">
            Supported formats: PNG, JPG, JPEG, GIF, BMP, PDF • Max 20MB
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default UploadZone;
