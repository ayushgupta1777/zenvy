import Chat from '../models/Chat.js';
import Message from '../models/Message.js';

/**
 * @desc    Get or create a chat for the current user
 * @route   GET /api/chat/user
 * @access  Private
 */
export const getOrCreateChat = async (req, res) => {
  try {
    const userId = req.user._id;

    let chat = await Chat.findOne({ userId }).populate('userId', 'name email avatar');

    if (!chat) {
      chat = await Chat.create({ userId });
      chat = await Chat.findById(chat._id).populate('userId', 'name email avatar');
    }

    res.json({
        success: true,
        chat
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get messages for a specific chat
 * @route   GET /api/chat/:chatId/messages
 * @access  Private
 */
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId })
      .populate('senderId', 'name avatar role')
      .sort({ createdAt: 1 }); // Oldest to newest

    res.json({
        success: true,
        messages
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all active conversations for admin
 * @route   GET /api/chat/admin/conversations
 * @access  Private/Admin
 */
export const getAdminConversations = async (req, res) => {
  try {
    const chats = await Chat.find()
      .populate('userId', 'name email avatar phone')
      .sort({ updatedAt: -1 });

    res.json({
        success: true,
        chats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
