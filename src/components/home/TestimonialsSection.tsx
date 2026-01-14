import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Emily Rodriguez',
    role: 'Junior Developer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    content: 'EduLearn completely changed my career path. I went from knowing nothing about coding to landing my first developer job in just 6 months!',
    rating: 5,
  },
  {
    name: 'David Kim',
    role: 'Marketing Manager',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    content: 'The digital marketing course was incredibly comprehensive. I learned practical skills that I immediately applied to my work.',
    rating: 5,
  },
  {
    name: 'Sarah Thompson',
    role: 'Data Analyst',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    content: "Best free learning platform I've ever used. The Python and ML courses are top-notch and the instructors really know their stuff.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            What Our Learners Say
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of satisfied learners who have transformed their careers with EduLearn.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative bg-card rounded-xl p-6 border border-border shadow-sm animate-slide-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-secondary/20" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-accent fill-current" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
