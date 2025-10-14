import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import '@/models'; // Import all models to ensure they're registered
import ChatUser from '@/models/ChatUser';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('chat-token')?.value;

    console.log('🔍 Logout API - Token:', token ? 'Present' : 'Missing');

    if (!token) {
      // Even without token, we can still return success for logout
      console.log('⚠️ Logout API - No token provided, but allowing logout');
      return NextResponse.json({
        success: true,
        message: 'Logged out successfully'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
      console.log('✅ Logout API - Token verified for user:', decoded.userId);
      
      // Update user offline status
      await ChatUser.findByIdAndUpdate(decoded.userId, {
        isOnline: false,
        lastSeen: new Date()
      });
      console.log('✅ Logout API - User marked as offline');
    } catch (jwtError) {
      console.log('⚠️ Logout API - Token verification failed, but allowing logout:', jwtError);
      // Even if token is invalid, we should allow logout
    }

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('❌ Logout error:', error);
    // Even on error, return success for logout
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  }
}
