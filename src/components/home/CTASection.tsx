import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-hero relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--secondary)/0.3),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,hsl(var(--accent)/0.2),transparent_60%)]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 text-primary-foreground text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Start Your Learning Journey Today
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary-foreground mb-6 leading-tight">
            Ready to Transform Your Skills?
          </h2>

          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 leading-relaxed">
            Join over 50,000 learners who are already advancing their careers 
            with our free courses. Your success story starts here.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-accent hover:bg-accent-light text-accent-foreground shadow-accent text-lg px-8">
              <Link to="/signup">
                Create Free Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-lg px-8">
              <Link to="/courses">
                Browse Courses
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
