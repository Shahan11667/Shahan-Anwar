import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import '@/models'; // Import all models to ensure they're registered
import ChatUser from '@/models/ChatUser';
import ChatMessage from '@/models/ChatMessage';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.cookies.get('chat-token')?.value;

    console.log('🔍 Conversations API - Token:', token ? 'Present' : 'Missing');

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
    console.log('🔍 Conversations API - User ID:', decoded.userId);
    
    const currentUser = await ChatUser.findById(decoded.userId);
    
    if (!currentUser) {
      console.log('❌ Conversations API - User not found');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('✅ Conversations API - User found:', currentUser.username);

    // Get all private conversations for this user
    const conversations = await ChatMessage.aggregate([
      {
        $match: {
          $or: [
            { sender: currentUser._id, conversationType: 'private' },
            { recipient: currentUser._id, conversationType: 'private' }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', currentUser._id] },
              '$recipient',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' }
        }
      },
      {
        $lookup: {
          from: 'chatusers',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: '$user._id',
          username: '$user.username',
          displayName: '$user.displayName',
          email: '$user.email',
          avatar: '$user.avatar',
          isOnline: '$user.isOnline',
          lastMessage: {
            _id: '$lastMessage._id',
            content: '$lastMessage.content',
            messageType: '$lastMessage.messageType',
            createdAt: '$lastMessage.createdAt'
          }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    console.log('📊 Conversations API - Found conversations:', conversations.length);
    console.log('📊 Conversations API - Conversations:', conversations);
    return NextResponse.json(conversations);

  } catch (error) {
    console.error('❌ Get conversations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
