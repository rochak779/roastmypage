import { ScoreCircle } from "./ScoreCircle";
import { RoastCard } from "./RoastCard";
import { Button } from "@/components/ui/button";
import { RotateCcw, ExternalLink } from "lucide-react";

interface RoastItem {
  category: string;
  title: string;
  description: string;
  severity: "critical" | "warning" | "good";
}

interface RoastResultsProps {
  score: number;
  url: string;
  roasts: RoastItem[];
  onReset: () => void;
}

export const RoastResults = ({ score, url, roasts, onReset }: RoastResultsProps) => {
  const getVerdict = () => {
    if (score >= 70) return "Not bad! But there's always room for improvement.";
    if (score >= 40) return "Mediocre. You're leaving money on the table.";
    return "Brutal. This page needs serious work.";
  };

  const criticalCount = roasts.filter(r => r.severity === "critical").length;
  const warningCount = roasts.filter(r => r.severity === "warning").length;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
          <ExternalLink className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-mono text-muted-foreground truncate max-w-[300px]">
            {url}
          </span>
        </div>
      </div>

      {/* Score Section */}
      <div className="flex flex-col items-center gap-6 py-8">
        <h2 className="text-2xl font-mono font-bold text-foreground">
          Brutal Honesty Score
        </h2>
        <ScoreCircle score={score} size={220} />
        <p className="text-lg text-muted-foreground text-center max-w-md font-mono">
          {getVerdict()}
        </p>
        
        {/* Quick Stats */}
        <div className="flex gap-6 mt-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
            <span className="text-sm font-mono text-muted-foreground">
              {criticalCount} Critical
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-sm font-mono text-muted-foreground">
              {warningCount} Warnings
            </span>
          </div>
        </div>
      </div>

      {/* Roast Cards */}
      <div className="space-y-4">
        <h3 className="text-xl font-mono font-bold text-foreground mb-6">
          The Roast 🔥
        </h3>
        <div className="grid gap-4">
          {roasts.map((roast, index) => (
            <RoastCard
              key={index}
              category={roast.category}
              title={roast.title}
              description={roast.description}
              severity={roast.severity}
              delay={index * 100}
            />
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <div className="flex justify-center pt-8">
        <Button 
          variant="outline" 
          size="lg" 
          onClick={onReset}
          className="group"
        >
          <RotateCcw className="w-4 h-4 mr-2 group-hover:rotate-[-360deg] transition-transform duration-500" />
          Roast Another Page
        </Button>
      </div>
    </div>
  );
};
