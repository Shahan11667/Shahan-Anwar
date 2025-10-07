"use client"

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, Smile, Image, Paperclip, FileText, Video, X, Loader2 } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string, fileData?: {
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    messageType: 'image' | 'video' | 'document';
  }) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSendMessage, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (disabled || uploading) return;

    // Send file if selected
    if (selectedFile) {
      await handleSendFile();
      return;
    }

    // Send text message
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      setIsTyping(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);

    // Create preview for images/videos
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSendFile = async () => {
    if (!selectedFile) return;

    setUploading(true);

    try {
      // Upload file to Cloudinary
      const formData = new FormData();
      formData.append('file', selectedFile);

      const token = localStorage.getItem('chat_token');
      const response = await fetch('/api/chat/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      if (data.success) {
        // Send message with file data
        onSendMessage(message || selectedFile.name, data.data);

        // Clear state
        setMessage('');
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Typing indicator
    if (!isTyping) {
      setIsTyping(true);
      // Emit typing start event here if needed
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      // Emit typing stop event here if needed
    }, 1000);
  };

  return (
    <div className="space-y-2">
      {/* File Preview */}
      {selectedFile && (
        <div className="bg-muted p-3 rounded-lg">
          <div className="flex items-center space-x-3">
            {previewUrl && selectedFile.type.startsWith('image/') ? (
              <img src={previewUrl} alt="Preview" className="w-20 h-20 object-cover rounded" />
            ) : previewUrl && selectedFile.type.startsWith('video/') ? (
              <video src={previewUrl} className="w-20 h-20 object-cover rounded" />
            ) : (
              <div className="w-20 h-20 bg-primary/10 rounded flex items-center justify-center">
                <FileText className="h-10 w-10 text-primary" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            {!uploading && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancelFile}
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            {uploading && (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-1 space-y-2">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={selectedFile ? "Add a caption (optional)..." : "Type your message..."}
            disabled={disabled || uploading}
            className="min-h-[40px] max-h-32 resize-none"
            rows={1}
          />

          {/* File upload buttons */}
          {!selectedFile && (
            <div className="flex items-center space-x-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                onChange={handleFileSelect}
                className="hidden"
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="text-xs"
              >
                <Image className="h-4 w-4 mr-1" />
                Image
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = 'video/*';
                    fileInputRef.current.click();
                    fileInputRef.current.accept = 'image/*,video/*,.pdf,.doc,.docx,.txt,.zip,.rar';
                  }
                }}
                disabled={disabled}
                className="text-xs"
              >
                <Video className="h-4 w-4 mr-1" />
                Video
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = '.pdf,.doc,.docx,.txt,.zip,.rar';
                    fileInputRef.current.click();
                    fileInputRef.current.accept = 'image/*,video/*,.pdf,.doc,.docx,.txt,.zip,.rar';
                  }
                }}
                disabled={disabled}
                className="text-xs"
              >
                <Paperclip className="h-4 w-4 mr-1" />
                Document
              </Button>
            </div>
          )}
        </div>

        <Button
          type="submit"
          size="sm"
          disabled={(!message.trim() && !selectedFile) || disabled || uploading}
          className="h-10 px-4"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
              <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
