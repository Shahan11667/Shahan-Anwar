import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import '@/models'; // Import all models to ensure they're registered
import ChatUser from '@/models/ChatUser';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const onlineUsers = await ChatUser.find({ isOnline: true })
      .select('-password')
      .sort({ lastSeen: -1 });

    const usersResponse = onlineUsers.map(user => ({
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
    }));

    return NextResponse.json(usersResponse);

  } catch (error) {
    console.error('Get online users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
