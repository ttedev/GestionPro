import { LayoutDashboard, Users, Briefcase, Calendar, Sprout, LogOut, User, Shield } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTitle } from './ui/sheet';
import { User as UserType } from '../api/apiClient';

interface SidebarProps {
  currentPage: string;
  user?: UserType;
  onLogout?: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ user, onLogout, isMobileOpen, onMobileClose }: SidebarProps) {
  const navigate = useNavigate();
  
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'clients', label: 'Clients', icon: Users, path: '/clients' },
    { id: 'projects', label: 'Projets', icon: Briefcase, path: '/projects' },
    { id: 'calendar', label: 'Planning', icon: Calendar, path: '/calendar' },
  ];

  // Ajouter le menu Admin pour les utilisateurs admin
  const adminMenuItem = { id: 'admin', label: 'Administration', icon: Shield, path: '/admin' };

  const handleLogout = () => {
    onLogout?.();
    onMobileClose?.();
    navigate('/login');
  };

  // Only show menu items if user is ACTIVE or ADMIN
  const isUserActive = user?.status === 'ACTIVE' || user?.status === 'ADMIN';
  const isAdmin = user?.status === 'ADMIN';

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
          <Sprout className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-green-800">GestiJardin Pro</h1>
          <p className="text-sm text-gray-500">Gestion d'activité</p>
        </div>
      </div>

      <nav className="space-y-2 flex-1">
        {isUserActive && menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={() => onMobileClose?.()}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {/* Menu Admin pour les utilisateurs admin */}
        {isAdmin && (
          <NavLink
            to={adminMenuItem.path}
            onClick={() => onMobileClose?.()}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-purple-600 hover:bg-purple-50'
              }`
            }
          >
            <Shield className="w-5 h-5" />
            <span>{adminMenuItem.label}</span>
          </NavLink>
        )}

        {!isUserActive && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium mb-1">Compte en attente</p>
            <p className="text-xs text-yellow-700">
              Votre compte n'est pas encore actif. Veuillez contacter l'administrateur.
            </p>
          </div>
        )}
      </nav>

      {user && (
        <div className="mt-auto pt-6 border-t border-gray-200 space-y-3">
          <NavLink 
            to="/profile"
            onClick={() => onMobileClose?.()}
            className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.company}</p>
            </div>
          </NavLink>
          {onLogout && (
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Se déconnecter
            </Button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 p-6 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <Sheet open={isMobileOpen} onOpenChange={onMobileClose}>
        <SheetContent side="left" className="w-64 p-6" aria-describedby={undefined}>
          <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
          {sidebarContent}
        </SheetContent>
      </Sheet>
    </>
  );
}
