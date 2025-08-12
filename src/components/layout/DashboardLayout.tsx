'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, Bell, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 lg:px-6">
            <div className="flex items-center justify-between h-16">
              {/* Left side */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleSidebar}
                  className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Menu size={20} className="text-gray-600" />
                </button>
                {title && (
                  <h1 className="text-lg font-semibold text-gray-900 truncate">
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

                {/* User Avatar + Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-gray-900">{user?.nama || 'User'}</p>
                    <p className="text-xs text-gray-500">{user?.role}</p>
                  </div>
                  <div
                    className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-400 transition-colors"
                    onClick={toggleDropdown}
                  >
                    <span className="text-gray-700 font-bold text-sm">
                      {user?.nama?.charAt(0) || 'U'}
                    </span>
                  </div>

                  {/* Dropdown */}
                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-2 animate-fadeIn"
                      style={{ animationDuration: '150ms' }}
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.nama || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.role || 'Role'}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-red-50 transition-colors text-red-600"
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

      {/* Animasi FadeIn */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn ease-out forwards;
        }
      `}</style>
    </div>
  );
}
