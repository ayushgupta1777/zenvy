import { Server } from 'socket.io';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Allow all origins for the mobile app
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join personal room (user) or admin room
    socket.on('join', (room) => {
      socket.join(room);
      console.log(`Socket joined room: ${room}`);
    });

    // Handle new messages
    socket.on('send_message', async (data) => {
      try {
        const { chatId, senderId, senderRole, text, messageType = 'text' } = data;
        
        let chat = await Chat.findById(chatId);
        if (!chat) return;

        // If chat is resolved, don't allow new user messages
        if (chat.status === 'resolved' && senderRole === 'user') {
          return socket.emit('error_message', { message: 'This chat session has been resolved. Please start a new one.' });
        }

        const message = await Message.create({
          chatId,
          senderId,
          senderRole,
          text,
          messageType,
          orderId: data.orderId || null,
          status: 'sent'
        });

        // Update conversation summary
        chat.lastMessage = message.text;
        chat.status = 'active'; // Re-activate if admin sends message? No, let's keep it simple for now.
        if (data.orderId) {
            chat.lastOrderId = data.orderId;
        }
        if (senderRole === 'user') {
          chat.unreadCountAdmin += 1;
        } else {
          chat.unreadCountUser += 1;
        }
        await chat.save();

        const populatedMessage = await Message.findById(message._id).populate('senderId', 'name avatar role');

        // Emit to the user's specific room
        io.to(chat.userId.toString()).emit('receive_message', populatedMessage);
        
        // Emit to the global admin room
        io.to('admin_room').emit('receive_message', populatedMessage);
        
        // Update the admin dashboard chat list dynamically
        io.to('admin_room').emit('chat_updated', {
          chatId: chat._id,
          lastMessage: text,
          updatedAt: chat.updatedAt,
          unreadCountAdmin: chat.unreadCountAdmin,
          lastOrderId: chat.lastOrderId,
          status: chat.status
        });

      } catch (err) {
        console.error('Socket send_message error:', err);
      }
    });

    // Handle resolving a chat
    socket.on('resolve_chat', async ({ chatId }) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat) return;

        chat.status = 'resolved';
        await chat.save();

        // Create a system message
        const systemMessage = await Message.create({
            chatId,
            senderId: chat.userId, // Use user ID as placeholder sender
            senderRole: 'admin',
            text: 'This support session has been marked as resolved.',
            messageType: 'system'
        });

        // Notify user and admins
        io.to(chat.userId.toString()).emit('chat_resolved', { chatId, message: systemMessage });
        io.to('admin_room').emit('chat_resolved', { chatId, message: systemMessage });
        
        // Update admin list
        io.to('admin_room').emit('chat_updated', {
            chatId: chat._id,
            status: 'resolved',
            updatedAt: chat.updatedAt
        });
      } catch (err) {
        console.error('Socket resolve_chat error:', err);
      }
    });

    // Handle reading messages
    socket.on('mark_read', async ({ chatId, role }) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat) return;

        if (role === 'admin') {
          chat.unreadCountAdmin = 0;
        } else {
          chat.unreadCountUser = 0;
        }
        await chat.save();

        await Message.updateMany(
            { chatId, senderRole: role === 'admin' ? 'user' : 'admin', status: { $ne: 'seen' } },
            { $set: { status: 'seen' } }
        );

        if (role === 'admin') {
           io.to(chat.userId.toString()).emit('messages_seen', { chatId });
        } else {
           io.to('admin_room').emit('messages_seen', { chatId });
        }
      } catch (err) {
        console.error('Socket mark_read error:', err);
      }
    });

    // HANDLE REAL-TIME USER ACTIVITY MONITORING
    socket.on('update_activity', async (data) => {
        try {
            const { userId, userName, screen, productId, productTitle } = data;
            
            // Join user-specific room for individual tracking if needed
            if (userId) socket.join(`user_${userId}`);

            const activityData = {
                socketId: socket.id,
                userId,
                userName: userName || 'Guest',
                screen,
                productId,
                productTitle,
                lastUpdate: new Date()
            };

            // Broadcast to developers
            io.to('developer_room').emit('activity_update', activityData);

            // Log activity to database if it's a new screen/product
            if (userId && screen) {
                const UserActivity = (await import('../models/UserActivity.js')).default;
                await UserActivity.create({
                    user: userId,
                    screen,
                    productId: productId || null,
                    productTitle: productTitle || null
                });
            }
        } catch (err) {
            console.error('Socket update_activity error:', err);
        }
    });

    socket.on('disconnect', () => {
      // Notify developers that a user left
      io.to('developer_room').emit('user_disconnected', { socketId: socket.id });
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
