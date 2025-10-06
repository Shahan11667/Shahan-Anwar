"use client"

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Smile, 
  MoreVertical, 
  Reply, 
  Edit, 
  Trash2,
  Check,
  CheckCheck,
  MessageCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ChatMessage } from '@/services/chat.service';

interface MessageListProps {
  messages: ChatMessage[];
  onReaction: (messageId: string, emoji: string) => void;
}

const emojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '👏'];

export default function MessageList({ messages, onReaction }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {messages.map((message, index) => (
          <motion.div
            key={message._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex space-x-3"
          >
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">
                  {message.sender.displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Message Content */}
            <div className="flex-1 min-w-0">
              {/* Message Header */}
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium">{message.sender.displayName}</span>
                {message.sender.role === 'admin' && (
                  <Badge variant="secondary" className="text-xs">Admin</Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                </span>
                {message.isEdited && (
                  <span className="text-xs text-muted-foreground">(edited)</span>
                )}
              </div>

              {/* Reply To */}
              {message.replyTo && typeof message.replyTo === 'object' && 'sender' in message.replyTo && (
                <div className="mb-2 p-2 bg-muted rounded-md border-l-2 border-primary">
                  <p className="text-xs text-muted-foreground">
                    Replying to {(message.replyTo as any).sender?.displayName || 'Unknown'}
                  </p>
                  <p className="text-sm truncate">{(message.replyTo as any).content}</p>
                </div>
              )}

              {/* Message Body */}
              <Card className="inline-block max-w-xs lg:max-w-md">
                <CardContent className="p-3">
                  {message.isDeleted ? (
                    <p className="text-muted-foreground italic">This message was deleted</p>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                </CardContent>
              </Card>

              {/* Reactions */}
              {message.reactions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {Object.entries(
                    message.reactions.reduce((acc, reaction) => {
                      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([emoji, count]) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => onReaction(message._id, emoji)}
                    >
                      {emoji} {count}
                    </Button>
                  ))}
                </div>
              )}

              {/* Message Actions */}
              {!message.isDeleted && (
                <div className="mt-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => {
                      // Handle reply
                    }}
                  >
                    <Reply className="h-3 w-3" />
                  </Button>
                  
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => {
                        // Handle emoji picker
                      }}
                    >
                      <Smile className="h-3 w-3" />
                    </Button>
                    
                    {/* Emoji Picker */}
                    <div className="absolute bottom-full left-0 mb-2 p-2 bg-popover border rounded-md shadow-lg z-10">
                      <div className="flex space-x-1">
                        {emojis.map((emoji) => (
                          <Button
                            key={emoji}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => onReaction(message._id, emoji)}
                          >
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => {
                      // Handle more options
                    }}
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
}
