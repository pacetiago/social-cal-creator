import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "next-themes";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrgs from "./pages/admin/AdminOrgs";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAudit from "./pages/admin/AdminAudit";
import AdminCompanies from "./pages/admin/AdminCompanies";
import AdminChannels from "./pages/admin/AdminChannels";
import AdminRoles from "./pages/admin/AdminRoles";

// Client Portal Pages
import ClientCalendar from "./pages/client/ClientCalendar";
import ClientKanban from "./pages/client/ClientKanban";
import ClientPost from "./pages/client/ClientPost";
import ClientCampaigns from "./pages/client/ClientCampaigns";
import ClientLibrary from "./pages/client/ClientLibrary";
import ClientSettings from "./pages/client/ClientSettings";
import ClientExports from "./pages/client/ClientExports";
import SelectOrganization from "./pages/SelectOrganization";
import PublicCalendar from "./pages/PublicCalendar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Index />} />
              <Route path="/public/calendar" element={<PublicCalendar />} />
              <Route path="/select-org" element={
                <ProtectedRoute>
                  <SelectOrganization />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/orgs" element={
                <ProtectedRoute>
                  <AdminOrgs />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute>
                  <AdminUsers />
                </ProtectedRoute>
              } />
              <Route path="/admin/audit" element={
                <ProtectedRoute>
                  <AdminAudit />
                </ProtectedRoute>
              } />
              <Route path="/admin/companies" element={
                <ProtectedRoute>
                  {/** Gestão de empresas por cliente */}
                  {/** ... keep existing code (other admin routes) */}
                  <AdminCompanies />
                </ProtectedRoute>
              } />
              <Route path="/admin/channels" element={
                <ProtectedRoute>
                  <AdminChannels />
                </ProtectedRoute>
              } />
              <Route path="/admin/roles" element={
                <ProtectedRoute>
                  <AdminRoles />
                </ProtectedRoute>
              } />
              
              {/* Client Portal Routes */}
              <Route path="/c/:slug" element={
                <ProtectedRoute>
                  <ClientCalendar />
                </ProtectedRoute>
              } />
              <Route path="/c/:slug/kanban" element={
                <ProtectedRoute>
                  <ClientKanban />
                </ProtectedRoute>
              } />
              <Route path="/c/:slug/post/:id" element={
                <ProtectedRoute>
                  <ClientPost />
                </ProtectedRoute>
              } />
              <Route path="/c/:slug/campaigns" element={
                <ProtectedRoute>
                  <ClientCampaigns />
                </ProtectedRoute>
              } />
              <Route path="/c/:slug/library" element={
                <ProtectedRoute>
                  <ClientLibrary />
                </ProtectedRoute>
              } />
              <Route path="/c/:slug/settings" element={
                <ProtectedRoute>
                  <ClientSettings />
                </ProtectedRoute>
              } />
              <Route path="/c/:slug/exports" element={
                <ProtectedRoute>
                  <ClientExports />
                </ProtectedRoute>
              } />
              
              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;