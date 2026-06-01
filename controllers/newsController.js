const News = require('../models/News');

exports.getAllNews = async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 }).populate('author', 'name');
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createNews = async (req, res) => {
  try {
    const newsItem = new News(req.body);
    await newsItem.save();
    res.status(201).json(newsItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateNews = async (req, res) => {
  try {
    const newsItem = await News.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(newsItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteNews = async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'News deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
