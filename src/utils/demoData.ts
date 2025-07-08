import { AirtableRecord } from '../types/airtable';

// Demo data for when Airtable credentials are not available
export const demoRecords: AirtableRecord[] = [
  {
    id: 'rec1',
    fields: {
      title: 'Mountain Landscape',
      description: 'A breathtaking view of snow-capped mountains during golden hour. Perfect for nature photography and outdoor enthusiasts.',
      category: 'Nature',
      image: [{
        url: 'https://images.unsplash.com/photo-1464822759844-d150ad6a4cf5?w=800&h=600&fit=crop',
        filename: 'mountain-landscape.jpg'
      }],
      rating: 5,
      location: 'Swiss Alps'
    },
    createdTime: '2024-01-15T10:30:00.000Z'
  },
  {
    id: 'rec2',
    fields: {
      title: 'Modern Architecture',
      description: 'Contemporary building design featuring clean lines and glass facades. An example of minimalist urban architecture.',
      category: 'Architecture',
      image: [{
        url: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop',
        filename: 'modern-architecture.jpg'
      }],
      rating: 4,
      location: 'New York City'
    },
    createdTime: '2024-01-20T14:15:00.000Z'
  },
  {
    id: 'rec3',
    fields: {
      title: 'Ocean Sunset',
      description: 'Stunning sunset over the Pacific Ocean with vibrant orange and purple hues reflecting on the water.',
      category: 'Nature',
      image: [{
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        filename: 'ocean-sunset.jpg'
      }],
      rating: 5,
      location: 'California Coast'
    },
    createdTime: '2024-01-25T18:45:00.000Z'
  },
  {
    id: 'rec4',
    fields: {
      title: 'Coffee Shop Interior',
      description: 'Cozy coffee shop with warm lighting, wooden furniture, and a welcoming atmosphere for remote work.',
      category: 'Interior',
      rating: 4,
      location: 'Portland, Oregon'
    },
    createdTime: '2024-02-01T09:20:00.000Z'
  },
  {
    id: 'rec5',
    fields: {
      title: 'Urban Street Art',
      description: 'Vibrant mural showcasing local culture and artistic expression in the downtown district.',
      category: 'Art',
      image: [{
        url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=600&fit=crop',
        filename: 'street-art.jpg'
      }],
      rating: 4,
      location: 'Berlin, Germany'
    },
    createdTime: '2024-02-05T16:30:00.000Z'
  },
  {
    id: 'rec6',
    fields: {
      title: 'Forest Trail',
      description: 'Peaceful hiking trail through old-growth forest with dappled sunlight filtering through the canopy.',
      category: 'Nature',
      image: [{
        url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
        filename: 'forest-trail.jpg'
      }],
      rating: 5,
      location: 'Pacific Northwest'
    },
    createdTime: '2024-02-10T11:00:00.000Z'
  }
];