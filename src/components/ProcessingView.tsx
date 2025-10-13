import { motion } from "framer-motion";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { Progress } from "./ui/progress";

interface ProcessingViewProps {
  stage: "enhancing" | "extracting" | "complete";
  progress: number;
  preview?: string;
}

const ProcessingView = ({ stage, progress, preview }: ProcessingViewProps) => {
  const getStageInfo = () => {
    switch (stage) {
      case "enhancing":
        return {
          title: "Enhancing Image",
          description: "Optimizing clarity and contrast for better extraction",
          icon: Sparkles,
          color: "text-primary",
        };
      case "extracting":
        return {
          title: "Extracting Text",
          description: "AI is analyzing and extracting document content",
          icon: Loader2,
          color: "text-primary",
        };
      case "complete":
        return {
          title: "Processing Complete",
          description: "Document has been successfully analyzed",
          icon: CheckCircle2,
          color: "text-green-500",
        };
    }
  };

  const info = getStageInfo();
  const Icon = info.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="glass rounded-2xl p-8 border border-white/10">
        {preview && (
          <div className="mb-6 rounded-xl overflow-hidden border border-white/10">
            <img
              src={preview}
              alt="Document preview"
              className="w-full h-64 object-contain bg-card/50"
            />
          </div>
        )}

        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
              <Icon
                className={`w-8 h-8 ${info.color} ${
                  stage !== "complete" ? "animate-spin" : ""
                }`}
              />
            </div>
          </div>

          <h3 className="text-2xl font-bold mb-2 text-foreground">
            {info.title}
          </h3>
          <p className="text-muted-foreground">{info.description}</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-primary font-semibold">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {stage === "extracting" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-sm text-muted-foreground"
          >
            This may take a few moments depending on document complexity...
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ProcessingView;
