interface AdBannerProps {
  position?: 'top' | 'bottom' | 'sidebar' | 'content';
  size?: 'banner' | 'leaderboard' | 'rectangle' | 'skyscraper';
  className?: string;
}

const sizeClasses = {
  banner: 'h-16 md:h-20',
  leaderboard: 'h-24 md:h-28',
  rectangle: 'h-64 md:h-72',
  skyscraper: 'w-full h-64',
};

const positionSizes: Record<string, 'banner' | 'leaderboard' | 'rectangle' | 'skyscraper'> = {
  top: 'leaderboard',
  bottom: 'leaderboard',
  sidebar: 'rectangle',
  content: 'banner',
};

export function AdBanner({ position = 'top', size, className = '' }: AdBannerProps) {
  const effectiveSize = size || positionSizes[position] || 'banner';
  
  return (
    <div className={`adsense-placeholder ${sizeClasses[effectiveSize]} ${className}`}>
      {/* Google AdSense will be injected here */}
      {/* Replace with actual AdSense code after approval */}
      <span className="text-xs">Advertisement</span>
    </div>
  );
}
