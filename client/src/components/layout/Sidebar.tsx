import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  Search,
  Home,
  DollarSign,
  Building,
  Package,
  Settings,
  ChevronDown
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const Sidebar = () => {
  const [location] = useLocation();
  const { user } = useAuth();
  const [openMenus, setOpenMenus] = useState({
    finance: true,
    projects: false,
    inventory: false
  });

  const toggleMenu = (menu: keyof typeof openMenus) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const isActive = (path: string) => location === path;

  return (
    <aside className="z-10 hidden w-64 flex-shrink-0 overflow-y-auto bg-white dark:bg-gray-800 shadow-md md:block">
      <div className="py-4 h-full flex flex-col">
        {/* Logo */}
        <div className="flex items-center justify-center">
          <h1 className="text-2xl font-bold text-primary dark:text-primary-foreground">
            Cogniflow<span className="text-purple-500">ERP</span>
          </h1>
        </div>

        {/* Search */}
        <div className="mt-6 px-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Search..."
            />
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 mt-6 px-3">
          {/* Dashboard Section */}
          <div className="space-y-1">
            <Link href="/">
              <span className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer",
                isActive("/")
                  ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-100"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}>
                <Home className="w-5 h-5 mr-2" />
                Dashboard
              </span>
            </Link>
          </div>

          {/* Finance Module */}
          <div className="mt-4">
            <button
              onClick={() => toggleMenu("finance")}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            >
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Finance
              </div>
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                openMenus.finance ? "transform rotate-180" : ""
              )} />
            </button>

            {openMenus.finance && (
              <div className="mt-1 space-y-1 pl-6">
                <Link href="/finance/general-ledger">
                  <span className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer",
                    isActive("/finance/general-ledger")
                      ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-100"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}>
                    General Ledger
                  </span>
                </Link>
                <Link href="/finance/accounts-payable">
                  <span className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer",
                    isActive("/finance/accounts-payable")
                      ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-100"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}>
                    Accounts Payable
                  </span>
                </Link>
                <Link href="/finance/accounts-receivable">
                  <span className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer",
                    isActive("/finance/accounts-receivable")
                      ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-100"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}>
                    Accounts Receivable
                  </span>
                </Link>
                <Link href="/finance/reports">
                  <span className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer",
                    isActive("/finance/reports")
                      ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-100"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}>
                    Financial Reports
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Projects Module */}
          <div className="mt-4">
            <button
              onClick={() => toggleMenu("projects")}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            >
              <div className="flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Projects
              </div>
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                openMenus.projects ? "transform rotate-180" : ""
              )} />
            </button>

            {openMenus.projects && (
              <div className="mt-1 space-y-1 pl-6">
                <Link href="/projects/dashboard">
                  <span className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                    Project Dashboard
                  </span>
                </Link>
                <Link href="/projects/manage">
                  <span className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                    Manage Projects
                  </span>
                </Link>
                <Link href="/projects/schedule">
                  <span className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                    Schedule & Timeline
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Inventory Module */}
          <div className="mt-4">
            <button
              onClick={() => toggleMenu("inventory")}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            >
              <div className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Inventory
              </div>
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                openMenus.inventory ? "transform rotate-180" : ""
              )} />
            </button>

            {openMenus.inventory && (
              <div className="mt-1 space-y-1 pl-6">
                <Link href="/inventory/materials">
                  <span className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                    Materials
                  </span>
                </Link>
                <Link href="/inventory/equipment">
                  <span className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                    Equipment
                  </span>
                </Link>
                <Link href="/inventory/suppliers">
                  <span className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                    Suppliers
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="mt-4">
            <Link href="/settings">
              <span className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer",
                isActive("/settings")
                  ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-100"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}>
                <Settings className="w-5 h-5 mr-2" />
                Settings
              </span>
            </Link>
          </div>
        </ScrollArea>

        {/* User Info */}
        {user && (
          <div className="mt-4 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center text-primary-700 dark:text-primary-200 font-semibold">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
