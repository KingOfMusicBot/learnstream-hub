import { Link } from 'react-router-dom';
import { ArrowRight, Play, Users, BookOpen, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdBanner } from '@/components/ads/AdBanner';

export function HeroSection() {
  const stats = [
    { icon: Users, value: '50,000+', label: 'Active Learners' },
    { icon: BookOpen, value: '200+', label: 'Free Courses' },
    { icon: Award, value: '95%', label: 'Success Rate' },
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-hero opacity-5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--secondary)/0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent)/0.1),transparent_50%)]" />

      {/* Top Ad Banner */}
      <div className="container mx-auto px-4 pt-4">
        <AdBanner size="leaderboard" className="max-w-4xl mx-auto" />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              100% Free Courses
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight">
              Master New Skills with{' '}
              <span className="text-gradient">Free Education</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              Access premium-quality courses without spending a dime. 
              Learn from industry experts and transform your career today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-gradient-hero hover:opacity-90 shadow-glow text-lg px-8">
                <Link to="/courses">
                  Explore Courses
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 group">
                <Link to="/signup">
                  <Play className="w-5 h-5 mr-2 group-hover:text-secondary transition-colors" />
                  Start Learning
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
              {stats.map((stat, index) => (
                <div key={index} className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <stat.icon className="w-5 h-5 text-secondary" />
                    <span className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="relative hidden lg:block animate-fade-in">
            <div className="relative z-10">
              <div className="absolute -inset-4 bg-gradient-hero rounded-3xl opacity-20 blur-2xl" />
              <div className="relative bg-card rounded-2xl shadow-xl overflow-hidden border border-border">
                <div className="aspect-video bg-gradient-hero flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-primary-foreground/20 backdrop-blur flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-primary-foreground ml-1" />
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-muted" />
                    <div>
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="h-3 w-20 bg-muted rounded mt-2" />
                    </div>
                  </div>
                  <div className="h-3 w-full bg-muted rounded" />
                  <div className="h-3 w-3/4 bg-muted rounded" />
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/20 rounded-full blur-xl animate-float" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-secondary/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />
          </div>
        </div>
      </div>
    </section>
  );
}
