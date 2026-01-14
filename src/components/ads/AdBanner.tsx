interface AdBannerProps {
  size?: 'banner' | 'leaderboard' | 'rectangle' | 'skyscraper';
  className?: string;
}

const sizeClasses = {
  banner: 'h-16 md:h-20',
  leaderboard: 'h-24 md:h-28',
  rectangle: 'h-64 md:h-72',
  skyscraper: 'w-32 h-96',
};

export function AdBanner({ size = 'banner', className = '' }: AdBannerProps) {
  return (
    <div className={`adsense-placeholder ${sizeClasses[size]} ${className}`}>
      {/* Google AdSense will be injected here */}
      {/* Replace with actual AdSense code after approval */}
      <span className="text-xs">Advertisement</span>
    </div>
  );
}
