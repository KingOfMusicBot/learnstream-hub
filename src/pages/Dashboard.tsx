import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { BookOpen, Clock, Play, Award, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Layout } from '@/components/layout/Layout';
import { AdBanner } from '@/components/ads/AdBanner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

interface CourseProgress {
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail_url: string | null;
    total_lectures: number | null;
  };
  completedLectures: number;
  totalLectures: number;
  lastWatched: string | null;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user]);

  const fetchProgress = async () => {
    if (!user) return;

    // Fetch user progress with lectures and courses
    const { data: progressData } = await supabase
      .from('user_progress')
      .select(`
        lecture_id,
        is_completed,
        last_watched_at,
        lectures!inner(
          course_id,
          courses!inner(
            id,
            title,
            slug,
            thumbnail_url,
            total_lectures
          )
        )
      `)
      .eq('user_id', user.id);

    if (progressData) {
      // Group by course
      const courseMap = new Map<string, CourseProgress>();

      progressData.forEach((p: any) => {
        const course = p.lectures.courses;
        if (!courseMap.has(course.id)) {
          courseMap.set(course.id, {
            course: {
              id: course.id,
              title: course.title,
              slug: course.slug,
              thumbnail_url: course.thumbnail_url,
              total_lectures: course.total_lectures,
            },
            completedLectures: 0,
            totalLectures: course.total_lectures || 0,
            lastWatched: null,
          });
        }

        const entry = courseMap.get(course.id)!;
        if (p.is_completed) {
          entry.completedLectures++;
        }
        if (!entry.lastWatched || new Date(p.last_watched_at) > new Date(entry.lastWatched)) {
          entry.lastWatched = p.last_watched_at;
        }
      });

      setCourseProgress(Array.from(courseMap.values()));
    }

    setLoading(false);
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-secondary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const totalCompleted = courseProgress.reduce((acc, cp) => acc + cp.completedLectures, 0);
  const totalLectures = courseProgress.reduce((acc, cp) => acc + cp.totalLectures, 0);
  const overallProgress = totalLectures > 0 ? (totalCompleted / totalLectures) * 100 : 0;

  return (
    <Layout>
      {/* Header Section */}
      <section className="bg-gradient-hero py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-2">
            My Dashboard
          </h1>
          <p className="text-primary-foreground/80">
            Track your learning progress and continue where you left off.
          </p>
        </div>
      </section>

      <AdBanner position="top" />

      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{courseProgress.length}</p>
                  <p className="text-sm text-muted-foreground">Courses Started</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Play className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalCompleted}</p>
                  <p className="text-sm text-muted-foreground">Lectures Completed</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.round(overallProgress)}%</p>
                  <p className="text-sm text-muted-foreground">Overall Progress</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {courseProgress.filter(cp => cp.completedLectures === cp.totalLectures && cp.totalLectures > 0).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Courses Completed</p>
                </div>
              </div>
            </div>
          </div>

          {/* My Courses */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold">Continue Learning</h2>
              <Button variant="outline" asChild>
                <Link to="/courses">Browse Courses</Link>
              </Button>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-card rounded-2xl animate-pulse">
                    <div className="aspect-video bg-muted" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : courseProgress.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-2xl border border-border">
                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start learning by exploring our course catalog.
                </p>
                <Button asChild className="bg-gradient-hero hover:opacity-90">
                  <Link to="/courses">Browse Courses</Link>
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courseProgress.map((cp) => {
                  const progress = cp.totalLectures > 0 
                    ? (cp.completedLectures / cp.totalLectures) * 100 
                    : 0;
                  const isComplete = cp.completedLectures === cp.totalLectures && cp.totalLectures > 0;

                  return (
                    <Link
                      key={cp.course.id}
                      to={`/course/${cp.course.slug}`}
                      className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-secondary/50 hover:shadow-card transition-all duration-300"
                    >
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        {cp.course.thumbnail_url ? (
                          <img
                            src={cp.course.thumbnail_url}
                            alt={cp.course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-hero flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-primary-foreground/50" />
                          </div>
                        )}
                        {isComplete && (
                          <div className="absolute inset-0 bg-secondary/90 flex items-center justify-center">
                            <div className="text-center text-white">
                              <Award className="w-12 h-12 mx-auto mb-2" />
                              <p className="font-semibold">Completed!</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold text-foreground group-hover:text-secondary transition-colors line-clamp-2 mb-3">
                          {cp.course.title}
                        </h3>
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                          <span>{cp.completedLectures} of {cp.totalLectures} lectures</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        {cp.lastWatched && (
                          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Last watched {new Date(cp.lastWatched).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <AdBanner position="bottom" />
    </Layout>
  );
}
