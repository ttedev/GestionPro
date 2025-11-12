import { Menu, Sprout } from 'lucide-react';
import { Button } from './ui/button';

interface MobileHeaderProps {
  onMenuClick: () => void;
  user?: { name: string; company: string };
}

export function MobileHeader({ onMenuClick, user }: MobileHeaderProps) {
  return (
    <header className="lg:hidden sticky top-0 z-40 w-full bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-green-800 text-sm">GestiJardin Pro</h1>
            {user && (
              <p className="text-xs text-gray-500">{user.company}</p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="text-gray-600"
        >
          <Menu className="w-6 h-6" />
        </Button>
      </div>
    </header>
  );
}
