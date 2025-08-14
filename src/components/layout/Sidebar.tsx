'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { 
  Home, 
  Package,  
  Tag, 
  BarChart3, 
  Search,
  MapPin,
  History,
  ChevronDown,
  ChevronRight,
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
  const { isAdmin } = useAuth();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const adminMenuItems: SidebarItem[] = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: <Home size={20} /> },
    {
      label: 'Data Master',
      icon: <Package size={20} />,
      children: [
        { label: 'Barang', href: '/admin/barang', icon: <Package size={16} /> },
        { label: 'Kategori', href: '/admin/kategori', icon: <Tag size={16} /> },
        { label: 'Merek', href: '/admin/merek', icon: <Tag size={16} /> },
        { label: 'Lokasi', href: '/admin/lokasi', icon: <MapPin size={16} /> }
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
    }
  ];

  const userMenuItems: SidebarItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: <Home size={20} /> },
    // { label: 'Cari Barang', href: '/user/search', icon: <Search size={20} /> },
    {
      label: 'Peminjaman',
      icon: <ClipboardList size={20} />,
      children: [
        { label: 'Status Peminjaman', href: '/user/status', icon: <ClipboardList size={16} /> },
        { label: 'Riwayat Peminjaman', href: '/user/history', icon: <History size={16} /> }
      ]
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
            className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-yellow-100 transition-colors rounded-md ${
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
            <div className="ml-2 border-l border-gray-200">
              {item.children!.map(child => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link key={item.label} href={item.href!}>
        <div className={`flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-yellow-100 transition-colors ${
          level > 0 ? 'pl-8' : ''
        } ${isActive ? 'bg-yellow-200 text-yellow-800 font-semibold' : 'text-gray-700'}`}>
          {item.icon}
          <span className="text-sm">{item.label}</span>
        </div>
      </Link>
    );
  };

  return (
    <>
      {/* Overlay untuk mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 xl:hidden drop-shadow-[0_0_15px_rgba(0,0,0,0.3)]"
          onClick={onToggle}
        />
      )}


      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 flex flex-col transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} xl:translate-x-0`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Image
              src="/logo_semantis.png"
              alt="SEMANTIS BMN Logo"
              className="w-100 sm:w-104 h-auto max-h-28 object-contain"
            />
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems.map(item => renderMenuItem(item))}
        </nav>
      </aside>
    </>
  );
}
