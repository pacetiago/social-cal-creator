import { useState } from "react";
import { CalendarPost, CalendarFilters as FiltersType } from "@/types/calendar";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { CalendarFilters } from "@/components/calendar/CalendarFilters";
import { CalendarAnalytics } from "@/components/calendar/CalendarAnalytics";
import { PostModal } from "@/components/calendar/PostModal";
import { PostForm } from "@/components/calendar/PostForm";
import { CalendarPDFExport } from "@/components/calendar/CalendarPDFExport";
import { UserMenu } from "@/components/UserMenu";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useSupabaseClients } from "@/hooks/useSupabaseClients";
import { useSupabaseCalendarPosts } from "@/hooks/useSupabaseCalendarPosts";

const Index = () => {
  // Supabase hooks
  const { 
    clients, 
    loading: clientsLoading, 
    getAllCompanies, 
    getClientById, 
    getCompanyById 
  } = useSupabaseClients();
  
  const { 
    posts, 
    loading: postsLoading, 
    addPost, 
    updatePost, 
    deletePost 
  } = useSupabaseCalendarPosts();

  // State management
  const [currentView, setCurrentView] = useState<'calendar' | 'analytics'>('calendar');
  const [selectedPost, setSelectedPost] = useState<CalendarPost | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(9); // October (0-indexed)
  const [currentYear, setCurrentYear] = useState(2025);
  const [selectedClientId, setSelectedClientId] = useLocalStorage<string>('selected-client', 'austa');
  const [selectedCompanyId, setSelectedCompanyId] = useLocalStorage<string>('selected-company', 'austa-hospital');
  const [filters, setFilters] = useState<FiltersType>({
    clientId: selectedClientId,
    companyId: selectedCompanyId,
    networks: [],
    editorialLines: [],
    mediaTypes: [],
  });

  const selectedClient = getClientById(selectedClientId);
  const selectedCompany = getCompanyById(selectedClientId, selectedCompanyId);
  const allCompanies = getAllCompanies();

  const filteredPosts = posts.filter(post => {
    // Filter by selected client and company
    const clientMatch = !filters.clientId || post.clientId === filters.clientId;
    const companyMatch = !filters.companyId || post.companyId === filters.companyId;
    
    // Filter by month/year
    const dateMatch = post.month === currentMonth && post.year === currentYear;
    
    // Filter by additional criteria
    const networkMatch = filters.networks.length === 0 || 
      filters.networks.some(network => post.networks.includes(network));
    
    const editorialMatch = filters.editorialLines.length === 0 || 
      filters.editorialLines.includes(post.editorialLine);
    
    const mediaMatch = filters.mediaTypes.length === 0 || 
      filters.mediaTypes.includes(post.mediaType);
    
    return clientMatch && companyMatch && dateMatch && networkMatch && editorialMatch && mediaMatch;
  });

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    setSelectedCompanyId(''); // Reset company when client changes
    setFilters(prev => ({ 
      ...prev, 
      clientId: clientId || undefined, 
      companyId: undefined 
    }));
  };

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setFilters(prev => ({ 
      ...prev, 
      companyId: companyId || undefined 
    }));
  };

  const handleAddPost = () => {
    setIsFormOpen(true);
  };

  const handlePostClick = (post: CalendarPost) => {
    setSelectedPost(post);
    setIsPostModalOpen(true);
  };

  const handleSavePost = async (postData: Omit<CalendarPost, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addPost(postData);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId);
      setIsPostModalOpen(false);
      setSelectedPost(null);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  // Show loading state
  if (clientsLoading || postsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div></div>
          <UserMenu />
        </div>
        <CalendarHeader 
          onAddPost={handleAddPost}
          currentView={currentView}
          onViewChange={setCurrentView}
          selectedClient={selectedClient}
          selectedCompany={selectedCompany}
          currentMonth={currentMonth}
          currentYear={currentYear}
        />

        <CalendarFilters 
          filters={filters}
          onFiltersChange={setFilters}
          clients={clients}
          selectedClient={selectedClient}
          selectedCompany={selectedCompany}
          onClientChange={handleClientChange}
          onCompanyChange={handleCompanyChange}
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
        />

        <div className="mt-6">
          {currentView === 'calendar' ? (
            <>
              <div className="flex justify-end mb-4">
                <CalendarPDFExport
                  posts={filteredPosts}
                  companies={allCompanies}
                  currentMonth={currentMonth}
                  currentYear={currentYear}
                  selectedClient={selectedClientId}
                  selectedCompany={selectedCompanyId}
                />
              </div>
              <CalendarGrid
                posts={filteredPosts}
                onPostClick={handlePostClick}
                month={currentMonth}
                year={currentYear}
                companies={allCompanies}
              />
            </>
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
          companies={allCompanies}
          onDelete={handleDeletePost}
        />

        <PostForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSavePost}
          clients={clients}
          defaultClientId={selectedClientId}
          defaultCompanyId={selectedCompanyId}
        />
      </div>
    </div>
  );
};

export default Index;
