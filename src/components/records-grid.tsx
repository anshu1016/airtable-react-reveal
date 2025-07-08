import React from 'react';
import { RecordCard } from './record-card';
import { LoadingSpinner } from './ui/loading-spinner';
import { ErrorMessage } from './ui/error-message';
import { useAirtable } from '../context/AirtableContext';
import { useAirtableAPI } from '../hooks/useAirtableAPI';
import { cn } from '@/lib/utils';

interface RecordsGridProps {
  className?: string;
}

const LoadingCard = () => (
  <div className="bg-card border border-border/50 rounded-lg overflow-hidden shadow-card">
    <div className="aspect-video w-full loading-shimmer" />
    <div className="p-6 space-y-3">
      <div className="h-4 loading-shimmer rounded" />
      <div className="h-3 loading-shimmer rounded w-3/4" />
      <div className="h-3 loading-shimmer rounded w-1/2" />
    </div>
  </div>
);

export const RecordsGrid: React.FC<RecordsGridProps> = ({ className }) => {
  const { state } = useAirtable();
  const { fetchRecords } = useAirtableAPI();

  if (state.loading) {
    return (
      <div className={cn("container mx-auto px-4 py-8", className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <LoadingCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className={cn("container mx-auto px-4 py-8", className)}>
        <ErrorMessage 
          message={state.error}
          onRetry={fetchRecords}
        />
      </div>
    );
  }

  if (state.records.length === 0) {
    return (
      <div className={cn("container mx-auto px-4 py-8", className)}>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No records found
          </h3>
          <p className="text-muted-foreground">
            Your Airtable appears to be empty or there was an issue loading the data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("container mx-auto px-4 py-8", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {state.records.map((record, index) => (
          <div
            key={record.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <RecordCard record={record} />
          </div>
        ))}
      </div>
    </div>
  );
};