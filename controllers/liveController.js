const LiveStream = require('../models/LiveStream');
const LiveChatMessage = require('../models/LiveChatMessage');

// Get current live stream status. If none exists, create a default offline one.
exports.getStreamStatus = async (req, res) => {
  try {
    let stream = await LiveStream.findOne();
    if (!stream) {
      stream = new LiveStream({
        isLive: false,
        title: 'Live Darshan',
        description: 'Live streaming from Shree Manvat Baba Mahashiv Mandir',
        streamType: 'youtube',
        streamUrl: ''
      });
      await stream.save();
    }
    res.status(200).json(stream);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update live stream settings.
exports.updateStreamStatus = async (req, res) => {
  try {
    let stream = await LiveStream.findOne();
    const updateData = {
      isLive: req.body.isLive,
      title: req.body.title,
      description: req.body.description,
      streamType: req.body.streamType,
      streamUrl: req.body.streamUrl
    };

    if (req.body.isLive) {
      updateData.startedAt = new Date();
      updateData.isPaused = false;
    } else {
      updateData.startedAt = null;
      updateData.isPaused = false;
    }

    if (!stream) {
      stream = new LiveStream(updateData);
      await stream.save();
    } else {
      stream = await LiveStream.findByIdAndUpdate(stream._id, updateData, { new: true, returnDocument: 'after' });
    }

    res.status(200).json(stream);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get recent chat messages
exports.getChatHistory = async (req, res) => {
  try {
    const messages = await LiveChatMessage.find().sort({ timestamp: -1 }).limit(100);
    // Return in chronological order
    res.status(200).json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Clear chat messages (Admin operation)
exports.clearChatHistory = async (req, res) => {
  try {
    await LiveChatMessage.deleteMany({});
    res.status(200).json({ message: 'Chat history cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
