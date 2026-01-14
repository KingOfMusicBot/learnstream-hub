import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Clock, BookOpen, User, Play, Lock, ChevronDown, ChevronUp,
  CheckCircle, BarChart, Award, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { AdBanner } from '@/components/ads/AdBanner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string | null;
  thumbnail_url: string | null;
  instructor_name: string;
  instructor_avatar: string | null;
  instructor_bio: string | null;
  level: string | null;
  duration_hours: number | null;
  total_lectures: number | null;
  categories?: { name: string; slug: string } | null;
}

interface Lecture {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  order_index: number;
  is_preview: boolean | null;
}

export default function CourseDetails() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [curriculumExpanded, setCurriculumExpanded] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchCourse();
    }
  }, [slug]);

  const fetchCourse = async () => {
    const { data: courseData, error } = await supabase
      .from('courses')
      .select('*, categories(name, slug)')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (!error && courseData) {
      setCourse(courseData);
      
      // Fetch lectures
      const { data: lecturesData } = await supabase
        .from('lectures')
        .select('*')
        .eq('course_id', courseData.id)
        .eq('is_published', true)
        .order('order_index');

      if (lecturesData) {
        setLectures(lecturesData);
      }
    }
    setLoading(false);
  };

  const handleStartCourse = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (lectures.length > 0) {
      navigate(`/course/${slug}/lecture/${lectures[0].id}`);
    }
  };

  const handleLectureClick = (lecture: Lecture) => {
    if (!user && !lecture.is_preview) {
      navigate('/login');
      return;
    }
    navigate(`/course/${slug}/lecture/${lecture.id}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-secondary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Course Not Found</h1>
          <p className="text-muted-foreground mb-6">The course you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/courses">Browse Courses</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const totalDuration = lectures.reduce((acc, l) => acc + (l.duration_minutes || 0), 0);
  const hours = Math.floor(totalDuration / 60);
  const minutes = totalDuration % 60;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-hero py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Course Info */}
            <div className="lg:col-span-2 text-primary-foreground">
              {course.categories && (
                <Badge className="bg-accent/20 text-accent-foreground mb-4">
                  {course.categories.name}
                </Badge>
              )}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
                {course.title}
              </h1>
              <p className="text-lg opacity-90 mb-6 max-w-2xl">
                {course.short_description || course.description.substring(0, 200)}
              </p>

              {/* Instructor */}
              <div className="flex items-center gap-3 mb-6">
                {course.instructor_avatar ? (
                  <img
                    src={course.instructor_avatar}
                    alt={course.instructor_name}
                    className="w-12 h-12 rounded-full border-2 border-white/20"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <p className="text-sm opacity-75">Instructor</p>
                  <p className="font-medium">{course.instructor_name}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6">
                {course.level && (
                  <div className="flex items-center gap-2">
                    <BarChart className="w-5 h-5" />
                    <span className="capitalize">{course.level}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`} total</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span>{lectures.length} lectures</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <span>Certificate</span>
                </div>
              </div>
            </div>

            {/* CTA Card */}
            <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full aspect-video object-cover"
                />
              ) : (
                <div className="w-full aspect-video bg-muted flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
              <div className="p-6">
                <div className="text-3xl font-bold text-foreground mb-2">Free</div>
                <p className="text-muted-foreground text-sm mb-6">
                  Full lifetime access
                </p>
                <Button
                  onClick={handleStartCourse}
                  className="w-full bg-gradient-hero hover:opacity-90 shadow-glow mb-4"
                  size="lg"
                >
                  {user ? 'Start Learning' : 'Login to Start'}
                </Button>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary" />
                    {lectures.length} video lectures
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary" />
                    Lifetime access
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary" />
                    Certificate of completion
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AdBanner position="top" />

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
                <h2 className="text-2xl font-display font-bold mb-4">About This Course</h2>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  <p>{course.description}</p>
                </div>
              </div>

              {/* What You'll Learn */}
              <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
                <h2 className="text-2xl font-display font-bold mb-4">What You'll Learn</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    'Comprehensive understanding of core concepts',
                    'Hands-on practical exercises',
                    'Real-world project experience',
                    'Industry best practices',
                    'Problem-solving techniques',
                    'Career-ready skills',
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Curriculum */}
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <button
                  onClick={() => setCurriculumExpanded(!curriculumExpanded)}
                  className="w-full p-6 md:p-8 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <h2 className="text-2xl font-display font-bold text-left">Course Curriculum</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      {lectures.length} lectures • {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`} total
                    </p>
                  </div>
                  {curriculumExpanded ? (
                    <ChevronUp className="w-6 h-6 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-muted-foreground" />
                  )}
                </button>

                {curriculumExpanded && (
                  <div className="border-t border-border">
                    {lectures.map((lecture, index) => (
                      <button
                        key={lecture.id}
                        onClick={() => handleLectureClick(lecture)}
                        className="w-full px-6 md:px-8 py-4 flex items-center gap-4 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0 text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                          {lecture.is_preview || user ? (
                            <Play className="w-4 h-4 text-secondary" />
                          ) : (
                            <Lock className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {index + 1}. {lecture.title}
                          </p>
                          {lecture.description && (
                            <p className="text-sm text-muted-foreground truncate">
                              {lecture.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {lecture.is_preview && (
                            <Badge variant="secondary" className="text-xs">
                              Preview
                            </Badge>
                          )}
                          {lecture.duration_minutes && (
                            <span className="text-sm text-muted-foreground">
                              {lecture.duration_minutes}m
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Instructor */}
              <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
                <h2 className="text-2xl font-display font-bold mb-6">Your Instructor</h2>
                <div className="flex items-start gap-4">
                  {course.instructor_avatar ? (
                    <img
                      src={course.instructor_avatar}
                      alt={course.instructor_name}
                      className="w-20 h-20 rounded-full"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center">
                      <User className="w-10 h-10 text-secondary" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold">{course.instructor_name}</h3>
                    <p className="text-muted-foreground mt-2">
                      {course.instructor_bio || 'Experienced instructor passionate about teaching and helping students succeed.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <AdBanner position="sidebar" />
            </div>
          </div>
        </div>
      </section>

      <AdBanner position="bottom" />
    </Layout>
  );
}
