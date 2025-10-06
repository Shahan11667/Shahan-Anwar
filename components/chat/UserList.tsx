"use client"

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Wifi, Crown } from 'lucide-react';

interface User {
  _id: string;
  username: string;
  displayName: string;
  avatar?: string;
  role: 'user' | 'admin';
  lastSeen: string;
}

interface UserListProps {
  users: User[];
}

export default function UserList({ users }: UserListProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">No users online</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {users.map((user, index) => (
        <motion.div
          key={user._id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card className="p-3 hover:bg-muted/50 transition-colors">
            <CardContent className="p-0">
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-foreground">
                      {user.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {/* Online indicator */}
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium truncate">{user.displayName}</p>
                    {user.role === 'admin' && (
                      <Crown className="h-3 w-3 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                </div>

                {/* Status Badge */}
                <Badge variant="secondary" className="text-xs">
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
