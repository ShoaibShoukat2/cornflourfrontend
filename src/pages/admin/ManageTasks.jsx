import { useState, useEffect } from 'react';
import api from '../../api/axios';

const TASK_TYPES = [
  { value: 'youtube', label: '▶️ YouTube' },
  { value: 'website', label: '🌐 Website' },
  { value: 'ad', label: '📢 Ad Click' },
  { value: 'social', label: '📱 Social Media' },
  { value: 'app', label: '📲 App Install' },
  { value: 'survey', label: '📋 Survey' },
  { value: 'offer', label: '🎁 Offer' },
];

const emptyForm = {
  title: '', description: '', task_type: 'youtube',
  reward: '', time_required: 60, url: '',
  verification_code: '', is_active: true, max_completions: 0,
};

const ManageTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [linkEdits, setLinkEdits] = useState({});
  const [bulkPaste, setBulkPaste] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingLinks, setSavingLinks] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await api.get('/admin/tasks/');
      setTasks(res.data);
      const edits = {};
      res.data.forEach(t => { edits[t.id] = t.url || ''; });
      setLinkEdits(edits);
    } catch { setLoadError(true); }
    finally { setLoading(false); }
  };

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const openCreate = () => {
    setEditTask(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description,
      task_type: task.task_type,
      reward: (task.reward * 100).toFixed(0),
      time_required: task.time_required,
      url: task.url || '',
      verification_code: task.verification_code || '',
      is_active: task.is_active,
      max_completions: task.max_completions,
    });
    setShowForm(true);
  };

  const openLinkManager = () => {
    const edits = {};
    tasks.forEach(t => { edits[t.id] = t.url || ''; });
    setLinkEdits(edits);
    setBulkPaste('');
    setShowLinks(true);
  };

  const applyBulkPaste = () => {
    const lines = bulkPaste.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) return flash('Paste at least one URL');
    const ordered = [...tasks].sort((a, b) => a.id - b.id);
    const next = { ...linkEdits };
    ordered.forEach((task, i) => {
      if (lines[i]) next[task.id] = lines[i];
    });
    setLinkEdits(next);
    flash(`✅ ${Math.min(lines.length, ordered.length)} link(s) applied — click Save Links`);
  };

  const saveAllLinks = async () => {
    setSavingLinks(true);
    try {
      const updates = tasks.map(t => ({ id: t.id, url: linkEdits[t.id] || '' }));
      const res = await api.post('/admin/tasks/bulk-update-links/', { updates });
      flash(`✅ ${res.data.updated ?? updates.length} link(s) saved`);
      setShowLinks(false);
      fetchTasks();
    } catch (e) { flash(e.response?.data?.error || 'Failed to save links'); }
    finally { setSavingLinks(false); }
  };

  const saveQuickLink = async (taskId) => {
    try {
      await api.post(`/admin/tasks/edit/${taskId}/`, { url: linkEdits[taskId] || '' });
      flash('✅ Link updated');
      fetchTasks();
    } catch { flash('Failed to update link'); }
  };

  const saveTask = async () => {
    if (!form.title || !form.reward) return flash('Title and reward are required');
    setSaving(true);
    try {
      const payload = {
        ...form,
        reward: parseFloat(form.reward) / 100,
        time_required: parseInt(form.time_required),
        max_completions: parseInt(form.max_completions),
      };
      if (editTask) {
        await api.post(`/admin/tasks/edit/${editTask.id}/`, payload);
        flash('✅ Task updated');
      } else {
        await api.post('/admin/tasks/create/', payload);
        flash('✅ Task created');
      }
      setShowForm(false);
      fetchTasks();
    } catch (e) { flash(e.response?.data?.error || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const deleteTask = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.post(`/admin/tasks/delete/${id}/`);
      flash('✅ Task deleted');
      fetchTasks();
    } catch { flash('Failed to delete'); }
  };

  const toggleActive = async (task) => {
    try {
      await api.post(`/admin/tasks/edit/${task.id}/`, { is_active: !task.is_active });
      fetchTasks();
    } catch { flash('Failed to update'); }
  };

  if (loading) return null;

  if (loadError && tasks.length === 0 && !showForm) return (
    <div className="text-center py-20 space-y-3">
      <p className="text-gray-500">Tasks load nahi hue</p>
      <button onClick={fetchTasks} className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold">
        Retry
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-gray-800">🎯 Manage Tasks</h1>
        <div className="flex gap-2">
          <button onClick={openLinkManager} disabled={tasks.length === 0}
            className="bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition disabled:opacity-50">
            🔗 Manage Links
          </button>
          <button onClick={openCreate}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition">
            + Add Task
          </button>
        </div>
      </div>

      {msg && (
        <div className={`px-4 py-3 rounded-xl text-sm font-semibold border ${msg.includes('✅') ? 'bg-green-50 border-green-300 text-green-700' : 'bg-red-50 border-red-300 text-red-700'}`}>
          {msg}
        </div>
      )}

      {/* Link Manager Modal */}
      {showLinks && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-800 text-lg">🔗 Task Links</h2>
                <p className="text-xs text-gray-500 mt-0.5">Code ya command chalane ki zaroorat nahi — yahan se links set karein</p>
              </div>
              <button onClick={() => setShowLinks(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
              <label className="text-xs font-semibold text-blue-800 uppercase block">Bulk paste (ek line = ek task, order by ID)</label>
              <textarea value={bulkPaste} onChange={e => setBulkPaste(e.target.value)}
                placeholder={'https://youtube.com/shorts/abc\nhttps://youtube.com/shorts/xyz\n...'}
                rows={4}
                className="w-full px-3 py-2 border border-blue-200 rounded-xl text-sm font-mono focus:outline-none focus:border-blue-400 resize-none" />
              <button onClick={applyBulkPaste}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition">
                Apply to tasks below
              </button>
            </div>

            <div className="space-y-3">
              {[...tasks].sort((a, b) => a.id - b.id).map(task => (
                <div key={task.id} className="border border-gray-100 rounded-xl p-3">
                  <p className="text-sm font-bold text-gray-800 mb-1.5">{task.title}</p>
                  <input value={linkEdits[task.id] ?? ''}
                    onChange={e => setLinkEdits({ ...linkEdits, [task.id]: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:border-orange-400" />
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowLinks(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-200 transition">
                Cancel
              </button>
              <button onClick={saveAllLinks} disabled={savingLinks}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition disabled:opacity-60">
                {savingLinks ? 'Saving...' : 'Save All Links'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-800 text-lg">{editTask ? 'Edit Task' : 'New Task'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Watch YouTube Video"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="What user needs to do..."
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Task Type</label>
                  <select value={form.task_type} onChange={e => setForm({ ...form, task_type: e.target.value })}
                    className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400">
                    {TASK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Reward (Rs) *</label>
                  <input type="number" value={form.reward} onChange={e => setForm({ ...form, reward: e.target.value })}
                    placeholder="e.g. 10"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Time (seconds)</label>
                  <input type="number" value={form.time_required} onChange={e => setForm({ ...form, time_required: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Max Completions (0=∞)</label>
                  <input type="number" value={form.max_completions} onChange={e => setForm({ ...form, max_completions: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Task URL (YouTube / website link)</label>
                <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
                <p className="text-xs text-gray-400 mt-1">User task start karte waqt yeh link khulegi</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                  Verification Code <span className="text-gray-400 font-normal">(leave blank = no verification)</span>
                </label>
                <input value={form.verification_code} onChange={e => setForm({ ...form, verification_code: e.target.value })}
                  placeholder="e.g. INSTOVA123"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`w-12 h-6 rounded-full transition-colors ${form.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                  onClick={() => setForm({ ...form, is_active: !form.is_active })}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm font-semibold text-gray-700">{form.is_active ? 'Active (visible to users)' : 'Inactive (hidden)'}</span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-200 transition">
                Cancel
              </button>
              <button onClick={saveTask} disabled={saving}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition disabled:opacity-60">
                {saving ? 'Saving...' : editTask ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-gray-500 font-semibold">No tasks yet</p>
          <p className="text-gray-400 text-sm mt-1">Click "Add Task" to create your first task</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-800">{task.title}</span>
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-lg font-semibold">
                      Rs {(task.reward * 100).toFixed(0)}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg capitalize">
                      {task.task_type}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-lg font-semibold ${task.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {task.is_active ? '● Active' : '● Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 truncate">{task.description}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                    <span>⏱ {Math.floor(task.time_required / 60)}m {task.time_required % 60}s</span>
                    <span>✅ {task.current_completions}{task.max_completions > 0 ? `/${task.max_completions}` : ''} done</span>
                    {task.url ? (
                      <a href={task.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-[200px]">
                        🔗 {task.url}
                      </a>
                    ) : (
                      <span className="text-amber-600 font-semibold">⚠️ No link</span>
                    )}
                    {task.verification_code && <span>🔑 Has code</span>}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input
                      value={linkEdits[task.id] ?? task.url ?? ''}
                      onChange={e => setLinkEdits({ ...linkEdits, [task.id]: e.target.value })}
                      placeholder="Paste task link here..."
                      className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:border-orange-400"
                    />
                    <button onClick={() => saveQuickLink(task.id)}
                      className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-200 transition whitespace-nowrap">
                      Save Link
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleActive(task)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${task.is_active ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                    {task.is_active ? 'Disable' : 'Enable'}
                  </button>
                  <button onClick={() => openEdit(task)}
                    className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-200 transition">
                    Edit
                  </button>
                  <button onClick={() => deleteTask(task.id)}
                    className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200 transition">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageTasks;
