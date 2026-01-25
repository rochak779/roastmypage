import { useState } from "react";
import { URLInput } from "@/components/URLInput";
import { RoastResults } from "@/components/RoastResults";
import { Flame, Zap, Target, TrendingDown } from "lucide-react";
import { roastPage, RoastItem } from "@/lib/api/roast";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    score: number;
    url: string;
    roasts: RoastItem[];
  } | null>(null);

  const handleSubmit = async (url: string) => {
    setIsLoading(true);
    
    try {
      const result = await roastPage(url);
      
      console.log("Roast result:", result);
      
      if (!result.success) {
        toast({
          title: "Roast Failed",
          description: result.error || "Failed to analyze the page. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      setResults({ 
        score: result.score || 50, 
        url: result.metadata?.url || url, 
        roasts: result.roasts || [] 
      });
    } catch (error) {
      console.error("Error roasting page:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted/20 via-background to-background pointer-events-none" />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-destructive" />
              <span className="font-mono font-bold text-lg">
                Roast<span className="text-destructive">My</span>Page
              </span>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 md:py-20">
          {!results ? (
            <div className="max-w-4xl mx-auto space-y-16">
              {/* Hero Section */}
              <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20">
                  <Flame className="w-4 h-4 text-destructive animate-flame" />
                  <span className="text-sm font-mono text-destructive">
                    Brutally Honest Feedback
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-mono font-bold leading-tight">
                  Find Out Why Your
                  <br />
                  <span className="text-destructive text-glow-pink">
                    Landing Page Sucks
                  </span>
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Get a brutally honest AI audit of your landing page. 
                  We'll tell you exactly where you're losing money and how to fix it.
                </p>
              </div>

              {/* URL Input */}
              <URLInput onSubmit={handleSubmit} isLoading={isLoading} />

              {/* Features */}
              <div className="grid md:grid-cols-3 gap-6 pt-8">
                <div className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors group">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-mono font-semibold mb-2">Instant Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Get comprehensive feedback in seconds, not hours.
                  </p>
                </div>
                
                <div className="p-6 rounded-lg bg-card border border-border hover:border-destructive/50 transition-colors group">
                  <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4 group-hover:bg-destructive/20 transition-colors">
                    <Target className="w-6 h-6 text-destructive" />
                  </div>
                  <h3 className="font-mono font-semibold mb-2">No Fluff</h3>
                  <p className="text-sm text-muted-foreground">
                    Just actionable insights that actually move the needle.
                  </p>
                </div>
                
                <div className="p-6 rounded-lg bg-card border border-border hover:border-accent/50 transition-colors group">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <TrendingDown className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-mono font-semibold mb-2">Stop Losing Money</h3>
                  <p className="text-sm text-muted-foreground">
                    Every flaw we find is a conversion you're missing.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <RoastResults 
              score={results.score}
              url={results.url}
              roasts={results.roasts}
              onReset={handleReset}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-border/50 mt-20">
          <div className="container mx-auto px-4 py-6">
            <p className="text-center text-sm text-muted-foreground font-mono">
              Built for founders who can handle the truth
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
