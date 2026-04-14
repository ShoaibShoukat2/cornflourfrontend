import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import tasklogo from '../assets/tasklogo.jpeg';

const ICONS = {
  youtube: '▶️', website: '🌐', ad: '📢',
  social: '📱', app: '📲', survey: '📋', offer: '🎁',
};

const LEVEL_EARNINGS = [
  { level: 0, earning: 7 },
  { level: 1, earning: 15 },
  { level: 2, earning: 22 },
  { level: 3, earning: 26 },
  { level: 4, earning: 32 },
  { level: 5, earning: 38 },
  { level: 6, earning: 45 },
  { level: 7, earning: 55 },
  { level: 8, earning: 62 },
  { level: 9, earning: 70 },
];

// ── Single Task Card ───────────────────────────────────────────────────────────
const TaskCard = ({ task, index, onDone, currentEarning }) => {
  const [phase, setPhase] = useState('idle');
  const [timeLeft, setTimeLeft] = useState(task.time_required);
  const [verCode, setVerCode] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [earning, setEarning] = useState(null);
  const intervalRef = useRef(null);

  const startTask = async () => {
    // Immediately start timer and open URL — don't wait for API
    if (task.url) window.open(task.url, '_blank');
    setPhase('timer');
    setTimeLeft(task.time_required);
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setPhase(task.verification_code ? 'verify' : 'ready');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    // Fire API in background — don't block UI
    api.post('/tasks/start/', { task_id: task.id }).catch(() => {});
  };

  const completeTask = async () => {
    try {
      const res = await api.post('/tasks/complete/', { task_id: task.id, verification_input: verCode });
      setEarning((res.data.reward * 100).toFixed(0));
      setPhase('done');
      onDone(res.data.new_balance);
    } catch (e) {
      setErrMsg(e.response?.data?.error || 'Failed');
      setPhase('error');
    }
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = ((task.time_required - timeLeft) / task.time_required) * 100;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Just the logo — tap to start */}
      <div className="relative" onClick={phase === 'idle' ? startTask : undefined}
        style={{ cursor: phase === 'idle' ? 'pointer' : 'default' }}>
        <img
          src={tasklogo}
          alt={`Task ${index + 1}`}
          className={`w-56 h-56 rounded-3xl object-cover shadow-xl ${phase === 'idle' ? 'active:scale-95 transition-transform' : ''}`}
        />
        {/* Timer overlay */}
        {phase === 'timer' && (
          <div className="absolute inset-0 bg-black bg-opacity-60 rounded-3xl flex flex-col items-center justify-center">
            <span className="text-white text-4xl font-black">{mins > 0 ? `${mins}:${secs.toString().padStart(2,'0')}` : secs}</span>
            <span className="text-orange-300 text-xs mt-1 font-semibold">Wait...</span>
            <div className="w-32 h-1.5 bg-gray-600 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-orange-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
        {/* Done overlay */}
        {phase === 'done' && (
          <div className="absolute inset-0 bg-green-500 bg-opacity-80 rounded-3xl flex items-center justify-center">
            <span className="text-white text-3xl">✅</span>
          </div>
        )}
        {/* Idle tap hint */}
        {phase === 'idle' && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center">
            <span className="bg-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
              👆 Tap to Start
            </span>
          </div>
        )}
      </div>

      {/* Timer / Claim — only shows when active */}
      {phase === 'ready' && (
        <button onClick={completeTask}
          className="bg-green-500 text-white px-5 py-2 rounded-2xl font-bold text-sm shadow hover:bg-green-600 transition">
          ✅ Claim Rs {currentEarning}
        </button>
      )}
      {phase === 'verify' && (
        <div className="flex flex-col items-center gap-2 w-40">
          <input value={verCode} onChange={e => setVerCode(e.target.value)}
            placeholder="Verify code"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:border-orange-400" />
          <button onClick={completeTask}
            className="w-full bg-green-500 text-white py-2 rounded-xl font-bold text-sm">
            ✅ Submit
          </button>
        </div>
      )}
      {phase === 'done' && (
        <p className="font-black text-green-600 text-sm">+Rs {earning} Earned!</p>
      )}
      {phase === 'error' && (
        <div className="text-center">
          <p className="text-red-500 text-xs">{errMsg}</p>
          <button onClick={() => { setPhase('idle'); setErrMsg(''); }} className="text-xs text-gray-400 underline">Retry</button>
        </div>
      )}
    </div>
  );
};

