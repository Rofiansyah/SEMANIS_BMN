'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, Bell, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main Content - kasih margin kiri di layar ≥ 1280px */}
      <div className="flex-1 flex flex-col overflow-hidden xl:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 relative">
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-between h-16">
              {/* Left side - Mobile menu button + Title */}
              <div className="flex items-center space-x-4">
                {/* Hamburger hanya muncul di layar kecil */}
                <button
                  onClick={toggleSidebar}
                  className="xl:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Menu size={20} className="text-gray-600" />
                </button>

                {title && (
                  <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
                    {title}
                  </h1>
                )}
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="p-2 rounded-md hover:bg-gray-100 transition-colors relative">
                  <Bell size={20} className="text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-3 p-1 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <div className="hidden sm:block text-right">
                      <p className="text-sm font-medium text-gray-900">{user?.nama || 'User'}</p>
                      <p className="text-xs text-gray-500">{user?.role}</p>
                    </div>

                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-700 font-bold text-sm">
                        {user?.nama?.charAt(0) || 'U'}
                      </span>
                    </div>
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50"
                    >
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-red-50 rounded-md transition-colors text-red-600"
                      >
                        <LogOut size={16} />
                        <span className="text-sm">Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
