const mongoose = require('mongoose');

const nestedReplySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const replySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
  replies: [nestedReplySchema] // 💥 IMPORTANT: enable nested replies
});

const questionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: String,
  college: String,
  category: String,
  question: String,
  createdAt: { type: Date, default: Date.now },
  replies: [replySchema]
});

module.exports = mongoose.model('Question', questionSchema);
