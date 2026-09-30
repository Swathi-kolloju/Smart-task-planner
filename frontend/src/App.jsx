import { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = 'http://localhost:5000/api/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const url = filter === 'All' ? API_BASE_URL : `${API_BASE_URL}?priority=${filter}`;
      const response = await fetch(url);
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

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, priority }),
      });
      if (response.ok) {
        setTitle('');
        setPriority('Medium');
        fetchTasks();
      }
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  };

  const handleCompleteTask = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/complete`, {
        method: 'PUT',
      });
      if (response.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="dashboard-wrapper">
      <div className="header-section">
        <div className="badge-glow">
          <span className="badge-dot"></span>
          Enterprise Task Engine
        </div>
        <h1 className="app-title">Smart Task Planner</h1>
        <p className="sub-title">High-performance project flow & target management</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{tasks.length}</div>
          <div className="stat-label">Total Assigned</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#38bdf8' }}>{pendingCount}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#4ade80' }}>{completedCount}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      <div className="progress-container">
        <div className="progress-header">
          <span>Sprint Completion</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      <form onSubmit={handleAddTask} className="input-form">
        <input
          type="text"
          placeholder="Enter objective or deliverable..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="task-input"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="custom-select"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <button type="submit" className="submit-btn">+ Add</button>
      </form>

      <div className="filter-row">
        <h3>Execution Queue</h3>
        <div className="filter-box">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="state-loading">Connecting securely to cluster...</div>
      ) : (
        <ul className="task-items-container">
          {tasks.length === 0 ? (
            <div className="state-empty">No active targets found in this pipeline.</div>
          ) : (
            tasks.map((task) => (
              <li key={task._id} className={`task-card ${task.completed ? 'done-card' : ''}`}>
                <div className="task-left">
                  <span className={`priority-tag ${task.priority}`}>{task.priority}</span>
                  <span className={`task-heading ${task.completed ? 'strikethrough' : ''}`}>
                    {task.title}
                  </span>
                </div>
                {!task.completed && (
                  <button
                    onClick={() => handleCompleteTask(task._id)}
                    className="action-btn"
                  >
                    ✓ Complete
                  </button>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default App;