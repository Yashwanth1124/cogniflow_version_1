import { useState } from "react";
import { Bell, Sun, Moon, User, Settings, LogOut, Menu } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

const Header = () => {
  const { toggleTheme, theme } = useTheme();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    // This would typically use a state in a parent component or context
    // For demo, we'll toggle a class on the document element
    document.documentElement.classList.toggle("sidebar-open");
  };

  return (
    <header className="z-10 py-4 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-center justify-between px-6">
        {/* Mobile menu button */}
        <button
          className="p-1 mr-4 -ml-1 rounded-md md:hidden focus:outline-none focus:ring-2 focus:ring-primary-500"
          onClick={toggleSidebar}
        >
          <Menu className="w-6 h-6 text-gray-500 dark:text-gray-400" />
        </button>

        <div className="flex items-center">
          <span className="font-semibold text-gray-700 dark:text-gray-200 md:hidden">Cogniflow ERP</span>
        </div>

        {/* Header Right Section */}
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-600 dark:text-gray-400">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="darkModeToggle"
                type="checkbox"
                checked={theme === 'dark'}
                onChange={toggleTheme}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {/* Notifications */}
          <button className="p-1 relative text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full">
            <Bell className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-100">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <span className="ml-2 text-gray-700 dark:text-gray-300 hidden md:block">
                {user?.firstName} {user?.lastName}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Your Profile</span>
              </DropdownMenuItem>
              <Link href="/settings">
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
