import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface VideoUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VideoUploadModal: React.FC<VideoUploadModalProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const checkVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      
      video.onerror = () => {
        reject(new Error('Failed to load video'));
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'video/mp4') {
        try {
          const duration = await checkVideoDuration(file);
          
          if (duration > 120) { // 2 minutes = 120 seconds
            toast({
              title: "Video too long",
              description: "Please select a video that is less than 2 minutes",
              variant: "destructive",
            });
            return;
          }
          
          setSelectedFile(file);
        } catch (error) {
          toast({
            title: "Error reading video",
            description: "Failed to read video duration",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an MP4 video file",
          variant: "destructive",
        });
      }
    }
  };

  const handleSend = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select an MP4 video file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    // Show uploading status
    toast({
      title: "📤 Uploading video...",
      description: "Your video is being uploaded",
      className: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100",
    });

    try {
      const formData = new FormData();
      formData.append('video', selectedFile);

      const response = await fetch('http://127.0.0.1:5001/upload-video', {
        method: 'POST',
        body: formData,
      });

      // Check if response is ok (status 200-299)
      if (!response.ok) {
        let errorMessage = `Upload failed with status ${response.status}`;
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage += `: ${errorText}`;
          }
        } catch (e) {
          // If we can't read the error text, use the default message
        }
        throw new Error(errorMessage);
      }

      // Show processing status
      toast({
        title: "⚙️ Processing video...",
        description: "Please wait while we process your video",
        className: "border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100",
      });

      // Try to parse response data (optional)
      let responseData = null;
      try {
        responseData = await response.json();
        console.log('Upload successful:', responseData);
      } catch (e) {
        // If response is not JSON, that's okay - the upload was still successful
        console.log('Upload successful - non-JSON response');
      }

      // Show success message and navigate to home
      toast({
        title: "✅ Video processed successfully!",
        description: "Your video has been processed. Redirecting to home...",
        className: "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100",
      });

      // Close modal and navigate to home
      setTimeout(() => {
        handleCancel();
        navigate('/');
        
        // Show final success toast on home page
        setTimeout(() => {
          toast({
            title: "🎉 Video Upload Complete",
            description: "Your video has been successfully processed and is ready to view!",
            className: "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100",
          });
        }, 500);
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      
      let errorMessage = "Failed to upload video. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "❌ Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleCancel = () => {
    setSelectedFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Upload Video Content
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Upload Guidelines</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Upload MP4 video files (max 2 minutes)</li>
              <li>• No background music or additional audio tracks</li>
              <li>• Only MP4 format supported</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label>Video File</Label>
            <div className="space-y-3">
              {selectedFile ? (
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Video className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Choose a video file</p>
                    <p className="text-xs text-muted-foreground">
                      Drag & drop or click to browse
                    </p>
                  </div>
                </div>
              )}
              
              <Input
                id="video-upload"
                type="file"
                accept="video/mp4,.mp4"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {!selectedFile && (
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('video-upload')?.click()}
                  className="w-full"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Select Video File
                </Button>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleSend} 
              disabled={!selectedFile || isUploading}
              className="min-w-[120px]"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                'Send'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};