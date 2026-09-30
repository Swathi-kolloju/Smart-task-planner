const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskplanner';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Task Schema
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  priority: { type: String, default: 'Medium', enum: ['High', 'Medium', 'Low'] },
  completed: { type: Boolean, default: false },
  userId: { type: String, required: true, default: 'global' },
  createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', taskSchema);

// Routes
// 1. Get tasks (filtered by user & optional priority)
app.get('/api/tasks', async (req, res) => {
  try {
    const { userId, priority } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (priority && priority !== 'All') filter.priority = priority;

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// 2. Add new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, priority, userId } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const newTask = new Task({
      title: title.trim(),
      priority: priority || 'Medium',
      userId: userId || 'anonymous'
    });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// 3. Toggle task completion
app.patch('/api/tasks/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    task.completed = !task.completed;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// 4. Delete task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

app.get('/', (req, res) => {
  res.send('Smart Task Planner API running smoothly!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});