import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Upload, X, Video, Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CryptoJS from 'crypto-js';

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
  const [cloudinaryUrl, setCloudinaryUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'upload' | 'submit'>('upload');
  const { toast } = useToast();

  // Cloudinary config
  const CLOUDINARY_CONFIG = {
    cloudName: 'df9d8klxs',
    apiKey: '282589174689254',
    apiSecret: 'qJd8KNvp8PvQmFVvCIVs9ewcR3c'
  };

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
          
          if (duration > 80) { // 1 min 20 sec = 80 seconds
            toast({
              title: "Video too long",
              description: "Please select a video that is less than 1 minute 20 seconds",
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

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Create signature for signed upload using SHA1
    const createSignature = (params: Record<string, any>, secret: string) => {
      const sortedParams = Object.keys(params)
        .sort()
        .map(key => `${key}=${params[key]}`)
        .join('&');
      
      return CryptoJS.SHA1(sortedParams + secret).toString();
    };

    const params = {
      resource_type: 'video',
      timestamp: timestamp
    };

    const signature = createSignature(params, CLOUDINARY_CONFIG.apiSecret);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', CLOUDINARY_CONFIG.apiKey);
    formData.append('signature', signature);
    formData.append('resource_type', 'video');

    console.log('Uploading to Cloudinary with params:', {
      timestamp,
      api_key: CLOUDINARY_CONFIG.apiKey,
      signature,
      resource_type: 'video',
      stringToSign: `resource_type=video&timestamp=${timestamp}`
    });

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/video/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary error:', errorData);
      throw new Error(`Cloudinary upload failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Cloudinary success:', data);
    return data.secure_url;
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select an MP4 video file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const cloudinaryVideoUrl = await uploadToCloudinary(selectedFile);
      setCloudinaryUrl(cloudinaryVideoUrl);
      setStep('submit');
      
      toast({
        title: "Upload successful",
        description: "Video uploaded to Cloudinary successfully!",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload video to Cloudinary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleGetData = async () => {
    if (!cloudinaryUrl) {
      toast({
        title: "No video URL",
        description: "Please upload a video first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('https://video-audio-mvp-1.onrender.com/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl: cloudinaryUrl
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process video');
      }

      toast({
        title: "Processing initiated",
        description: "Video sent for processing successfully!",
      });

      // Reset and close modal
      handleCancel();
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Processing failed",
        description: "Failed to send video for processing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setCloudinaryUrl('');
    setStep('upload');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {step === 'upload' ? 'Upload Video Content' : 'Video Processing'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {step === 'upload' ? (
            <>
              {/* Instructions */}
              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Upload Guidelines</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Upload MP4 video files (max 1 minute 20 seconds)</li>
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
                  onClick={handleUpload} 
                  disabled={!selectedFile || isUploading}
                  className="min-w-[120px]"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading to Cloudinary...
                    </>
                  ) : (
                    'Upload Video'
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Video URL Display and Get Data */}
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Upload Successful!</h4>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Your video has been uploaded to Cloudinary. Now you can send it for processing.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Cloudinary Video URL</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={cloudinaryUrl}
                      readOnly
                      className="bg-muted"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(cloudinaryUrl)}
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={handleCancel}>
                  Close
                </Button>
                <Button 
                  onClick={handleGetData} 
                  disabled={isProcessing}
                  className="min-w-[120px]"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    'Get Data'
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};