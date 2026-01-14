import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, List, X, Play, CheckCircle, Lock,
  BookOpen, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AdBanner } from '@/components/ads/AdBanner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  slug: string;
}

interface Lecture {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  order_index: number;
  is_preview: boolean | null;
}

interface UserProgress {
  lecture_id: string;
  is_completed: boolean;
  progress_seconds: number;
}

export default function LecturePlayer() {
  const { slug, lectureId } = useParams<{ slug: string; lectureId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [currentLecture, setCurrentLecture] = useState<Lecture | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (slug && lectureId) {
      fetchData();
    }
  }, [slug, lectureId]);

  const fetchData = async () => {
    // Fetch course
    const { data: courseData } = await supabase
      .from('courses')
      .select('id, title, slug')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (!courseData) {
      navigate('/courses');
      return;
    }

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
      const current = lecturesData.find(l => l.id === lectureId);
      
      if (current) {
        // Check if user can access this lecture
        if (!current.is_preview && !user) {
          navigate('/login');
          return;
        }
        setCurrentLecture(current);
      }
    }

    // Fetch user progress
    if (user) {
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('lecture_id, is_completed, progress_seconds')
        .eq('user_id', user.id);

      if (progressData) {
        setUserProgress(progressData);
      }
    }

    setLoading(false);
  };

  const updateProgress = async (seconds: number, completed: boolean = false) => {
    if (!user || !currentLecture) return;

    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: user.id,
        lecture_id: currentLecture.id,
        progress_seconds: Math.floor(seconds),
        is_completed: completed,
        last_watched_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,lecture_id',
      });

    if (!error && completed) {
      setUserProgress(prev => {
        const existing = prev.find(p => p.lecture_id === currentLecture.id);
        if (existing) {
          return prev.map(p => 
            p.lecture_id === currentLecture.id 
              ? { ...p, is_completed: true } 
              : p
          );
        }
        return [...prev, { lecture_id: currentLecture.id, is_completed: true, progress_seconds: Math.floor(seconds) }];
      });
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      
      // Update progress every 10 seconds
      if (Math.floor(currentTime) % 10 === 0) {
        updateProgress(currentTime);
      }

      // Mark as completed if watched 90%
      if (currentTime / duration > 0.9) {
        updateProgress(currentTime, true);
      }
    }
  };

  const handleVideoEnded = () => {
    if (videoRef.current) {
      updateProgress(videoRef.current.duration, true);
      toast({
        title: 'Lecture Completed! 🎉',
        description: 'Great job! Ready for the next one?',
      });
    }
  };

  const goToLecture = (lecture: Lecture) => {
    if (!lecture.is_preview && !user) {
      navigate('/login');
      return;
    }
    navigate(`/course/${slug}/lecture/${lecture.id}`);
  };

  const currentIndex = lectures.findIndex(l => l.id === lectureId);
  const prevLecture = currentIndex > 0 ? lectures[currentIndex - 1] : null;
  const nextLecture = currentIndex < lectures.length - 1 ? lectures[currentIndex + 1] : null;

  const completedCount = userProgress.filter(p => 
    p.is_completed && lectures.some(l => l.id === p.lecture_id)
  ).length;
  const progressPercentage = lectures.length > 0 ? (completedCount / lectures.length) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-secondary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!currentLecture) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Lecture Not Found</h1>
        <Button asChild>
          <Link to={`/course/${slug}`}>Back to Course</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-4">
            <Link
              to={`/course/${slug}`}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">{course?.title}</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <span>{completedCount}/{lectures.length} completed</span>
              <Progress value={progressPercentage} className="w-24 h-2" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <List className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Main Content */}
        <div className={`flex-1 flex flex-col ${sidebarOpen ? 'lg:mr-80' : ''}`}>
          {/* Video Player */}
          <div className="w-full bg-black aspect-video">
            {currentLecture.video_url ? (
              <video
                ref={videoRef}
                src={currentLecture.video_url}
                controls
                className="w-full h-full"
                onTimeUpdate={handleVideoTimeUpdate}
                onEnded={handleVideoEnded}
                autoPlay
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white">
                <Play className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg opacity-75">Video not available</p>
                <p className="text-sm opacity-50 mt-2">Please contact the instructor</p>
              </div>
            )}
          </div>

          {/* Lecture Info */}
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl font-display font-bold mb-2">
                {currentLecture.title}
              </h1>
              {currentLecture.description && (
                <p className="text-muted-foreground mb-6">
                  {currentLecture.description}
                </p>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t border-border">
                {prevLecture ? (
                  <Button
                    variant="outline"
                    onClick={() => goToLecture(prevLecture)}
                    className="gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                ) : (
                  <div />
                )}
                {nextLecture && (
                  <Button
                    onClick={() => goToLecture(nextLecture)}
                    className="gap-2 bg-gradient-hero hover:opacity-90"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <AdBanner position="content" className="mt-8" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="fixed right-0 top-14 bottom-0 w-80 bg-card border-l border-border overflow-y-auto hidden lg:block">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold">Course Content</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {completedCount} of {lectures.length} completed
              </p>
              <Progress value={progressPercentage} className="mt-2" />
            </div>

            <div className="divide-y divide-border">
              {lectures.map((lecture, index) => {
                const isCompleted = userProgress.some(
                  p => p.lecture_id === lecture.id && p.is_completed
                );
                const isCurrent = lecture.id === currentLecture.id;
                const canAccess = lecture.is_preview || user;

                return (
                  <button
                    key={lecture.id}
                    onClick={() => goToLecture(lecture)}
                    disabled={!canAccess}
                    className={`w-full p-4 flex items-start gap-3 text-left transition-colors ${
                      isCurrent 
                        ? 'bg-secondary/10 border-l-2 border-secondary' 
                        : 'hover:bg-muted/50'
                    } ${!canAccess ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCompleted 
                        ? 'bg-secondary text-secondary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : canAccess ? (
                        <Play className="w-3 h-3" />
                      ) : (
                        <Lock className="w-3 h-3" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        isCurrent ? 'text-secondary' : 'text-foreground'
                      }`}>
                        {index + 1}. {lecture.title}
                      </p>
                      {lecture.duration_minutes && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {lecture.duration_minutes} min
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div 
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-card overflow-y-auto">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Course Content</h2>
                  <p className="text-sm text-muted-foreground">
                    {completedCount} of {lectures.length}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="divide-y divide-border">
                {lectures.map((lecture, index) => {
                  const isCompleted = userProgress.some(
                    p => p.lecture_id === lecture.id && p.is_completed
                  );
                  const isCurrent = lecture.id === currentLecture.id;
                  const canAccess = lecture.is_preview || user;

                  return (
                    <button
                      key={lecture.id}
                      onClick={() => {
                        goToLecture(lecture);
                        setSidebarOpen(false);
                      }}
                      disabled={!canAccess}
                      className={`w-full p-4 flex items-start gap-3 text-left ${
                        isCurrent ? 'bg-secondary/10' : ''
                      } ${!canAccess ? 'opacity-50' : ''}`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-secondary text-white' : 'bg-muted'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : canAccess ? (
                          <Play className="w-3 h-3" />
                        ) : (
                          <Lock className="w-3 h-3" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {index + 1}. {lecture.title}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
