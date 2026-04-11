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
const TaskCard = ({ task, onDone }) => {
  const [phase, setPhase] = useState('idle');
  const [timeLeft, setTimeLeft] = useState(task.time_required);
  const [verCode, setVerCode] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [earning, setEarning] = useState(null);
  const intervalRef = useRef(null);

  const startTask = async () => {
    try { await api.post('/tasks/start/', { task_id: task.id }); } catch {}
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
  };

  const completeTask = async () => {
    try {
      const res = await api.post('/tasks/complete/', { task_id: task.id, verification_input: verCode });
      setEarning((res.data.reward * 100).toFixed(0));
      setPhase('done');
      onDone();
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 px-5 py-4">
        {/* Logo centered */}
        <div className="flex justify-center mb-3">
          <img src={tasklogo} alt="logo" className="w-16 h-16 rounded-2xl object-cover shadow-lg border-2 border-white border-opacity-50" />
        </div>
        {/* Title + Reward */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-white text-sm leading-tight">{task.title}</p>
            <p className="text-orange-100 text-xs">⏱ {Math.floor(task.time_required / 60)}m {task.time_required % 60}s</p>
          </div>
          <div className="text-right">
            <p className="text-white text-xs opacity-80">Reward</p>
            <p className="text-white font-black text-lg">Rs {(task.reward * 100).toFixed(0)}</p>
          </div>
        </div>
      </div>
      <div className="p-5">
        <p className="text-gray-600 text-sm mb-4">{task.description}</p>
        {phase === 'idle' && (
          <button onClick={startTask} className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3.5 rounded-xl font-bold text-sm hover:opacity-90 transition">
            🚀 Start Task
          </button>
        )}
        {phase === 'timer' && (
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Please wait...</p>
              <p className="text-3xl font-black text-orange-500">{mins}:{secs.toString().padStart(2, '0')}</p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-400 text-center">Complete the task in the opened tab</p>
          </div>
        )}
        {phase === 'ready' && (
          <button onClick={completeTask} className="w-full bg-green-500 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-green-600 transition">
            ✅ I'm Done — Claim Reward
          </button>
        )}
        {phase === 'verify' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 font-semibold text-center">Enter the verification code</p>
            <input value={verCode} onChange={e => setVerCode(e.target.value)} placeholder="Verification code"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 text-center font-bold tracking-widest" />
            <button onClick={completeTask} className="w-full bg-green-500 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-green-600 transition">
              ✅ Submit & Claim
            </button>
          </div>
        )}
        {phase === 'done' && (
          <div className="text-center py-2">
            <p className="text-3xl mb-1">🎉</p>
            <p className="font-black text-green-600 text-lg">+Rs {earning} Earned!</p>
            <p className="text-xs text-gray-400 mt-1">Added to your balance</p>
          </div>
        )}
        {phase === 'error' && (
          <div className="text-center py-2 space-y-2">
            <p className="text-red-500 text-sm font-semibold">{errMsg}</p>
            <button onClick={() => { setPhase('idle'); setErrMsg(''); }} className="text-xs text-gray-400 underline">Try again</button>
          </div>
        )}
      </div>
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

  useEffect(() => {
    fetchTasks();
    fetchProfile();
  }, [refresh]);

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
        </div>

        {/* Level + Earning Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-80">Your Level</p>
              <p className="text-3xl font-black">Level {userLevel}</p>
              <p className="text-sm opacity-90 mt-0.5">Earning <span className="font-black">Rs {currentEarning}</span> per task</p>
            </div>
            <button onClick={() => setShowLevelChart(!showLevelChart)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 transition px-4 py-2 rounded-xl text-sm font-bold">
              {showLevelChart ? 'Hide' : '📊 All Levels'}
            </button>
          </div>

          {/* Level progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs opacity-70 mb-1">
              <span>Level {userLevel}</span>
              <span>Level {Math.min(userLevel + 1, 9)}</span>
            </div>
            <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
              <div className="bg-white h-2 rounded-full" style={{ width: `${(userLevel / 9) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Level Chart */}
        {showLevelChart && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">❤️ Daily Task Earnings by Level</p>
            <div className="space-y-2">
              {LEVEL_EARNINGS.map(({ level, earning }) => (
                <div key={level} className={`flex items-center justify-between px-3 py-2 rounded-xl ${level === Math.min(userLevel, 9) ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-2">
                    {level === Math.min(userLevel, 9) && <span className="text-orange-500 text-xs font-black">▶</span>}
                    <span className={`text-sm font-semibold ${level === Math.min(userLevel, 9) ? 'text-orange-600' : 'text-gray-600'}`}>
                      Level {level}
                    </span>
                    {level === Math.min(userLevel, 9) && <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">YOU</span>}
                  </div>
                  <span className={`font-black text-sm ${level === Math.min(userLevel, 9) ? 'text-orange-600' : 'text-gray-700'}`}>
                    Rs {earning} / task
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

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

        {/* Promo Code */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">🎫 Promo Code</p>
          <div className="flex gap-2">
            <input value={promoCode} onChange={e => setPromoCode(e.target.value)} placeholder="Enter promo code"
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
            <button onClick={redeemPromo}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition">
              Redeem
            </button>
          </div>
          {promoMsg && (
            <p className={`text-xs mt-2 font-semibold ${promoMsg.includes('✅') ? 'text-green-600' : 'text-red-500'}`}>{promoMsg}</p>
          )}
        </div>

        {/* Available Tasks */}
        {available.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
            <p className="text-4xl mb-3">🎉</p>
            <p className="font-bold text-gray-700">All tasks completed!</p>
            <p className="text-gray-400 text-sm mt-1">Check back later for new tasks</p>
          </div>
        ) : (
          <div className="space-y-4">
            {available.map(task => (
              <TaskCard key={task.id} task={task} onDone={() => setRefresh(r => r + 1)} />
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
