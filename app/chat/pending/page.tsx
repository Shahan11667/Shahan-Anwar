"use client"

import { useChatAuth } from '@/hooks/useChat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DynamicTitle from '@/components/dynamic-title';

export default function PendingApprovalPage() {
  const { user, logout } = useChatAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/chat/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <DynamicTitle 
        title="Account Pending Approval" 
        description="Your chat account is pending admin approval"
      />
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl">Account Pending Approval</CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Hello <strong>{user?.displayName}</strong>! Your chat account has been created successfully, 
            but it's currently pending approval from the administrator.
          </p>
          
          <p className="text-sm text-muted-foreground">
            You'll be able to join the live chat once your account has been approved. 
            This usually happens within a few minutes.
          </p>
          
          <div className="pt-4 space-y-2">
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="w-full"
            >
              Check Status
            </Button>
            
            <Button 
              onClick={handleLogout} 
              variant="ghost" 
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
