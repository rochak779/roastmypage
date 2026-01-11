import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Flame, Loader2 } from "lucide-react";

interface URLInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export const URLInput = ({ onSubmit, isLoading }: URLInputProps) => {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-landing-page.com"
            className="h-14 text-base pr-4 bg-card"
            required
            disabled={isLoading}
          />
        </div>
        <Button 
          type="submit" 
          variant="roast" 
          size="xl"
          disabled={isLoading || !url.trim()}
          className="group"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Roasting...
            </>
          ) : (
            <>
              <Flame className="w-5 h-5 group-hover:animate-flame" />
              Roast It
            </>
          )}
        </Button>
      </div>
      <p className="text-center text-muted-foreground text-sm mt-4 font-mono">
        Paste your landing page URL and get brutally honest feedback
      </p>
    </form>
  );
};
