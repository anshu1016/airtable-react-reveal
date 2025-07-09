import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Plus, X } from 'lucide-react';

const AVAILABLE_AMENITIES = [
  'Lift',
  'Parking', 
  'Security',
  'CCTV',
  'Balcony',
  'Terrace',
  'Gym',
  'Play Area',
  'Party Lawn'
];

interface AmenitiesFormProps {
  currentAmenities: string[];
  onUpdate: (newAmenities: string[]) => void;
  recordId: string;
}

export const AmenitiesForm: React.FC<AmenitiesFormProps> = ({
  currentAmenities,
  onUpdate,
  recordId
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(currentAmenities);

  // Filter out already selected amenities
  const availableToAdd = AVAILABLE_AMENITIES.filter(
    amenity => !selectedAmenities.includes(amenity)
  );

  const handleToggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleSave = () => {
    onUpdate(selectedAmenities);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSelectedAmenities(currentAmenities);
    setIsEditing(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-card-foreground">
          Amenities
        </h3>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Edit
          </Button>
        )}
      </div>

      {isEditing ? (
        <Card className="border-dashed">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Edit Amenities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Selected Amenities */}
            {selectedAmenities.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Selected Amenities:
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedAmenities.map((amenity) => (
                    <Badge
                      key={amenity}
                      variant="secondary"
                      className="gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleToggleAmenity(amenity)}
                    >
                      {amenity}
                      <X className="w-3 h-3" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Available to Add */}
            {availableToAdd.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Add More:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableToAdd.map((amenity) => (
                    <label
                      key={amenity}
                      className="flex items-center space-x-2 p-2 rounded border cursor-pointer hover:bg-muted/30"
                    >
                      <Checkbox
                        checked={false}
                        onCheckedChange={() => handleToggleAmenity(amenity)}
                      />
                      <span className="text-sm">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} size="sm">
                Save Changes
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCancel}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Display Mode */
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {currentAmenities.map((amenity, index) => (
            <div key={index} className="flex items-center p-2 bg-muted/30 rounded">
              <span className="text-green-600 mr-2">✓</span>
              <span className="text-sm">{amenity}</span>
            </div>
          ))}
          {currentAmenities.length === 0 && (
            <p className="text-muted-foreground text-sm col-span-full">
              No amenities listed. Click Edit to add some.
            </p>
          )}
        </div>
      )}
    </div>
  );
};