import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChatUser from '@/models/ChatUser';
import ChatMessage from '@/models/ChatMessage';
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
    const otherUserId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!otherUserId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify the other user exists
    const otherUser = await ChatUser.findById(otherUserId);
    if (!otherUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const skip = (page - 1) * limit;

    // Get messages between current user and other user
    const messages = await ChatMessage.find({
      $or: [
        {
          sender: currentUser._id,
          recipient: otherUserId,
          conversationType: 'private'
        },
        {
          sender: otherUserId,
          recipient: currentUser._id,
          conversationType: 'private'
        }
      ]
    })
    .populate('sender', 'username displayName avatar role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    // Mark messages as read
    await ChatMessage.updateMany(
      {
        sender: otherUserId,
        recipient: currentUser._id,
        conversationType: 'private',
        readBy: { $ne: currentUser._id }
      },
      {
        $addToSet: { readBy: currentUser._id }
      }
    );

    const messagesResponse = messages.map(message => ({
      _id: message._id.toString(),
      sender: {
        _id: message.sender._id.toString(),
        username: message.sender.username,
        displayName: message.sender.displayName,
        avatar: message.sender.avatar,
        role: message.sender.role
      },
      content: message.content,
      messageType: message.messageType,
      conversationType: message.conversationType,
      isEdited: message.isEdited,
      editedAt: message.editedAt?.toISOString(),
      isDeleted: message.isDeleted,
      deletedAt: message.deletedAt?.toISOString(),
      replyTo: message.replyTo,
      reactions: message.reactions.map((reaction: any) => ({
        user: reaction.user.toString(),
        emoji: reaction.emoji,
        createdAt: reaction.createdAt.toISOString()
      })),
      readBy: message.readBy ? message.readBy.map((userId: any) => userId.toString()) : [],
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString()
    }));

    return NextResponse.json({
      messages: messagesResponse.reverse(), // Reverse to show oldest first
      hasMore: messages.length === limit,
      page,
      limit
    });

  } catch (error) {
    console.error('Get private messages error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
