import React, { useEffect, useState } from 'react';
import { Header } from '../components/header';
import { RecordsGrid } from '../components/records-grid';
import { SetupInstructions } from '../components/setup-instructions';
import { VideoUploadModal } from '../components/video-upload-modal';
import { useAirtableAPI } from '../hooks/useAirtableAPI';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';

export const HomePage: React.FC = () => {
  const { fetchRecords } = useAirtableAPI();
  const [showInstructions, setShowInstructions] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Check if using demo data
  const isUsingDemoData = !import.meta.env.VITE_AIRTABLE_BASE_ID || 
                         import.meta.env.VITE_AIRTABLE_BASE_ID === '<BASE_ID_OF_THE_AIRTABLE_TABLE>';

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <main>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold gradient-text mb-4">
              Your Content Gallery
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Explore your Airtable data in a beautiful, responsive interface. 
              Click on any card to view detailed information.
            </p>
            
            {isUsingDemoData && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <p className="text-amber-800 text-sm font-medium mb-2">
                    🚀 Currently showing demo data
                  </p>
                  <button
                    onClick={() => setShowInstructions(!showInstructions)}
                    className="inline-flex items-center text-amber-700 hover:text-amber-900 text-sm font-medium transition-colors"
                  >
                    {showInstructions ? 'Hide' : 'Show'} setup instructions
                    {showInstructions ? (
                      <ChevronUp className="w-4 h-4 ml-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {showInstructions && isUsingDemoData && (
            <div className="mb-8">
              <SetupInstructions />
            </div>
          )}
        </div>
        <RecordsGrid />
      </main>

      {/* Floating Action Button */}
      <Button
        onClick={() => setIsUploadModalOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl z-50"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Video Upload Modal */}
      <VideoUploadModal 
        open={isUploadModalOpen} 
        onOpenChange={setIsUploadModalOpen} 
      />
    </div>
  );
};