// ── Main Tasks Page ────────────────────────────────────────────────────────────
const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoMsg, setPromoMsg] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [userLevel, setUserLevel] = useState(0);
  const [showLevelChart, setShowLevelChart] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);
  const [walletBalance, setWalletBalance] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchProfile();
    fetchWallet();
  }, [refresh]);

  const fetchWallet = async () => {
    try {
      const res = await api.get('/wallet/');
      setWalletBalance(res.data.main_balance);
    } catch {}
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks/');
      if (res.data.tasks) {
        // New format with limits
        setTasks(res.data.tasks);
        setDailyLimit(res.data.daily_limit || 0);
        setCompletedToday(res.data.completed_today || 0);
      } else {
        // Old format fallback
        setTasks(res.data);
      }
    } catch (e) {
      if (e.response?.data?.error === 'package_required') setLocked(true);
    } finally { setLoading(false); }
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile/');
      setUserLevel(res.data.level ?? 0);
    } catch {}
  };

  const redeemPromo = async () => {
    if (!promoCode.trim()) return;
    try {
      const res = await api.post('/tasks/promo-code/', { code: promoCode });
      setPromoMsg(`✅ Rs ${(res.data.amount * 100).toFixed(0)} added!`);
      setPromoCode('');
    } catch (e) {
      setPromoMsg(e.response?.data?.error || 'Invalid code');
    }
    setTimeout(() => setPromoMsg(''), 3000);
  };

  const available = tasks.filter(t => !t.is_completed);
  const completed = tasks.filter(t => t.is_completed);
  const currentEarning = LEVEL_EARNINGS.find(l => l.level === Math.min(userLevel, 9))?.earning || 7;

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (locked) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm w-full">
        <p className="text-5xl mb-4">🔒</p>
        <h2 className="text-xl font-black text-gray-800 mb-2">Tasks Locked</h2>
        <p className="text-gray-500 text-sm">Buy a package to unlock all tasks and start earning.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Header */}
        <div className="text-center">
          <img src={tasklogo} alt="Tasks" className="w-16 h-16 rounded-2xl mx-auto mb-3 object-cover shadow-md" />
          <h1 className="text-2xl font-black text-gray-800">🎯 Tasks</h1>
          <p className="text-gray-500 text-sm mt-1">Complete tasks and earn money instantly</p>
          {walletBalance !== null && (
            <div className="mt-3 inline-block bg-green-50 border border-green-200 rounded-2xl px-5 py-2">
              <p className="text-green-700 font-black text-lg">Rs {(walletBalance * 100).toFixed(0)}</p>
              <p className="text-green-500 text-xs">Current Balance</p>
            </div>
          )}
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
            <p className="text-xl font-black text-orange-500">{available.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Available</p>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
            <p className="text-xl font-black text-green-500">{completedToday}</p>
            <p className="text-xs text-gray-400 mt-0.5">Done Today</p>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
            <p className="text-xl font-black text-blue-500">{dailyLimit}</p>
            <p className="text-xs text-gray-400 mt-0.5">Daily Limit</p>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
            <p className="text-xl font-black text-purple-500">Rs {(completedToday * currentEarning).toFixed(0)}</p>
            <p className="text-xs text-gray-400 mt-0.5">Earned</p>
          </div>
        </div>

        {/* Available Tasks */}
        {available.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
            <p className="text-4xl mb-3">🎉</p>
            <p className="font-bold text-gray-700">All tasks completed!</p>
            <p className="text-gray-400 text-sm mt-1">Check back later for new tasks</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-6">
            {available.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                currentEarning={currentEarning}
                onDone={(newBalance) => {
                  if (newBalance !== undefined) setWalletBalance(newBalance);
                  setRefresh(r => r + 1);
                }}
              />
            ))}
          </div>
        )}

        {/* Completed Tasks */}
        {completed.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">✅ Completed</p>
            <div className="space-y-2">
              {completed.map(task => (
                <div key={task.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span>{ICONS[task.task_type] || '🎯'}</span>
                    <p className="text-sm text-gray-600">{task.title}</p>
                  </div>
                  <span className="text-xs font-bold text-green-600">+Rs {currentEarning}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Tasks;
