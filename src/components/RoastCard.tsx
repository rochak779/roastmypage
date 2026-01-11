import { AlertTriangle, XCircle, CheckCircle, Flame } from "lucide-react";

type Severity = "critical" | "warning" | "good";

interface RoastCardProps {
  category: string;
  title: string;
  description: string;
  severity: Severity;
  delay?: number;
}

export const RoastCard = ({ 
  category, 
  title, 
  description, 
  severity,
  delay = 0 
}: RoastCardProps) => {
  const getSeverityStyles = () => {
    switch (severity) {
      case "critical":
        return {
          border: "border-destructive/50",
          bg: "bg-destructive/5",
          icon: <XCircle className="w-5 h-5 text-destructive" />,
          badge: "bg-destructive/20 text-destructive border-destructive/30",
          glow: "hover:box-glow-pink"
        };
      case "warning":
        return {
          border: "border-accent/50",
          bg: "bg-accent/5",
          icon: <AlertTriangle className="w-5 h-5 text-accent" />,
          badge: "bg-accent/20 text-accent border-accent/30",
          glow: "hover:box-glow-amber"
        };
      case "good":
        return {
          border: "border-primary/50",
          bg: "bg-primary/5",
          icon: <CheckCircle className="w-5 h-5 text-primary" />,
          badge: "bg-primary/20 text-primary border-primary/30",
          glow: "hover:box-glow"
        };
    }
  };

  const styles = getSeverityStyles();

  return (
    <div 
      className={`
        p-5 rounded-lg border-2 ${styles.border} ${styles.bg} 
        transition-all duration-300 ${styles.glow}
      `}
    >
      <div className="flex items-start gap-4">
        <div className="mt-0.5">
          {styles.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className={`
              text-xs font-mono uppercase tracking-wider px-2 py-1 
              rounded border ${styles.badge}
            `}>
              {category}
            </span>
          </div>
          <h3 className="font-mono font-semibold text-foreground mb-2 flex items-center gap-2">
            {title}
            {severity === "critical" && (
              <Flame className="w-4 h-4 text-destructive animate-flame" />
            )}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};
