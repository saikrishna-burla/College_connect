const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const authenticate = require('../middleware/authMiddleware');

// 📝 Ask a question
router.post('/ask', authenticate, async (req, res) => {
  try {
    const { college, category, question } = req.body;
    const newQuestion = new Question({
      userId: req.user._id,
      userName: req.user.name,
      college,
      category,
      question
    });
    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (err) {
    res.status(500).json({ msg: 'Error posting question', error: err.message });
  }
});

// 📥 Get all questions by college & category
// routes/discussion.js



// 📥 Get discussions (now protected)
router.get('/:college/:category', authenticate, async (req, res) => {
  try {
    const { college, category } = req.params;

    let questions;
    if (req.user.role === 'admin') {
      // admin: see every question in this category, regardless of college
      questions = await Question.find({ category });
    } else {
      // normal users: only their own college
      questions = await Question.find({ college, category });
    }

    res.status(200).json(questions);
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ msg: 'Error fetching questions', error: err.message });
  }
});

module.exports = router;


// 💬 Reply to a question
router.post('/reply/:questionId', authenticate, async (req, res) => {
  try {
    const { message } = req.body;
    const question = await Question.findById(req.params.questionId);
    if (!question) return res.status(404).json({ msg: 'Question not found' });

    question.replies.push({
      userId: req.user._id,
      userName: req.user.name,
      message
    });

    await question.save();
    res.status(200).json(question);
  } catch (err) {
    res.status(500).json({ msg: 'Error replying to question', error: err.message });
  }
});

// ↩️ Nested reply (reply to a reply)
router.post('/:questionId/reply/:replyId', authenticate, async (req, res) => {
  try {
    const { message } = req.body;
    const { questionId, replyId } = req.params;

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ msg: 'Question not found' });

    const parentReply = question.replies.id(replyId);
    if (!parentReply) return res.status(404).json({ msg: 'Parent reply not found' });

    parentReply.replies.push({
      userId: req.user._id,
      userName: req.user.name,
      message
    });

    await question.save();
    res.status(200).json(question);
  } catch (err) {
    res.status(500).json({ msg: 'Error posting nested reply', error: err.message });
  }
});

// ❌ Delete a question
router.delete('/:questionId', authenticate, async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId);
    if (!question) return res.status(404).json({ msg: 'Question not found' });

    const isOwner = question.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    await question.deleteOne();
    res.status(200).json({ msg: 'Question deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Error deleting question', error: err.message });
  }
});

// ❌ Delete a reply
router.delete('/:questionId/reply/:replyId', authenticate, async (req, res) => {
  try {
    const { questionId, replyId } = req.params;

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ msg: 'Question not found' });

    // ✅ Find the reply by ID
    const reply = question.replies.id(replyId);
    if (!reply) return res.status(404).json({ msg: 'Reply not found' });

    // ✅ Check authorization
    const isOwner = reply.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ msg: 'Not authorized to delete this reply' });
    }

    // ✅ Remove the reply
    reply.deleteOne(); // or reply.remove() if using Mongoose <7

    await question.save();

    res.status(200).json({ msg: 'Reply deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting reply:', err);
    res.status(500).json({ msg: 'Error deleting reply', error: err.message });
  }
});

// ❌ Delete nested reply
// ❌ Delete nested reply
router.delete('/:questionId/reply/:replyId/nested/:nestedReplyId', authenticate, async (req, res) => {
  try {
    const { questionId, replyId, nestedReplyId } = req.params;

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ msg: 'Question not found' });

    // ✅ Get the parent reply by ID
    const parentReply = question.replies.id(replyId);
    if (!parentReply) return res.status(404).json({ msg: 'Parent reply not found' });

    // ✅ Find the nested reply
    const nestedReply = parentReply.replies.id(nestedReplyId);
    if (!nestedReply) return res.status(404).json({ msg: 'Nested reply not found' });

    const isOwner = nestedReply.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    // ✅ Use array index + splice to remove
    const index = parentReply.replies.findIndex(
      r => r._id.toString() === nestedReplyId
    );
    if (index === -1) return res.status(404).json({ msg: 'Nested reply not found (by index)' });

    parentReply.replies.splice(index, 1);

    await question.save();

    res.status(200).json({ msg: 'Nested reply deleted successfully' });
  } catch (err) {
    console.error('❌ Error in delete nested reply:', err);
    res.status(500).json({ msg: 'Error deleting nested reply', error: err.message });
  }
});

module.exports = router;