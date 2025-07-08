import React from 'react';
import { Link } from 'react-router-dom';
import { Database, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  showBackButton?: boolean;
  title?: string;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  showBackButton = false, 
  title,
  className 
}) => {
  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground h-10 w-10"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          )}
          
          <Link to="/" className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Database className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                {title || 'Airtable Gallery'}
              </h1>
              <p className="text-xs text-muted-foreground">
                Powered by Airtable API
              </p>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Connected</span>
          </div>
        </div>
      </div>
    </header>
  );
};