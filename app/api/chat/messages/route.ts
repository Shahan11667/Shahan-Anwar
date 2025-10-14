import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import '@/models'; // Import all models to ensure they're registered
import ChatMessage from '@/models/ChatMessage';
import ChatUser from '@/models/ChatUser';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId') || 'general';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const messages = await ChatMessage.find({ 
      roomId,
      isDeleted: false 
    })
      .populate('sender', 'username displayName avatar role')
      .populate('replyTo', 'content sender')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await ChatMessage.countDocuments({ 
      roomId,
      isDeleted: false 
    });

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
      roomId: message.roomId,
      isEdited: message.isEdited,
      editedAt: message.editedAt?.toISOString(),
      isDeleted: message.isDeleted,
      deletedAt: message.deletedAt?.toISOString(),
      replyTo: message.replyTo ? {
        _id: message.replyTo._id.toString(),
        content: message.replyTo.content,
        sender: message.replyTo.sender
      } : null,
      reactions: message.reactions.map((reaction: any) => ({
        user: reaction.user.toString(),
        emoji: reaction.emoji,
        createdAt: reaction.createdAt.toISOString()
      })),
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString()
    }));

    return NextResponse.json({
      data: messagesResponse,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    // Find user
    const user = await ChatUser.findById(decoded.userId);
    if (!user || !user.isApproved) {
      return NextResponse.json(
        { error: 'User not found or not approved' },
        { status: 404 }
      );
    }

    const { content, messageType = 'text', roomId = 'general', replyTo } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Create message
    const message = new ChatMessage({
      sender: user._id,
      content: content.trim(),
      messageType,
      roomId,
      replyTo: replyTo || null
    });

    await message.save();
    await message.populate('sender', 'username displayName avatar role');
    if (replyTo) {
      await message.populate('replyTo', 'content sender');
    }

    const messageResponse = {
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
      roomId: message.roomId,
      isEdited: message.isEdited,
      editedAt: message.editedAt?.toISOString(),
      isDeleted: message.isDeleted,
      deletedAt: message.deletedAt?.toISOString(),
      replyTo: message.replyTo ? {
        _id: message.replyTo._id.toString(),
        content: message.replyTo.content,
        sender: message.replyTo.sender
      } : null,
      reactions: message.reactions.map((reaction: any) => ({
        user: reaction.user.toString(),
        emoji: reaction.emoji,
        createdAt: reaction.createdAt.toISOString()
      })),
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString()
    };

    return NextResponse.json({
      success: true,
      data: messageResponse
    });

  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
