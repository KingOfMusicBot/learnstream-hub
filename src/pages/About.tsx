import { Users, Target, Award, Heart } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { AdBanner } from '@/components/ads/AdBanner';

export default function About() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-hero py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-4">
            About EduLearn
          </h1>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
            We're on a mission to make quality education accessible to everyone, everywhere.
          </p>
        </div>
      </section>

      <AdBanner position="top" />

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-display font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground">
              At EduLearn, we believe that education is a fundamental right, not a privilege. 
              Our platform provides free, high-quality courses taught by industry experts, 
              empowering learners around the world to develop new skills and advance their careers.
            </p>
          </div>

          {/* Values */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary/10 flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality First</h3>
              <p className="text-muted-foreground">
                Every course is carefully curated to ensure the highest standards of education.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
              <p className="text-muted-foreground">
                Join thousands of learners supporting each other on their educational journey.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Instructors</h3>
              <p className="text-muted-foreground">
                Learn from professionals with real-world experience in their fields.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Free Forever</h3>
              <p className="text-muted-foreground">
                All our courses are completely free. No hidden fees, no subscriptions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-center mb-8">Our Story</h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p>
                EduLearn was founded with a simple yet powerful idea: education should be 
                accessible to everyone, regardless of their location or financial situation.
              </p>
              <p>
                What started as a small collection of online courses has grown into a 
                comprehensive learning platform serving thousands of students worldwide. 
                We partner with industry experts and educators to create courses that are 
                not only informative but also engaging and practical.
              </p>
              <p>
                Our commitment to free education is made possible through advertising 
                partnerships and generous donations from organizations that share our vision 
                of democratized learning. Every course you take helps us continue our mission 
                and expand our offerings.
              </p>
              <p>
                Thank you for being part of the EduLearn community. Together, we're building 
                a world where knowledge has no barriers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary mb-2">50K+</div>
              <div className="text-muted-foreground">Active Learners</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary mb-2">100+</div>
              <div className="text-muted-foreground">Free Courses</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary mb-2">50+</div>
              <div className="text-muted-foreground">Expert Instructors</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary mb-2">180+</div>
              <div className="text-muted-foreground">Countries Reached</div>
            </div>
          </div>
        </div>
      </section>

      <AdBanner position="bottom" />
    </Layout>
  );
}
