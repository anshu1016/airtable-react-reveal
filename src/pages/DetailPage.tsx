import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '../components/header';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { ErrorMessage } from '../components/ui/error-message';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { useAirtable } from '../context/AirtableContext';
import { useAirtableAPI } from '../hooks/useAirtableAPI';
import { AmenitiesForm } from '../components/amenities-form';
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
  console.log('🏠 DetailPage record data:', record);
  
  // Updated field mappings to match new schema
  const title = record.fields.title || record.fields.Name || 'Untitled Property';
  const summary = record.fields.summary || record.fields.Notes || '';
  const bhkType = record.fields.bhk_type || record.fields.Assignee || '';
  const propertyType = record.fields.property_type || record.fields.Status || '';
  const location = Array.isArray(record.fields.location) 
    ? record.fields.location.join(', ') 
    : record.fields.location || record.fields['Attachment Summary'] || '';
  const priceEstimate = record.fields.price_estimate || 'Price on request';
  const status = record.fields.status || record.fields['status 2'] || '';
  const furnishedStatus = record.fields.furnished_status || '';
  const areaSize = record.fields.area_sqft || record.fields.Attachments || '';
  const amenities = Array.isArray(record.fields.amenities) ? record.fields.amenities : [];
  
  // Handle highlights - now it's already an array in the new schema
  const highlights = Array.isArray(record.fields.highlights) 
    ? record.fields.highlights 
    : (record.fields.highlights ? record.fields.highlights.split(', ') : []);
    
  const screenshots = record.fields.screenshot_refs;
  
  // Handle image URL with fallback
  const getImageUrl = (): string => {
    if (screenshots) {
      if (Array.isArray(screenshots) && screenshots.length > 0) {
        return screenshots[0].url;
      }
      if (typeof screenshots === 'string' && screenshots.trim()) {
        return screenshots;
      }
    }
    return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
  };
  
  const imageUrl = getImageUrl();

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
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-card-foreground mb-2">
                    {title}
                  </h1>
                  <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground mb-3">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(record.createdTime).toLocaleDateString()}
                    </div>
                    {status && (
                      <span className={`px-3 py-1 rounded-full font-medium ${
                        status === 'Available' ? 'bg-green-100 text-green-700' :
                        status === 'Sold' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {status}
                      </span>
                    )}
                  </div>
                  {location && (
                    <p className="text-primary font-medium text-lg">
                      📍 {location}
                    </p>
                  )}
                </div>
                
                {priceEstimate && (
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      {priceEstimate}
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Property Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {bhkType && (
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <div className="text-sm text-muted-foreground">Type</div>
                    <div className="font-semibold text-card-foreground">{bhkType}</div>
                  </div>
                )}
                {propertyType && (
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <div className="text-sm text-muted-foreground">Property</div>
                    <div className="font-semibold text-card-foreground">{propertyType}</div>
                  </div>
                )}
                {areaSize && (
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <div className="text-sm text-muted-foreground">Area</div>
                    <div className="font-semibold text-card-foreground">{areaSize} sqft</div>
                  </div>
                )}
                {furnishedStatus && (
                  <div className="p-4 bg-muted/30 rounded-lg text-center">
                    <div className="text-sm text-muted-foreground">Furnished</div>
                    <div className="font-semibold text-card-foreground">{furnishedStatus}</div>
                  </div>
                )}
              </div>

              {summary && (
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-3">
                    Summary
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {summary}
                  </p>
                </div>
              )}

              <AmenitiesForm 
                currentAmenities={amenities}
                onUpdate={(newAmenities) => {
                  // TODO: Implement API call to update amenities
                  console.log('Updating amenities:', newAmenities);
                }}
                recordId={record.id}
              />

              {highlights.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-3">
                    Key Highlights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center p-2 bg-primary/10 rounded">
                        <span className="text-primary mr-2">★</span>
                        <span className="text-sm font-medium">{highlight}</span>
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