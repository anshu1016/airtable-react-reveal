import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X, Video, CheckCircle, Loader2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from './ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface VideoUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CloudinaryResponse {
  asset_id: string;
  public_id: string;
  secure_url: string;
  resource_type: string;
  format: string;
  bytes: number;
  duration: number;
  created_at: string;
}

interface BackendResponse {
  job_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
}

type UploadState = 'idle' | 'uploading' | 'processing' | 'queued' | 'error';

const BACKEND_API_URL = 'http://127.0.0.1:5000/upload-video';

export const VideoUploadModal: React.FC<VideoUploadModalProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [jobId, setJobId] = useState<string | null>(null);
  const { toast } = useToast();

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
      // Check file type - support multiple video formats
      const supportedFormats = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
      if (!supportedFormats.includes(file.type) && !file.name.match(/\.(mp4|mov|avi|mkv)$/i)) {
        toast({
          title: "Invalid file type",
          description: "Please select a video file (MP4, MOV, AVI, or MKV)",
          variant: "destructive",
        });
        return;
      }

      // Check file size (100 MB max)
      const maxSize = 100 * 1024 * 1024; // 100 MB
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please select a video file under 100 MB",
          variant: "destructive",
        });
        return;
      }

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
        setUploadState('idle');
        setJobId(null);
      } catch (error) {
        toast({
          title: "Error reading video",
          description: "Failed to read video duration",
          variant: "destructive",
        });
      }
    }
  };

  const uploadToCloudinary = async (file: File): Promise<CloudinaryResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    // Simulate progress since edge function doesn't support XHR progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 5, 90));
    }, 500);

    try {
      const { data, error } = await supabase.functions.invoke('cloudinary-upload', {
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) {
        throw new Error(error.message || 'Cloudinary upload failed');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data as CloudinaryResponse;
    } catch (err) {
      clearInterval(progressInterval);
      throw err;
    }
  };

  const triggerBackendProcessing = async (cloudinaryData: CloudinaryResponse): Promise<BackendResponse> => {
    const payload = {
      video_url: cloudinaryData.secure_url,
      public_id: cloudinaryData.public_id,
      asset_id: cloudinaryData.asset_id,
      duration: cloudinaryData.duration,
      file_size: cloudinaryData.bytes,
      format: cloudinaryData.format,
    };

    const response = await fetch(BACKEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  };

  const handleSend = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a video file",
        variant: "destructive",
      });
      return;
    }

    setUploadState('uploading');
    setUploadProgress(0);

    try {
      // Step 1: Upload to Cloudinary
      toast({
        title: "📤 Uploading to cloud...",
        description: "Your video is being uploaded",
      });

      const cloudinaryResponse = await uploadToCloudinary(selectedFile);
      
      console.log('Cloudinary upload successful:', cloudinaryResponse);

      // Step 2: Send metadata to backend
      setUploadState('processing');
      
      toast({
        title: "⚙️ Triggering processing...",
        description: "Sending video metadata to backend",
      });

      const backendResponse = await triggerBackendProcessing(cloudinaryResponse);
      
      console.log('Backend response:', backendResponse);

      // Step 3: Show queued status
      setUploadState('queued');
      setJobId(backendResponse.job_id);

      toast({
        title: "✅ Processing started!",
        description: `Job ID: ${backendResponse.job_id}. You can safely close this modal.`,
      });

    } catch (error) {
      console.error('Upload error:', error);
      setUploadState('error');
      
      let errorMessage = "Failed to process video. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "❌ Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadState('idle');
    setUploadProgress(0);
    setJobId(null);
  };

  const handleCancel = () => {
    handleRemoveFile();
    onOpenChange(false);
  };

  const getStatusDisplay = () => {
    switch (uploadState) {
      case 'uploading':
        return (
          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="font-medium text-blue-900 dark:text-blue-100">Uploading to Cloudinary...</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{uploadProgress}% complete</p>
          </div>
        );
      case 'processing':
        return (
          <div className="bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
              <span className="font-medium text-yellow-900 dark:text-yellow-100">Sending to backend...</span>
            </div>
          </div>
        );
      case 'queued':
        return (
          <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-900 dark:text-green-100">Processing queued!</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
              <Clock className="h-3 w-3" />
              <span>Job ID: {jobId}</span>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              You can safely close this modal. Processing will continue in the background.
            </p>
          </div>
        );
      case 'error':
        return (
          <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2">
              <X className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-900 dark:text-red-100">Upload failed</span>
            </div>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              Please try again or check the console for details.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const isUploading = uploadState === 'uploading' || uploadState === 'processing';

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
              <li>• Supported formats: MP4, MOV, AVI, MKV</li>
              <li>• Maximum file size: 100 MB</li>
              <li>• Maximum duration: 2 minutes</li>
              <li>• No background music or additional audio tracks</li>
            </ul>
          </div>

          {/* Status Display */}
          {getStatusDisplay()}

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
                    {!isUploading && uploadState !== 'queued' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
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
                accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,.mp4,.mov,.avi,.mkv"
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
              {uploadState === 'queued' ? 'Close' : 'Cancel'}
            </Button>
            {uploadState !== 'queued' && (
              <Button 
                onClick={handleSend} 
                disabled={!selectedFile || isUploading}
                className="min-w-[120px]"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {uploadState === 'uploading' ? 'Uploading...' : 'Processing...'}
                  </>
                ) : (
                  'Upload & Process'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
