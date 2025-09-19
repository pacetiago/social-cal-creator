import { useState } from "react";
import { CalendarPost, CalendarFilters as FiltersType } from "@/types/calendar";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { CalendarFilters } from "@/components/calendar/CalendarFilters";
import { CalendarAnalytics } from "@/components/calendar/CalendarAnalytics";
import { PostModal } from "@/components/calendar/PostModal";
import { PostForm } from "@/components/calendar/PostForm";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { samplePosts } from "@/data/sampleData";

const Index = () => {
  const [posts, setPosts] = useLocalStorage<CalendarPost[]>('calendar-posts', samplePosts);
  const [currentView, setCurrentView] = useState<'calendar' | 'analytics'>('calendar');
  const [selectedPost, setSelectedPost] = useState<CalendarPost | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filters, setFilters] = useState<FiltersType>({
    networks: [],
    editorialLines: [],
    mediaTypes: [],
  });

  const filteredPosts = posts.filter(post => {
    const networkMatch = filters.networks.length === 0 || 
      filters.networks.some(network => post.networks.includes(network));
    
    const editorialMatch = filters.editorialLines.length === 0 || 
      filters.editorialLines.includes(post.editorialLine);
    
    const mediaMatch = filters.mediaTypes.length === 0 || 
      filters.mediaTypes.includes(post.mediaType);
    
    return networkMatch && editorialMatch && mediaMatch;
  });

  const handleAddPost = () => {
    setIsFormOpen(true);
  };

  const handlePostClick = (post: CalendarPost) => {
    setSelectedPost(post);
    setIsPostModalOpen(true);
  };

  const handleSavePost = (postData: Omit<CalendarPost, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPost: CalendarPost = {
      ...postData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setPosts(prevPosts => [...prevPosts, newPost]);
    setIsFormOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <CalendarHeader 
          onAddPost={handleAddPost}
          currentView={currentView}
          onViewChange={setCurrentView}
        />

        <CalendarFilters 
          filters={filters}
          onFiltersChange={setFilters}
        />

        <div className="mt-6">
          {currentView === 'calendar' ? (
            <CalendarGrid
              posts={filteredPosts}
              onPostClick={handlePostClick}
              month={9} // October (0-indexed)
              year={2025}
            />
          ) : (
            <CalendarAnalytics posts={filteredPosts} />
          )}
        </div>

        <PostModal
          post={selectedPost}
          isOpen={isPostModalOpen}
          onClose={() => {
            setIsPostModalOpen(false);
            setSelectedPost(null);
          }}
        />

        <PostForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSavePost}
        />
      </div>
    </div>
  );
};

export default Index;
