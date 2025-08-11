'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, Bell, HelpCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-between h-16">
              {/* Left side - Mobile menu button + Title */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleSidebar}
                  className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Menu size={20} className="text-gray-600" />
                </button>
                
                {title && (
                  <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
                    {title}
                  </h1>
                )}
              </div>

              {/* Right side - Actions + User */}
              <div className="flex items-center space-x-4">
                {/* Help Center */}
                <button className="p-2 rounded-md hover:bg-gray-100 transition-colors">
                  <HelpCircle size={20} className="text-gray-600" />
                </button>

                {/* Notifications */}
                <button className="p-2 rounded-md hover:bg-gray-100 transition-colors relative">
                  <Bell size={20} className="text-gray-600" />
                  {/* Notification badge */}
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Info */}
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-gray-900">{user?.nama || 'User'}</p>
                    <p className="text-xs text-gray-500">{user?.role}</p>
                  </div>
                  
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-700 font-bold text-sm">
                      {user?.nama?.charAt(0) || 'U'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}