import { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, FolderOpen, Users, MessageSquare, 
  Settings, Plus, Edit, Trash2, Eye, EyeOff, ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string | null;
  thumbnail_url: string | null;
  instructor_name: string;
  instructor_bio: string | null;
  level: string | null;
  is_published: boolean | null;
  is_featured: boolean | null;
  category_id: string | null;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Lecture {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  duration_minutes: number | null;
  is_published: boolean | null;
  is_preview: boolean | null;
  video_url: string | null;
  video_path: string | null;
}

type AdminTab = 'dashboard' | 'courses' | 'categories' | 'contacts';

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Course editing
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  
  // Lecture management
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);
  const [lectureDialogOpen, setLectureDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchData();
    }
  }, [authLoading, isAdmin]);

  const fetchData = async () => {
    const [coursesRes, categoriesRes] = await Promise.all([
      supabase.from('courses').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);

    if (coursesRes.data) setCourses(coursesRes.data);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    setLoading(false);
  };

  const fetchLectures = async (courseId: string) => {
    const { data } = await supabase
      .from('lectures')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index');
    
    if (data) setLectures(data);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-secondary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const handleSaveCourse = async (formData: FormData) => {
    const courseData = {
      title: formData.get('title') as string,
      slug: (formData.get('title') as string).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: formData.get('description') as string,
      short_description: formData.get('short_description') as string || null,
      thumbnail_url: formData.get('thumbnail_url') as string || null,
      instructor_name: formData.get('instructor_name') as string,
      instructor_bio: formData.get('instructor_bio') as string || null,
      level: formData.get('level') as string || 'beginner',
      category_id: formData.get('category_id') as string || null,
      is_published: formData.get('is_published') === 'true',
      is_featured: formData.get('is_featured') === 'true',
    };

    if (editingCourse) {
      const { error } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', editingCourse.id);
      
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Course updated!' });
        fetchData();
      }
    } else {
      const { error } = await supabase.from('courses').insert(courseData);
      
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Course created!' });
        fetchData();
      }
    }

    setCourseDialogOpen(false);
    setEditingCourse(null);
  };

  const handleDeleteCourse = async (courseId: string) => {
    const { error } = await supabase.from('courses').delete().eq('id', courseId);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Course deleted!' });
      fetchData();
    }
  };

  const handleSaveLecture = async (formData: FormData) => {
    if (!selectedCourse) return;

    const lectureData = {
      course_id: selectedCourse.id,
      title: formData.get('title') as string,
      description: formData.get('description') as string || null,
      video_url: formData.get('video_url') as string || null,
      duration_minutes: parseInt(formData.get('duration_minutes') as string) || 0,
      order_index: parseInt(formData.get('order_index') as string) || lectures.length,
      is_published: formData.get('is_published') === 'true',
      is_preview: formData.get('is_preview') === 'true',
    };

    if (editingLecture) {
      const { error } = await supabase
        .from('lectures')
        .update(lectureData)
        .eq('id', editingLecture.id);
      
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Lecture updated!' });
        fetchLectures(selectedCourse.id);
      }
    } else {
      const { error } = await supabase.from('lectures').insert(lectureData);
      
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Lecture created!' });
        fetchLectures(selectedCourse.id);
        
        // Update course lecture count
        await supabase
          .from('courses')
          .update({ total_lectures: lectures.length + 1 })
          .eq('id', selectedCourse.id);
      }
    }

    setLectureDialogOpen(false);
    setEditingLecture(null);
  };

  const handleDeleteLecture = async (lectureId: string) => {
    if (!selectedCourse) return;
    
    const { error } = await supabase.from('lectures').delete().eq('id', lectureId);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Lecture deleted!' });
      fetchLectures(selectedCourse.id);
      
      // Update course lecture count
      await supabase
        .from('courses')
        .update({ total_lectures: lectures.length - 1 })
        .eq('id', selectedCourse.id);
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'categories', label: 'Categories', icon: FolderOpen },
    { id: 'contacts', label: 'Contact Messages', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold">Admin Panel</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as AdminTab);
                setSelectedCourse(null);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-secondary/10 text-secondary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <Button variant="outline" asChild className="w-full">
            <Link to="/">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Site
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Lecture Management View */}
        {selectedCourse ? (
          <div>
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" onClick={() => setSelectedCourse(null)}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Courses
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{selectedCourse.title}</h1>
                <p className="text-muted-foreground">Manage lectures</p>
              </div>
            </div>

            <div className="flex justify-end mb-6">
              <Dialog open={lectureDialogOpen} onOpenChange={setLectureDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingLecture(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lecture
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingLecture ? 'Edit Lecture' : 'New Lecture'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveLecture(new FormData(e.currentTarget));
                  }} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" name="title" defaultValue={editingLecture?.title} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" defaultValue={editingLecture?.description || ''} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="video_url">Video URL (HLS or direct)</Label>
                      <Input id="video_url" name="video_url" defaultValue={editingLecture?.video_url || ''} placeholder="https://..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                        <Input id="duration_minutes" name="duration_minutes" type="number" defaultValue={editingLecture?.duration_minutes || 0} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="order_index">Order</Label>
                        <Input id="order_index" name="order_index" type="number" defaultValue={editingLecture?.order_index ?? lectures.length} />
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Switch id="is_published" name="is_published" defaultChecked={editingLecture?.is_published ?? false} />
                        <Label htmlFor="is_published">Published</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch id="is_preview" name="is_preview" defaultChecked={editingLecture?.is_preview ?? false} />
                        <Label htmlFor="is_preview">Free Preview</Label>
                      </div>
                    </div>
                    <Button type="submit" className="w-full">Save Lecture</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">#</th>
                    <th className="text-left p-4 font-medium">Title</th>
                    <th className="text-left p-4 font-medium">Duration</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {lectures.map((lecture) => (
                    <tr key={lecture.id} className="hover:bg-muted/30">
                      <td className="p-4">{lecture.order_index + 1}</td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{lecture.title}</p>
                          {lecture.is_preview && <Badge variant="secondary" className="mt-1">Preview</Badge>}
                        </div>
                      </td>
                      <td className="p-4">{lecture.duration_minutes || 0}m</td>
                      <td className="p-4">
                        <Badge variant={lecture.is_published ? 'default' : 'secondary'}>
                          {lecture.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingLecture(lecture);
                              setLectureDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Lecture?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteLecture(lecture.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {lectures.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  No lectures yet. Add your first lecture!
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div>
                <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-card rounded-xl border border-border p-6">
                    <BookOpen className="w-8 h-8 text-secondary mb-4" />
                    <p className="text-3xl font-bold">{courses.length}</p>
                    <p className="text-muted-foreground">Total Courses</p>
                  </div>
                  <div className="bg-card rounded-xl border border-border p-6">
                    <Eye className="w-8 h-8 text-secondary mb-4" />
                    <p className="text-3xl font-bold">{courses.filter(c => c.is_published).length}</p>
                    <p className="text-muted-foreground">Published</p>
                  </div>
                  <div className="bg-card rounded-xl border border-border p-6">
                    <FolderOpen className="w-8 h-8 text-secondary mb-4" />
                    <p className="text-3xl font-bold">{categories.length}</p>
                    <p className="text-muted-foreground">Categories</p>
                  </div>
                </div>
              </div>
            )}

            {/* Courses Tab */}
            {activeTab === 'courses' && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h1 className="text-3xl font-bold">Courses</h1>
                  <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setEditingCourse(null)}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Course
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingCourse ? 'Edit Course' : 'New Course'}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveCourse(new FormData(e.currentTarget));
                      }} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Title</Label>
                          <Input id="title" name="title" defaultValue={editingCourse?.title} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="short_description">Short Description</Label>
                          <Input id="short_description" name="short_description" defaultValue={editingCourse?.short_description || ''} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Full Description</Label>
                          <Textarea id="description" name="description" rows={4} defaultValue={editingCourse?.description} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                          <Input id="thumbnail_url" name="thumbnail_url" defaultValue={editingCourse?.thumbnail_url || ''} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="instructor_name">Instructor Name</Label>
                            <Input id="instructor_name" name="instructor_name" defaultValue={editingCourse?.instructor_name} required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="level">Level</Label>
                            <Select name="level" defaultValue={editingCourse?.level || 'beginner'}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="instructor_bio">Instructor Bio</Label>
                          <Textarea id="instructor_bio" name="instructor_bio" defaultValue={editingCourse?.instructor_bio || ''} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category_id">Category</Label>
                          <Select name="category_id" defaultValue={editingCourse?.category_id || ''}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <input type="hidden" name="is_published" value="false" />
                            <Switch id="is_published" name="is_published" value="true" defaultChecked={editingCourse?.is_published ?? false} />
                            <Label htmlFor="is_published">Published</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="hidden" name="is_featured" value="false" />
                            <Switch id="is_featured" name="is_featured" value="true" defaultChecked={editingCourse?.is_featured ?? false} />
                            <Label htmlFor="is_featured">Featured</Label>
                          </div>
                        </div>
                        <Button type="submit" className="w-full">Save Course</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium">Course</th>
                        <th className="text-left p-4 font-medium">Instructor</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {courses.map((course) => (
                        <tr key={course.id} className="hover:bg-muted/30">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {course.thumbnail_url ? (
                                <img src={course.thumbnail_url} alt="" className="w-16 h-10 object-cover rounded" />
                              ) : (
                                <div className="w-16 h-10 bg-muted rounded flex items-center justify-center">
                                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{course.title}</p>
                                <p className="text-sm text-muted-foreground capitalize">{course.level}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">{course.instructor_name}</td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              <Badge variant={course.is_published ? 'default' : 'secondary'}>
                                {course.is_published ? 'Published' : 'Draft'}
                              </Badge>
                              {course.is_featured && <Badge variant="outline">Featured</Badge>}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedCourse(course);
                                  fetchLectures(course.id);
                                }}
                              >
                                Lectures
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingCourse(course);
                                  setCourseDialogOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Course?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will also delete all lectures in this course.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteCourse(course.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {courses.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      No courses yet. Create your first course!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div>
                <h1 className="text-3xl font-bold mb-8">Categories</h1>
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-medium">Name</th>
                        <th className="text-left p-4 font-medium">Slug</th>
                        <th className="text-left p-4 font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {categories.map((category) => (
                        <tr key={category.id} className="hover:bg-muted/30">
                          <td className="p-4 font-medium">{category.name}</td>
                          <td className="p-4 text-muted-foreground">{category.slug}</td>
                          <td className="p-4 text-muted-foreground">-</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Contacts Tab */}
            {activeTab === 'contacts' && (
              <div>
                <h1 className="text-3xl font-bold mb-8">Contact Messages</h1>
                <p className="text-muted-foreground">Contact messages will appear here.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
