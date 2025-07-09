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
  const title = record.fields.Name || 'Untitled Property';
  const summary = record.fields.Notes || '';
  const bhkType = record.fields.Assignee || '';
  const propertyType = record.fields.Status || '';
  const location = Array.isArray(record.fields['Attachment Summary']) 
    ? record.fields['Attachment Summary'].join(', ') 
    : record.fields['Attachment Summary'] || '';
  // const priceEstimate = record.fields.price_estimate || '';
  const priceEstimate = 'TBD'
  const status = record.fields['status 2'] || '';
  const areaSize = record.fields.Attachments || '';
  const screenshots = record.fields.screenshot_refs;
  
  // Handle image URL - for now using placeholder since screenshots are filenames
  const imageUrl = screenshots ? `https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80` : null;

  return (
    <Card 
      className={cn(
        "cursor-pointer card-hover shadow-card hover:shadow-card-hover border-border/50",
        "group overflow-hidden bg-card h-96 flex flex-col",
        className
      )}
      onClick={handleClick}
    >
      {imageUrl && (
        <div className="aspect-video w-full overflow-hidden flex-shrink-0">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}
      
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-card-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          {status && (
            <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
              status === 'For Sale' ? 'bg-blue-100 text-blue-700' :
              status === 'For Rent' ? 'bg-green-100 text-green-700' :
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
      
      <CardContent className="pb-2 space-y-2 flex-1 overflow-hidden">
        {summary && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {summary}
          </p>
        )}
        {location && (
          <p className="text-sm text-primary font-medium line-clamp-1">
            📍 {location}
          </p>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between w-full">
          {priceEstimate && priceEstimate !== 'unknown' && (
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