import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { ClientsPage } from './components/ClientsPage';
import { ProjectsPage } from './components/ProjectsPage';
import { CalendarPage } from './components/CalendarPage';
import { ClientDetailPage } from './components/ClientDetailPage';
import { UserProfilePage } from './components/UserProfilePage';
import { SubscriptionPage } from './components/SubscriptionPage';
import { AdminPage } from './components/AdminPage';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './components/LoginPage';
import { MobileHeader } from './components/MobileHeader';
import { Toaster } from './components/ui/sonner';
import { User, authAPI } from './api/apiClient';
import { toast } from 'sonner';


// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const savedUser = localStorage.getItem('currentUser');
  if (!savedUser) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// Restricted Route Component - Only for ACTIVE or ADMIN users
function RestrictedRoute({ children, user }: { children: React.ReactNode; user: User }) {
  if (user.status !== 'ACTIVE' && user.status !== 'ADMIN') {
    return <Navigate to="/profile" replace />;
  }
  return <>{children}</>;
}

// Main Layout Component
function MainLayout({ user, onLogout, onUpdateUser }: { user: User; onLogout: () => void; onUpdateUser: (user: User) => void }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const currentPage = location.pathname.split('/')[1] || 'dashboard';

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden max-w-full">
      <Sidebar
        currentPage={currentPage} 
        user={user}
        onLogout={onLogout}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <MobileHeader
          onMenuClick={() => setIsMobileMenuOpen(true)}
          user={user}
        />
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          {/* Children routes will render here */}
          <Routes>
            <Route path="/" element={<Navigate to={user.status === 'ACTIVE' || user.status === 'ADMIN' ? "/dashboard" : "/profile"} replace />} />
            <Route path="/dashboard" element={<RestrictedRoute user={user}><DashboardWrapper /></RestrictedRoute>} />
            <Route path="/clients" element={<RestrictedRoute user={user}><ClientsWrapper /></RestrictedRoute>} />
            <Route path="/clients/:clientId" element={<RestrictedRoute user={user}><ClientDetailWrapper /></RestrictedRoute>} />
            <Route path="/projects" element={<RestrictedRoute user={user}><ProjectsWrapper /></RestrictedRoute>} />
            <Route path="/projects/:projectId" element={<RestrictedRoute user={user}><ProjectDetailWrapper /></RestrictedRoute>} />
            <Route path="/calendar" element={<RestrictedRoute user={user}><CalendarPage /></RestrictedRoute>} />
            <Route path="/profile" element={<UserProfileWrapper user={user} onUpdateUser={onUpdateUser} />} />
            <Route path="/subscription" element={<SubscriptionWrapper />} />
            <Route path="/admin" element={user.status === 'ADMIN' ? <AdminPage /> : <Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
      <Toaster />
    </div>
  );
}

// Wrapper components to handle navigation
function DashboardWrapper() {
  const navigate = useNavigate();
  
  const handleNavigate = (page: string, clientId?: string) => {
    if (page === 'client-detail' && clientId) {
      navigate(`/clients/${clientId}`);
    } else {
      navigate(`/${page}`);
    }
  };

  return <Dashboard onNavigate={handleNavigate} />;
}

function ClientsWrapper() {
  const navigate = useNavigate();
  
  return <ClientsPage onSelectClient={(id) => navigate(`/clients/${id}`)} />;
}

function ClientDetailWrapper() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  
  return (
    <ClientDetailPage 
      clientId={clientId!} 
      onBack={() => navigate('/clients')}
      onNavigateToProject={(projectId) => navigate(`/projects/${projectId}`)}
    />
  );
}

function ProjectsWrapper() {
  const navigate = useNavigate();

  return (
    <ProjectsPage
      onNavigateToClient={(clientId) => navigate(`/clients/${clientId}`)}
    />
  );
}

function ProjectDetailWrapper() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  return (
    <ProjectsPage
      projectId={projectId}
      onNavigateToClient={(clientId) => navigate(`/clients/${clientId}`)}
    />
  );
}

function UserProfileWrapper({ user, onUpdateUser }: { user: User; onUpdateUser: (user: User) => void }) {
  const navigate = useNavigate();

  return (
    <UserProfilePage
      user={user}
      onUpdateUser={onUpdateUser}
      onNavigateToSubscription={() => navigate('/subscription')}
    />
  );
}

function SubscriptionWrapper() {
  const navigate = useNavigate();

  return (
    <SubscriptionPage
      onBack={() => navigate('/profile')}
    />
  );
}

// OAuth Login Wrapper - Handles Google OAuth callback
function LoginWrapper({ onLogin }: { onLogin: (user: User) => void }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      handleOAuthCallback(token);
    }
  }, [searchParams]);

  const handleOAuthCallback = async (token: string) => {
    setIsLoading(true);
    try {
      // Sauvegarder le token dans localStorage
      localStorage.setItem('authToken', token);
      
      // Récupérer les informations de l'utilisateur
      const user = await authAPI.getCurrentUser();
      
      // Connexion de l'utilisateur
      onLogin(user);
      
      // Nettoyer l'URL et rediriger
      const redirectTo = user.status === 'ACTIVE' ? '/dashboard' : '/profile';
      navigate(redirectTo, { replace: true });
      
      toast.success(`Bienvenue ${user.name} !`);
    } catch (error) {
      console.error('Erreur lors de l\'authentification OAuth:', error);
      toast.error('Erreur lors de la connexion avec Google');
      
      // Nettoyer le token invalide et rediriger vers login
      localStorage.removeItem('authToken');
      navigate('/login', { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connexion en cours...</p>
        </div>
      </div>
    );
  }

  return <LoginPage onLogin={onLogin} />;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingOAuth, setIsLoadingOAuth] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedToken = localStorage.getItem('authToken');

    if (savedUser && savedToken) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
      }
    } else {
      // Nettoyer si l'un des deux manque
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
    }
    setIsInitializing(false);
  }, []);

  // Écouter les changements du localStorage pour détecter la déconnexion forcée (token expiré)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'currentUser' && event.newValue === null) {
        setCurrentUser(null);
      }
    };

    // Vérifier périodiquement si le localStorage a été vidé (pour le même onglet)
    const checkLogout = () => {
      const savedUser = localStorage.getItem('currentUser');
      if (!savedUser && currentUser) {
        setCurrentUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(checkLogout, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const handleUpdateUser = (updatedUser: User) => {
    
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  // Afficher un écran de chargement pendant l'initialisation
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            currentUser && localStorage.getItem('currentUser') ? (
              <Navigate to={currentUser.status === 'ACTIVE' || currentUser.status === 'ADMIN' ? "/dashboard" : "/profile"} replace />
            ) : (
              <LoginWrapper onLogin={handleLogin} />
            )
          } 
        />
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              {currentUser && (
                <MainLayout user={currentUser} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />
              )}
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}
