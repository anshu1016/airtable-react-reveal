import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { AirtableRecord } from '../types/airtable';
import { cn } from '@/lib/utils';

interface RecordCardProps {
  record: AirtableRecord;
  className?: string;
}

export const RecordCard: React.FC<RecordCardProps> = ({ record, className }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/details/${record.id}`);
  };

  // Extract property-specific fields using new schema
  const title = record.fields.title || 'Untitled Property';
  const summary = record.fields.summary || '';
  const bhkType = record.fields.bhk_type || '';
  const propertyType = record.fields.property_type || '';
  const location = Array.isArray(record.fields.location) 
    ? record.fields.location.join(', ') 
    : record.fields.location || '';
  const priceEstimate = record.fields.price_estimate || '';
  const status = record.fields.status || '';
  const furnishedStatus = record.fields.furnished_status || '';
  const areaSize = record.fields.area_sqft || '';
  const amenities = record.fields.amenities || [];
  const highlights = record.fields.highlights || [];
  const screenshots = record.fields.screenshot_refs;
  
  // Handle image URL with error fallback
  const getImageUrl = (): string => {
    if (screenshots) {
      // Handle both old format (array) and new format (string)
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

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    const styles = {
      'Available': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      'For Sale': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      'Under Construction': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      'Sold': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'For Rent': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer group overflow-hidden bg-card border-border/50 relative",
        "transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10",
        "animate-fade-in hover:border-primary/30",
        className
      )}
      onClick={handleClick}
    >
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-glow/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {imageUrl && (
        <div className="aspect-video w-full overflow-hidden flex-shrink-0 relative">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              console.log('❌ Image failed to load:', imageUrl);
              e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
            }}
          />
          {/* Image overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Status badge on image */}
          {status && (
            <div className={cn(
              "absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm",
              "transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-100",
              getStatusBadge(status)
            )}>
              {status}
            </div>
          )}
        </div>
      )}
      
      <div className="p-5 space-y-4">
        {/* Header with title */}
        <div className="space-y-2">
          <h3 className="font-bold text-lg text-card-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          
          {/* Property details */}
          {(bhkType || propertyType || areaSize) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {bhkType && <span className="font-semibold text-primary">{bhkType}</span>}
              {bhkType && propertyType && <span>•</span>}
              {propertyType && <span>{propertyType}</span>}
              {areaSize && (
                <>
                  <span>•</span>
                  <span className="font-medium">{areaSize} sqft</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Summary */}
        {summary && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {summary}
          </p>
        )}

        {/* Location */}
        {location && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-lg">📍</span>
            <span className="font-medium text-primary line-clamp-1">{location}</span>
          </div>
        )}

        {/* Amenities preview */}
        {amenities && amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {amenities.slice(0, 3).map((amenity: string, index: number) => (
              <span 
                key={index}
                className="px-2 py-1 bg-muted/50 text-xs rounded-md text-muted-foreground"
              >
                {amenity}
              </span>
            ))}
            {amenities.length > 3 && (
              <span className="px-2 py-1 bg-primary/10 text-xs rounded-md text-primary">
                +{amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer with price and furnished status */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          {priceEstimate && (
            <div className="space-y-1">
              <span className="text-lg font-bold gradient-text">
                {priceEstimate}
              </span>
              {furnishedStatus && (
                <div className="text-xs text-muted-foreground">
                  {furnishedStatus}
                </div>
              )}
            </div>
          )}
          
          {/* Animated arrow */}
          <div className="flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
            <span className="text-sm font-medium">View Details</span>
            <div className="w-5 h-0.5 bg-gradient-primary rounded-full" />
          </div>
        </div>
      </div>
    </Card>
  );
};