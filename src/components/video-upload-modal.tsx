import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [webhookUrl, setWebhookUrl] = useState('');
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a video file",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !webhookUrl) {
      toast({
        title: "Missing information",
        description: "Please select a video file and enter webhook URL",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('filename', selectedFile.name);
      formData.append('size', selectedFile.size.toString());
      formData.append('type', selectedFile.type);
      formData.append('timestamp', new Date().toISOString());

      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
        mode: 'no-cors',
      });

      toast({
        title: "Upload initiated",
        description: "Video upload request sent to webhook. Check your n8n workflow for processing status.",
      });

      // Reset form
      setSelectedFile(null);
      setWebhookUrl('');
      onOpenChange(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload video. Please check the webhook URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Video</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">N8N Webhook URL</Label>
            <Input
              id="webhook-url"
              type="url"
              placeholder="https://your-n8n-instance.com/webhook/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video-upload">Select Video File</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              {selectedFile ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to select a video file
                  </p>
                </div>
              )}
              <Input
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Label
                htmlFor="video-upload"
                className="cursor-pointer absolute inset-0"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || !webhookUrl || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Video'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};