import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  TextField,
  Typography,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import { Send, Trash2 } from 'lucide-react';

const DiscussionFeed = ({ user, category, token }) => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');

  const fetchQuestions = async () => {
    try{ const res = await axios.get(
       `http://localhost:5000/api/discussions/${user.college}/${category}`,
       { headers: { Authorization: `Bearer ${token}` } }
     );
      setQuestions(res.data);
    } 
    catch (err) {
      console.error(err);
      setQuestions([]);
    }
  };

  useEffect(() => {
    if (user && category) {
      fetchQuestions();
    }
  }, [user, category]);

  const postQuestion = async () => {
    if (!newQuestion.trim()) return;
    await axios.post(
      'http://localhost:5000/api/discussions/ask',
      {
        college: user.college,
        category,
        question: newQuestion,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setNewQuestion('');
    fetchQuestions();
  };

  const replyToQuestion = async (id, message) => {
    if (!message.trim()) return;
    await axios.post(
      `http://localhost:5000/api/discussions/reply/${id}`,
      { message },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchQuestions();
  };

  const replyToReply = async (questionId, replyId, message) => {
    if (!message.trim()) return;
    await axios.post(
      `http://localhost:5000/api/discussions/${questionId}/reply/${replyId}`,
      { message },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchQuestions();
  };

  const deleteQuestion = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/discussions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchQuestions();
    } catch (err) {
      console.error('Error deleting question:', err);
    }
  };

  const deleteReply = async (questionId, replyId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/discussions/${questionId}/reply/${replyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchQuestions();
    } catch (err) {
      console.error('Error deleting reply:', err);
    }
  };

  const deleteNestedReply = async (questionId, replyId, nestedReplyId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/discussions/${questionId}/reply/${replyId}/nested/${nestedReplyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchQuestions();
    } catch (err) {
      console.error('Error deleting nested reply:', err);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {category} Discussions
      </Typography>

      

      {questions.length === 0 ? (
        <Typography>No discussions yet.</Typography>
      ) : (
        questions.map((q) => (
          <Card key={q._id} sx={{ mb: 2, borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">
                  {q.userName}: {q.question}
                </Typography>
                {(user?._id === q?.userId || user.role === 'admin') && (
                  <IconButton onClick={() => deleteQuestion(q._id)} color="error">
                    <Trash2 size={18} />
                  </IconButton>
                )}
              </Box>

              <Box sx={{ mt: 2, ml: 2 }}>
                {q.replies.map((r) => (
                  <Box key={r._id} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">
                        <b>{r.userName}</b>: {r.message}
                      </Typography>
                      {(user._id === r.userId || user.role === 'admin') && (
                        <IconButton onClick={() => deleteReply(q._id, r._id)} color="error">
                          <Trash2 size={16} />
                        </IconButton>
                      )}
                    </Box>

                    {r.replies?.map((nested) => (
                      <Box
                        key={nested._id}
                        sx={{
                          ml: 3,
                          mt: 1,
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography variant="body2" sx={{ color: '#5d4037' }}>
                          ↳ <b>{nested.userName}</b>: {nested.message}
                        </Typography>
                        {(user._id === nested.userId || user.role === 'admin') && (
                          <IconButton
                            onClick={() => deleteNestedReply(q._id, r._id, nested._id)}
                            color="error"
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        )}
                      </Box>
                    ))}

                    {user && (
                      <Box sx={{ ml: 3 }}>
                        <ReplyBox
                          placeholder="Reply to this reply..."
                          onSend={(msg) => replyToReply(q._id, r._id, msg)}
                        />
                      </Box>
                    )}
                  </Box>
                ))}

                {user && (
                  <ReplyBox
                    placeholder="Reply to this question..."
                    onSend={(msg) => replyToQuestion(q._id, msg)}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        ))
      )}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Ask a question..."
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '30px',
              backgroundColor: '#f1f1f1',
              paddingLeft: 2,
              '& fieldset': { border: 'none' },
            },
            '& input': { padding: '10px 0' },
          }}
        />
        <IconButton
          onClick={postQuestion}
          sx={{ bgcolor: '#1976d2', color: 'white', '&:hover': { bgcolor: '#1565c0' } }}
        >
          <Send size={20} />
        </IconButton>
      </Box>
    </Box>
  );
};

const ReplyBox = ({ onSend, placeholder }) => {
  const [msg, setMsg] = useState('');
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        mt: 1,
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: '999px',
        padding: '6px 10px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
      }}
    >
      <TextField
        fullWidth
        size="small"
        placeholder={placeholder}
        value={msg}
        variant="standard"
        InputProps={{ disableUnderline: true }}
        onChange={(e) => setMsg(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend(msg);
            setMsg('');
          }
        }}
        sx={{ ml: 1 }}
      />
      <IconButton
        onClick={() => {
          onSend(msg);
          setMsg('');
        }}
        sx={{ color: '#1976d2' }}
      >
        <Send size={18} />
      </IconButton>
    </Box>
  );
};

export default DiscussionFeed;
