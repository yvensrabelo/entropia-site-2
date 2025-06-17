'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className={cn("min-h-screen flex flex-col")}>
      <Navbar />
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
};

export default Layout;