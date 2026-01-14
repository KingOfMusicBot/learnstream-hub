import { 
  GraduationCap, 
  Clock, 
  Award, 
  Users, 
  Globe, 
  Zap 
} from 'lucide-react';
import { AdBanner } from '@/components/ads/AdBanner';

const benefits = [
  {
    icon: GraduationCap,
    title: '100% Free Courses',
    description: 'Access all our premium courses without paying a single penny. Quality education for everyone.',
  },
  {
    icon: Clock,
    title: 'Learn at Your Pace',
    description: 'Study whenever and wherever you want. Our courses are available 24/7 on any device.',
  },
  {
    icon: Award,
    title: 'Expert Instructors',
    description: 'Learn from industry professionals with years of real-world experience.',
  },
  {
    icon: Users,
    title: 'Active Community',
    description: 'Join thousands of learners, share knowledge, and grow together.',
  },
  {
    icon: Globe,
    title: 'Global Access',
    description: 'Connect with learners from around the world and expand your network.',
  },
  {
    icon: Zap,
    title: 'Practical Projects',
    description: 'Build real-world projects that you can add to your portfolio.',
  },
];

export function BenefitsSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Why Choose EduLearn?
          </h2>
          <p className="text-lg text-muted-foreground">
            We're committed to making quality education accessible to everyone. 
            Here's what sets us apart.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group p-6 rounded-xl bg-card border border-border hover:border-secondary/50 hover:shadow-glow transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <benefit.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Mid-section Ad */}
        <div className="mt-16">
          <AdBanner size="leaderboard" className="max-w-4xl mx-auto" />
        </div>
      </div>
    </section>
  );
}
