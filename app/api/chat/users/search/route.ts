import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChatUser from '@/models/ChatUser';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('chat-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
    const currentUser = await ChatUser.findById(decoded.userId);
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    console.log('🔍 Search API - Query:', query);

    if (!query || query.length < 2) {
      console.log('🔍 Search API - Query too short, returning empty array');
      return NextResponse.json([]);
    }

    // First, let's see how many total users we have
    const totalUsers = await ChatUser.countDocuments();
    const approvedUsers = await ChatUser.countDocuments({ isApproved: true });
    console.log('🔍 Search API - Total users:', totalUsers);
    console.log('🔍 Search API - Approved users:', approvedUsers);

    // Search users by email or display name
    const users = await ChatUser.find({
      _id: { $ne: currentUser._id }, // Exclude current user
      isApproved: true, // Only approved users
      $or: [
        { email: { $regex: query, $options: 'i' } },
        { displayName: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } }
      ]
    })
    .select('username displayName email avatar isOnline lastSeen')
    .limit(10)
    .sort({ displayName: 1 });

    const usersResponse = users.map(user => ({
      _id: user._id.toString(),
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      avatar: user.avatar,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen.toISOString()
    }));

    console.log('🔍 Search API - Found users:', usersResponse.length);
    console.log('🔍 Search API - Users:', usersResponse);

    return NextResponse.json(usersResponse);

  } catch (error) {
    console.error('Search users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
