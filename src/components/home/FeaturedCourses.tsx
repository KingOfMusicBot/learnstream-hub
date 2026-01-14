import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Users, Star, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Sample featured courses (will be replaced with database data)
const featuredCourses = [
  {
    id: '1',
    slug: 'web-development-bootcamp',
    title: 'Complete Web Development Bootcamp',
    shortDescription: 'Master HTML, CSS, JavaScript, React, and Node.js from scratch.',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop',
    instructorName: 'John Smith',
    level: 'beginner',
    durationHours: 40,
    totalLectures: 120,
    category: 'Web Development',
  },
  {
    id: '2',
    slug: 'python-machine-learning',
    title: 'Python for Machine Learning',
    shortDescription: 'Learn Python programming and build ML models with hands-on projects.',
    thumbnail: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&h=400&fit=crop',
    instructorName: 'Sarah Johnson',
    level: 'intermediate',
    durationHours: 35,
    totalLectures: 85,
    category: 'Data Science',
  },
  {
    id: '3',
    slug: 'digital-marketing-mastery',
    title: 'Digital Marketing Mastery',
    shortDescription: 'Complete guide to SEO, social media, and content marketing.',
    thumbnail: 'https://images.unsplash.com/photo-1432888622747-4eb9a8f1f103?w=600&h=400&fit=crop',
    instructorName: 'Mike Chen',
    level: 'beginner',
    durationHours: 25,
    totalLectures: 60,
    category: 'Marketing',
  },
];

const levelColors = {
  beginner: 'bg-success/10 text-success border-success/20',
  intermediate: 'bg-accent/10 text-accent-foreground border-accent/20',
  advanced: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function FeaturedCourses() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              Featured Courses
            </h2>
            <p className="text-muted-foreground text-lg">
              Start learning with our most popular free courses
            </p>
          </div>
          <Button asChild variant="outline" className="group">
            <Link to="/courses">
              View All Courses
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {featuredCourses.map((course, index) => (
            <Link
              key={course.id}
              to={`/courses/${course.slug}`}
              className="group block animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="bg-card rounded-xl overflow-hidden border border-border card-hover h-full flex flex-col">
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-primary-foreground/90 flex items-center justify-center">
                      <Play className="w-6 h-6 text-primary ml-0.5" />
                    </div>
                  </div>
                  <Badge className={`absolute top-3 left-3 ${levelColors[course.level as keyof typeof levelColors]}`}>
                    {course.level}
                  </Badge>
                  <Badge className="absolute top-3 right-3 bg-secondary text-secondary-foreground">
                    FREE
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-xs text-secondary font-medium mb-2">{course.category}</p>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                    {course.shortDescription}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {course.durationHours}h
                      </span>
                      <span className="flex items-center gap-1">
                        <Play className="w-3.5 h-3.5" />
                        {course.totalLectures} lectures
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-accent">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-xs font-medium">4.8</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
