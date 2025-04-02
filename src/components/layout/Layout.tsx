
import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
  withoutFooter?: boolean;
  className?: string;
}

const Layout = ({ children, withoutFooter = false, className }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className={cn("flex-1 pt-20", className)}>
        {children}
      </main>
      {!withoutFooter && <Footer />}
    </div>
  );
};

export default Layout;
