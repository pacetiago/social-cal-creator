import { useState } from "react";
import { CalendarPost, CalendarFilters as FiltersType } from "@/types/calendar";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { CalendarFilters } from "@/components/calendar/CalendarFilters";
import { CalendarAnalytics } from "@/components/calendar/CalendarAnalytics";
import { PostModal } from "@/components/calendar/PostModal";
import { PostForm } from "@/components/calendar/PostForm";
import { CalendarPDFExport } from "@/components/calendar/CalendarPDFExport";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { samplePosts } from "@/data/sampleData";
import { sampleClients, getClientById, getCompanyById, getAllCompanies } from "@/data/clientsData";

const Index = () => {
  const [posts, setPosts] = useLocalStorage<CalendarPost[]>('calendar-posts', samplePosts);
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
    setFilters(prev => ({ ...prev, clientId, companyId: '' }));
  };

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setFilters(prev => ({ ...prev, companyId }));
  };

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
          selectedClient={selectedClient}
          selectedCompany={selectedCompany}
          currentMonth={currentMonth}
          currentYear={currentYear}
        />

        <CalendarFilters 
          filters={filters}
          onFiltersChange={setFilters}
          clients={sampleClients}
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
        />

        <PostForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSavePost}
          clients={sampleClients}
          defaultClientId={selectedClientId}
          defaultCompanyId={selectedCompanyId}
        />
      </div>
    </div>
  );
};

export default Index;
