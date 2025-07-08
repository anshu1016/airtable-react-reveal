import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '../components/header';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { ErrorMessage } from '../components/ui/error-message';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { useAirtable } from '../context/AirtableContext';
import { useAirtableAPI } from '../hooks/useAirtableAPI';
import { Calendar, ExternalLink } from 'lucide-react';

export const DetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useAirtable();
  const { fetchRecord } = useAirtableAPI();

  useEffect(() => {
    if (id) {
      fetchRecord(id);
    }
  }, [id, fetchRecord]);

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header showBackButton />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <LoadingSpinner size="lg" className="py-20" />
          </div>
        </main>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header showBackButton />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <ErrorMessage 
              message={state.error}
              onRetry={() => id && fetchRecord(id)}
            />
          </div>
        </main>
      </div>
    );
  }

  if (!state.selectedRecord) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header showBackButton />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-20">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Record not found
              </h3>
              <p className="text-muted-foreground">
                The requested record could not be found.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const record = state.selectedRecord;
  const title = record.fields.title || record.fields.Title || record.fields.name || record.fields.Name || 'Untitled';
  const description = record.fields.description || record.fields.Description || record.fields.notes || record.fields.Notes || '';
  const image = record.fields.image || record.fields.Image || record.fields.photo || record.fields.Photo;
  const imageUrl = Array.isArray(image) && image.length > 0 ? image[0].url : null;

  // Get all fields except common ones for the details section
  const excludedFields = ['title', 'Title', 'name', 'Name', 'description', 'Description', 'notes', 'Notes', 'image', 'Image', 'photo', 'Photo'];
  const additionalFields = Object.entries(record.fields).filter(
    ([key]) => !excludedFields.includes(key)
  );

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header showBackButton title="Record Details" />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <Card className="shadow-card-hover border-border/50">
            {imageUrl && (
              <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <CardHeader className="pb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-card-foreground mb-2">
                    {title}
                  </h1>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    Created: {new Date(record.createdTime).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    ID: {record.id}
                  </span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {description && (
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-3">
                    Description
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </div>
              )}
              
              {additionalFields.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-4">
                    Additional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {additionalFields.map(([key, value]) => (
                      <div key={key} className="p-4 bg-muted/30 rounded-lg">
                        <dt className="text-sm font-medium text-card-foreground mb-1 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </dt>
                        <dd className="text-sm text-muted-foreground">
                          {typeof value === 'object' ? (
                            Array.isArray(value) ? (
                              value.map((item, index) => (
                                <div key={index} className="mb-1">
                                  {typeof item === 'object' && item.url ? (
                                    <a 
                                      href={item.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center text-primary hover:underline"
                                    >
                                      {item.filename || 'View File'}
                                      <ExternalLink className="w-3 h-3 ml-1" />
                                    </a>
                                  ) : (
                                    String(item)
                                  )}
                                </div>
                              ))
                            ) : (
                              JSON.stringify(value)
                            )
                          ) : (
                            String(value)
                          )}
                        </dd>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};