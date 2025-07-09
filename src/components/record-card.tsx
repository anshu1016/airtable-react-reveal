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

  // Extract property-specific fields
  const title = record.fields.title || 'Untitled Property';
  const summary = record.fields.summary || '';
  const bhkType = record.fields.bhk_type || '';
  const propertyType = record.fields.property_type || '';
  const location = record.fields.location || '';
  const priceEstimate = record.fields.price_estimate || '';
  const status = record.fields.status || '';
  const areaSize = record.fields.area_sqft || '';
  const screenshots = record.fields.screenshot_refs;
  
  // Handle image URL - Airtable images are usually arrays with attachment objects
  const imageUrl = Array.isArray(screenshots) && screenshots.length > 0 ? screenshots[0].url : null;

  return (
    <Card 
      className={cn(
        "cursor-pointer card-hover shadow-card hover:shadow-card-hover border-border/50",
        "group overflow-hidden bg-card",
        className
      )}
      onClick={handleClick}
    >
      {imageUrl && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          {status && (
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              status === 'Available' ? 'bg-green-100 text-green-700' :
              status === 'Sold' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {status}
            </span>
          )}
        </div>
        {bhkType && propertyType && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">{bhkType}</span>
            <span>•</span>
            <span>{propertyType}</span>
            {areaSize && (
              <>
                <span>•</span>
                <span>{areaSize} sqft</span>
              </>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pb-2 space-y-2">
        {summary && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {summary}
          </p>
        )}
        {location && (
          <p className="text-sm text-primary font-medium">
            📍 {location}
          </p>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 pb-4">
        <div className="flex items-center justify-between w-full">
          {priceEstimate && (
            <span className="text-lg font-bold text-primary">
              {priceEstimate}
            </span>
          )}
          <div className="w-0 h-0.5 bg-gradient-primary group-hover:w-8 transition-all duration-300" />
        </div>
      </CardFooter>
    </Card>
  );
};