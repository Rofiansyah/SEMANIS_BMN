'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { 
  Home, 
  Package, 
  Building, 
  Tag, 
  BarChart3, 
  Search,
  History,
  ChevronDown,
  ChevronRight,
  X,
  HelpCircle,
  LogOut,
  ClipboardList,
  CheckCircle,
  BookOpen
} from 'lucide-react';

interface SidebarItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: SidebarItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { user, isAdmin, logout } = useAuth();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const adminMenuItems: SidebarItem[] = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: <Home size={20} />
    },
    {
      label: 'Data Master',
      icon: <Package size={20} />,
      children: [
        { label: 'Barang', href: '/admin/barang', icon: <Package size={16} /> },
        { label: 'Kategori', href: '/admin/kategori', icon: <Tag size={16} /> },
        { label: 'Merek', href: '/admin/merek', icon: <Building size={16} /> },
        { label: 'Lokasi', href: '/admin/lokasi', icon: <Building size={16} /> }
      ]
    },
    {
      label: 'Peminjaman',
      icon: <ClipboardList size={20} />,
      children: [
        { label: 'Menunggu Persetujuan', href: '/admin/peminjaman/approve', icon: <CheckCircle size={16} /> },
        { label: 'Sedang Dipinjam', href: '/admin/peminjaman/approved', icon: <BookOpen size={16} /> },
        { label: 'Laporan', href: '/admin/peminjaman/reports', icon: <BarChart3 size={16} /> }
      ]
    },
    
  ];

  const userMenuItems: SidebarItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <Home size={20} />
    },
    {
      label: 'Cari Barang',
      href: '/user/search',
      icon: <Search size={20} />
    },
    {
      label: 'Status Peminjaman',
      href: '/user/status',
      icon: <ClipboardList size={20} />
    },
    {
      label: 'Riwayat Peminjaman',
      href: '/user/history',
      icon: <History size={20} />
    }
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  const isActiveItem = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const renderMenuItem = (item: SidebarItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);
    const isActive = isActiveItem(item.href);

    if (hasChildren) {
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleExpanded(item.label)}
            className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-yellow-100 transition-colors ${
              level > 0 ? 'pl-8' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              {item.icon}
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </div>
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          {isExpanded && (
            <div className="bg-gray-50">
              {item.children!.map(child => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link key={item.label} href={item.href!}>
        <div className={`flex items-center space-x-3 px-4 py-3 hover:bg-yellow-100 transition-colors ${
          level > 0 ? 'pl-8' : ''
        } ${isActive ? 'bg-yellow-200 border-r-4 border-yellow-500' : ''}`}>
          {item.icon}
          <span className={`text-sm font-medium ${isActive ? 'text-yellow-800' : 'text-gray-700'}`}>
            {item.label}
          </span>
        </div>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition duration-300 ease-in-out lg:static lg:inset-0 w-64 bg-white border-r border-gray-200 z-50 flex flex-col`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Image
              src="/logo_semantis.png"
              alt="SEMANTIS BMN Logo"
              width={32}
              height={32}
              className="object-contain"
            />
            <div>
              <h1 className="text-sm font-bold text-gray-900">SEMANTIS BMN</h1>
              <p className="text-xs text-gray-500">Sistem Inventaris</p>
            </div>
          </div>
          
          {/* Mobile Close Button */}
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-2">
          {menuItems.map(item => renderMenuItem(item))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          {/* User Info */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-600">
                {user?.nama?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{user?.nama || 'User'}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 rounded-md transition-colors">
              <HelpCircle size={16} />
              <span className="text-sm text-gray-700">Help Center</span>
            </button>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-red-50 rounded-md transition-colors text-red-600"
            >
              <LogOut size={16} />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}