import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = 'https://smart-task-planner-14j7.onrender.com/api/tasks';

// Unique Device / Browser Workspace ID
let userId = localStorage.getItem('task_user_id');
if (!userId) {
  userId = 'usr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  localStorage.setItem('task_user_id', userId);
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({ userId });
      if (filter !== 'All') query.append('priority', filter);

      const response = await fetch(`${API_BASE_URL}?${query.toString()}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setTasks(data);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, priority, userId }),
      });
      if (response.ok) {
        setTitle('');
        fetchTasks();
      }
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  };

  const toggleComplete = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/complete`, {
        method: 'PATCH',
      });
      if (response.ok) {
        setTasks((prev) =>
          prev.map((t) => (t._id === id ? { ...t, completed: !t.completed } : t))
        );
      }
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const deleteTask = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setTasks((prev) => prev.filter((t) => t._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const inProgressTasks = totalTasks - completedTasks;
  const sprintCompletion = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="planner-container">
      <div className="planner-card">
        {/* Top Header Badge */}
        <div className="header-badge">
          <span className="live-dot"></span> ENTERPRISE TASK ENGINE
        </div>

        <h1 className="title">Smart Task Planner</h1>
        <p className="subtitle">High-performance project flow & target management</p>

        {/* Counter Metrics */}
        <div className="metrics-grid">
          <div className="metric-box">
            <span className="metric-value">{totalTasks}</span>
            <span className="metric-label">TOTAL ASSIGNED</span>
          </div>
          <div className="metric-box">
            <span className="metric-value" style={{ color: '#38bdf8' }}>{inProgressTasks}</span>
            <span className="metric-label">IN PROGRESS</span>
          </div>
          <div className="metric-box">
            <span className="metric-value" style={{ color: '#4ade80' }}>{completedTasks}</span>
            <span className="metric-label">COMPLETED</span>
          </div>
        </div>

        {/* Sprint Progress Bar */}
        <div className="progress-section">
          <div className="progress-header">
            <span>Sprint Completion</span>
            <span>{sprintCompletion}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${sprintCompletion}%` }}></div>
          </div>
        </div>

        {/* Add Task Input Form */}
        <form onSubmit={addTask} className="task-form">
          <input
            type="text"
            className="task-input"
            placeholder="Enter objective or deliverable..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <select
            className="priority-select"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <button type="submit" className="add-btn">+ Add</button>
        </form>

        {/* Execution Queue Header & Priority Filter */}
        <div className="queue-header">
          <span className="queue-title">Execution Queue</span>
          <select
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Task Items List */}
        <div className="task-list">
          {loading ? (
            <div className="loading-state">Syncing workspace...</div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">No deliverables found. Create one above!</div>
          ) : (
            tasks.map((task) => (
              <div key={task._id} className={`task-row ${task.completed ? 'task-done' : ''}`}>
                <div className="task-info">
                  <span className={`badge badge-${task.priority.toLowerCase()}`}>
                    {task.priority.toUpperCase()}
                  </span>
                  <span className="task-text">{task.title}</span>
                </div>
                <div className="task-actions">
                  <button
                    onClick={() => toggleComplete(task._id)}
                    className={`action-btn ${task.completed ? 'btn-completed' : 'btn-complete'}`}
                  >
                    {task.completed ? 'Completed' : '✓ Complete'}
                  </button>
                  <button
                    onClick={() => deleteTask(task._id)}
                    className="action-btn btn-delete"
                    title="Delete Task"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;