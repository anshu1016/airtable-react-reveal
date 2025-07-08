import React from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Database, Key, Settings } from 'lucide-react';

export const SetupInstructions: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto shadow-card border-border/50">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-primary rounded-lg">
              <Database className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold gradient-text mb-2">
            Connect Your Airtable
          </h2>
          <p className="text-muted-foreground">
            Currently showing demo data. Follow these steps to connect your real Airtable.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-muted/30 rounded-lg">
              <Key className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">1. Get API Token</h3>
              <p className="text-sm text-muted-foreground">
                Go to airtable.com/create/tokens and create a personal access token with read permissions
              </p>
            </div>
            
            <div className="text-center p-6 bg-muted/30 rounded-lg">
              <Database className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">2. Get Base ID</h3>
              <p className="text-sm text-muted-foreground">
                Find your Base ID in the Airtable API documentation for your base
              </p>
            </div>
            
            <div className="text-center p-6 bg-muted/30 rounded-lg">
              <Settings className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">3. Configure App</h3>
              <p className="text-sm text-muted-foreground">
                Set environment variables and restart the app
              </p>
            </div>
          </div>
          
          <div className="bg-card border border-border/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Environment Variables</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create a <code className="bg-muted px-2 py-1 rounded text-xs">.env</code> file in your project root with:
            </p>
            <div className="bg-muted/50 p-4 rounded-lg font-mono text-sm">
              <div className="text-muted-foreground"># Your Airtable configuration</div>
              <div>VITE_AIRTABLE_BASE_ID=your_base_id_here</div>
              <div>VITE_AIRTABLE_API_TOKEN=your_api_token_here</div>
              <div>VITE_TABLE_NAME=Imported Table</div>
            </div>
          </div>
          
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <h4 className="text-sm font-medium text-primary mb-2">💡 Pro Tip</h4>
            <p className="text-sm text-muted-foreground">
              Make sure your Airtable table has fields like <code className="bg-muted px-1 rounded text-xs">title</code>, 
              <code className="bg-muted px-1 rounded text-xs">description</code>, and 
              <code className="bg-muted px-1 rounded text-xs">image</code> for the best experience.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};