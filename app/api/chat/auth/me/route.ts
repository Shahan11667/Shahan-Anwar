import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChatUser from '@/models/ChatUser';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('chat-token')?.value;

    console.log('🔍 Auth Debug Info:');
    console.log('Token from header:', request.headers.get('authorization')?.replace('Bearer ', '')?.substring(0, 20) + '...');
    console.log('Token from cookie:', request.cookies.get('chat-token')?.value?.substring(0, 20) + '...');
    console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET?.substring(0, 10) + '...');
    console.log('Using token:', token?.substring(0, 20) + '...');

    if (!token) {
      console.log('❌ No token provided');
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify token
    console.log('🔐 Attempting to verify token...');
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
    console.log('✅ Token verified successfully, userId:', decoded.userId);
    
    // Find user
    const user = await ChatUser.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user without password
    const userResponse = {
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      avatar: user.avatar,
      isApproved: user.isApproved,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen.toISOString(),
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };

    return NextResponse.json(userResponse);

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}
