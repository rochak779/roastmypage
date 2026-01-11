import { useEffect, useState } from "react";

interface ScoreCircleProps {
  score: number;
  size?: number;
}

export const ScoreCircle = ({ score, size = 200 }: ScoreCircleProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  // Determine color based on score
  const getScoreColor = () => {
    if (score >= 70) return "stroke-primary";
    if (score >= 40) return "stroke-accent";
    return "stroke-destructive";
  };

  const getGlowClass = () => {
    if (score >= 70) return "text-glow";
    if (score >= 40) return "text-glow-amber";
    return "text-glow-pink";
  };

  const getTextColor = () => {
    if (score >= 70) return "text-primary";
    if (score >= 40) return "text-accent";
    return "text-destructive";
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        {/* Animated score circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={`${getScoreColor()} transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            filter: score >= 70 
              ? "drop-shadow(0 0 10px hsl(150 100% 50% / 0.5))"
              : score >= 40
              ? "drop-shadow(0 0 10px hsl(35 100% 55% / 0.5))"
              : "drop-shadow(0 0 10px hsl(340 100% 50% / 0.5))"
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-5xl font-mono font-bold ${getTextColor()} ${getGlowClass()}`}>
          {animatedScore}
        </span>
        <span className="text-sm text-muted-foreground font-mono uppercase tracking-widest mt-1">
          / 100
        </span>
      </div>
    </div>
  );
};
