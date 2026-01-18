interface CoinIconProps {
  iconUrl?: string;
  symbol: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "primary";
  className?: string;
}

const sizeClasses = {
  sm: "w-5 h-5 text-[10px]",
  md: "w-8 h-8 text-xs",
  lg: "w-12 h-12 text-sm",
};

const variantClasses = {
  default: "bg-[#26A17B] text-white",
  primary: "bg-primary/20 text-primary",
};

export function CoinIcon({
  iconUrl,
  symbol,
  size = "md",
  variant = "default",
  className = "",
}: CoinIconProps) {
  const sizeClass = sizeClasses[size];
  const firstLetter = symbol.charAt(0).toUpperCase();

  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt={symbol}
        className={`${sizeClass} rounded-full ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full ${variantClasses[variant]} flex items-center justify-center font-bold ${className}`}
    >
      {firstLetter}
    </div>
  );
}
