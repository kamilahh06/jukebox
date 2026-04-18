import React from "react"
interface SectionHeaderProps {
  label: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ label, title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <span className="glow-chip mb-3 inline-block">{label}</span>
        <h2 className="headline-chrome font-display text-xl md:text-2xl font-semibold tracking-wide">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
