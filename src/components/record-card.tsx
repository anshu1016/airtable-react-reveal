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

  // Extract common fields - adjust these based on your actual Airtable fields
  const title = record.fields.title || record.fields.Title || record.fields.name || record.fields.Name || 'Untitled';
  const description = record.fields.description || record.fields.Description || record.fields.notes || record.fields.Notes || '';
  const image = record.fields.image || record.fields.Image || record.fields.photo || record.fields.Photo;
  
  // Handle image URL - Airtable images are usually arrays with attachment objects
  const imageUrl = Array.isArray(image) && image.length > 0 ? image[0].url : null;

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
        <h3 className="font-semibold text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
      </CardHeader>
      
      {description && (
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {description}
          </p>
        </CardContent>
      )}
      
      <CardFooter className="pt-2 pb-4">
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-muted-foreground">
            {new Date(record.createdTime).toLocaleDateString()}
          </span>
          <div className="w-0 h-0.5 bg-gradient-primary group-hover:w-8 transition-all duration-300" />
        </div>
      </CardFooter>
    </Card>
  );
};