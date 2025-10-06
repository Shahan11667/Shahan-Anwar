import { Server as NetServer } from 'http';
import { NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import jwt from 'jsonwebtoken';
import connectDB from './mongodb';
import ChatUser from '@/models/ChatUser';
import ChatMessage from '@/models/ChatMessage';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO;
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function SocketHandler(req: any, res: NextApiResponseServerIO) {
  if (res.socket.server.io) {
    console.log('Socket is already running');
    res.end();
    return;
  }

  console.log('Socket is initializing');
  const io = new ServerIO(res.socket.server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  res.socket.server.io = io;

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any;
      await connectDB();
      
      const user = await ChatUser.findById(decoded.userId);
      if (!user || !user.isApproved) {
        return next(new Error('User not found or not approved'));
      }

      socket.data.user = {
        _id: user._id.toString(),
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        role: user.role
      };

      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`👤 User ${socket.data.user.username} connected`);

    // Update user online status
    await ChatUser.findByIdAndUpdate(socket.data.user._id, {
      isOnline: true,
      lastSeen: new Date()
    });
    console.log(`✅ User ${socket.data.user.username} marked as online`);

    // Join general room by default
    socket.join('general');

    // Send online users list
    const onlineUsers = await ChatUser.find({ isOnline: true })
      .select('username displayName avatar role lastSeen')
      .sort({ lastSeen: -1 });

    io.emit('onlineUsers', onlineUsers.map(user => ({
      _id: user._id.toString(),
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      role: user.role,
      lastSeen: user.lastSeen.toISOString()
    })));

    // Handle joining rooms
    socket.on('joinRoom', (roomId: string) => {
      socket.join(roomId);
      console.log(`👥 User ${socket.data.user.username} joined room ${roomId}`);
      console.log(`👥 Total users in room ${roomId}:`, io.sockets.adapter.rooms.get(roomId)?.size || 0);
    });

    // Handle leaving rooms
    socket.on('leaveRoom', (roomId: string) => {
      socket.leave(roomId);
      console.log(`User ${socket.data.user.username} left room ${roomId}`);
    });

    // Handle sending messages
    socket.on('sendMessage', async (messageData) => {
      try {
        console.log('📨 Received message from:', socket.data.user.username);
        console.log('📨 Message data:', messageData);
        
        const isPrivateMessage = messageData.recipientId;
        const conversationType = isPrivateMessage ? 'private' : 'group';
        
        const message = new ChatMessage({
          sender: socket.data.user._id,
          recipient: messageData.recipientId || undefined,
          content: messageData.content,
          messageType: messageData.messageType || 'text',
          roomId: messageData.roomId || 'general',
          conversationType: conversationType,
          replyTo: messageData.replyTo || null
        });

        await message.save();
        await message.populate('sender', 'username displayName avatar role');

        const messageResponse = {
          _id: message._id.toString(),
          sender: {
            _id: message.sender._id.toString(),
            username: message.sender.username,
            displayName: message.sender.displayName,
            avatar: message.sender.avatar,
            role: message.sender.role
          },
          recipient: message.recipient ? {
            _id: message.recipient.toString()
          } : undefined,
          content: message.content,
          messageType: message.messageType,
          roomId: message.roomId,
          conversationType: message.conversationType,
          isEdited: message.isEdited,
          editedAt: message.editedAt?.toISOString(),
          isDeleted: message.isDeleted,
          deletedAt: message.deletedAt?.toISOString(),
          replyTo: null,
          reactions: [],
          readBy: [],
          createdAt: message.createdAt.toISOString(),
          updatedAt: message.updatedAt.toISOString()
        };

        if (isPrivateMessage) {
          // Private message - send to specific recipient
          console.log('📤 Sending private message to user:', messageData.recipientId);
          
          // Send to sender
          socket.emit('newMessage', messageResponse);
          
          // Find recipient's socket and send to them
          const recipientSocket = Array.from(io.sockets.sockets.values())
            .find(s => s.data.user && s.data.user._id === messageData.recipientId);
          
          if (recipientSocket) {
            console.log('📤 Found recipient socket, sending message');
            recipientSocket.emit('newMessage', messageResponse);
          } else {
            console.log('⚠️ Recipient socket not found, they might be offline');
          }
        } else {
          // Group message - broadcast to room
          console.log('📤 Broadcasting group message to room:', messageData.roomId || 'general');
          io.to(messageData.roomId || 'general').emit('newMessage', messageResponse);
        }
        
        console.log('✅ Message sent successfully');
      } catch (error) {
        console.error('❌ Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('startTyping', (roomId: string) => {
      socket.to(roomId).emit('userTyping', {
        userId: socket.data.user._id,
        username: socket.data.user.username,
        roomId
      });
    });

    socket.on('stopTyping', (roomId: string) => {
      socket.to(roomId).emit('userStoppedTyping', {
        userId: socket.data.user._id,
        roomId
      });
    });

    // Handle reactions
    socket.on('addReaction', async (data) => {
      try {
        const message = await ChatMessage.findById(data.messageId);
        if (!message) return;

        // Check if user already reacted with this emoji
        const existingReaction = message.reactions.find(
          (r: any) => r.user.toString() === socket.data.user._id && r.emoji === data.emoji
        );

        if (!existingReaction) {
          message.reactions.push({
            user: socket.data.user._id,
            emoji: data.emoji,
            createdAt: new Date()
          });
          await message.save();
        }

        const messageResponse = {
          _id: message._id.toString(),
          reactions: message.reactions.map((reaction: any) => ({
            user: reaction.user.toString(),
            emoji: reaction.emoji,
            createdAt: reaction.createdAt.toISOString()
          }))
        };

        io.to(message.roomId).emit('messageReacted', messageResponse);
      } catch (error) {
        console.error('Error adding reaction:', error);
      }
    });

    socket.on('removeReaction', async (data) => {
      try {
        const message = await ChatMessage.findById(data.messageId);
        if (!message) return;

        message.reactions = message.reactions.filter(
          (r: any) => !(r.user.toString() === socket.data.user._id && r.emoji === data.emoji)
        );
        await message.save();

        const messageResponse = {
          _id: message._id.toString(),
          reactions: message.reactions.map((reaction: any) => ({
            user: reaction.user.toString(),
            emoji: reaction.emoji,
            createdAt: reaction.createdAt.toISOString()
          }))
        };

        io.to(message.roomId).emit('messageReacted', messageResponse);
      } catch (error) {
        console.error('Error removing reaction:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`👤 User ${socket.data.user.username} disconnected`);
      
      // Update user offline status
      await ChatUser.findByIdAndUpdate(socket.data.user._id, {
        isOnline: false,
        lastSeen: new Date()
      });
      console.log(`✅ User ${socket.data.user.username} marked as offline`);

      // Send updated online users list
      const onlineUsers = await ChatUser.find({ isOnline: true })
        .select('username displayName avatar role lastSeen')
        .sort({ lastSeen: -1 });

      io.emit('onlineUsers', onlineUsers.map(user => ({
        _id: user._id.toString(),
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        role: user.role,
        lastSeen: user.lastSeen.toISOString()
      })));
    });
  });

  res.end();
}
