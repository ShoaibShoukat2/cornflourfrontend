import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api, { readCache } from '../api/axios';
import { NavIcon } from '../components/NavIcons';
import taskLogo from '../assets/tasklogo.jpeg';

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
      const errText = e.response?.data?.error || e.response?.data?.message || 'Failed to complete task';
      setErrMsg(errText);
      setPhase('error');
    }
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = ((task.time_required - timeLeft) / task.time_required) * 100;

  const stage = (
    <div className={`lux-stage${index === 0 ? ' lux-stage-hero' : ''}`} onClick={phase === 'idle' ? startTask : undefined}>
      <span className="lux-orbit lux-orbit-a" />
      <span className="lux-orbit lux-orbit-b" />
      <span className="lux-spark lux-spark-a" />
      <span className="lux-spark lux-spark-b" />
      <span className="lux-float lux-float-heart" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-9a4 4 0 017-2 4 4 0 017 2c0 4.6-7 9-7 9z" /></svg>
      </span>
      <span className="lux-float lux-float-plane" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M3 11.5L21 4l-7.2 16-2.3-6.2L3 11.5z" /></svg>
      </span>
      <img src={taskLogo} alt="" className="lux-task-logo" />
      {phase === 'timer' && (
        <div className="lux-stage-overlay">
          <span className="lux-timer">{mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : secs}</span>
          <span className="lux-stage-note">Please wait</span>
          <span className="lux-progress"><span style={{ width: `${progress}%` }} /></span>
        </div>
      )}
      {phase === 'done' && <div className="lux-stage-overlay"><span className="lux-stage-note">Completed</span></div>}
      {phase === 'idle' && (
        <span className="lux-tap">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 11V6.5a1.5 1.5 0 013 0V11M11 10.5V5.5a1.5 1.5 0 013 0V11M14 10.8V7.5a1.5 1.5 0 013 0V13c0 4-2 7-6 7h-1c-2.5 0-4-1.2-5-3L3 13.5a1.4 1.4 0 012.2-1.6L8 14" /></svg>
          Tap to Start
        </span>
      )}
    </div>
  );

  return (
    <article className="lux-task">
      {stage}
      {phase === 'ready' && (
        <button type="button" onClick={completeTask} className="lux-claim">Claim Rs {currentEarning}</button>
      )}
      {phase === 'verify' && (
        <div className="lux-verify">
          <input value={verCode} onChange={(event) => setVerCode(event.target.value)} placeholder="Verification code" className="lux-input" />
          <button type="button" onClick={completeTask} className="lux-claim">Submit</button>
        </div>
      )}
      {phase === 'done' && <p className="lux-earned">+Rs {earning} earned</p>}
      {phase === 'error' && (
        <div className="text-center">
          <p className="text-red-300 text-xs">{errMsg}</p>
          <button type="button" onClick={() => { setPhase('idle'); setErrMsg(''); }} className="text-xs text-amber-200 underline">Retry</button>
        </div>
      )}
    </article>
  );
};

// ── Main Tasks Page ────────────────────────────────────────────────────────────
const Tasks = () => {
  const cachedTasks = readCache('/tasks/');
  const [tasks, setTasks] = useState(Array.isArray(cachedTasks?.tasks) ? cachedTasks.tasks : []);
  const [loading, setLoading] = useState(!cachedTasks);
  const [locked, setLocked] = useState(false);
  const [weeklyLocked, setWeeklyLocked] = useState(false);
  const [weeklyStatus, setWeeklyStatus] = useState(cachedTasks ? {
    weekly_joinings: cachedTasks.weekly_joinings ?? 0,
    weekly_joinings_required: cachedTasks.weekly_joinings_required ?? 1,
    ads_locked: cachedTasks.ads_locked ?? false,
  } : null);
  const [promoCode, setPromoCode] = useState('');
  const [promoMsg, setPromoMsg] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [userLevel, setUserLevel] = useState(0);
  const [showLevelChart, setShowLevelChart] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(cachedTasks?.daily_limit || 0);
  const [completedToday, setCompletedToday] = useState(cachedTasks?.completed_today || 0);
  const [walletBalance, setWalletBalance] = useState(readCache('/wallet/')?.main_balance ?? null);
  const [loadError, setLoadError] = useState(false);

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
    if (!readCache('/tasks/')) setLoading(true);
    setLocked(false);
    setWeeklyLocked(false);
    setLoadError(false);
    try {
      const res = await api.get('/tasks/');
      const incomingTasks = Array.isArray(res.data?.tasks) ? res.data.tasks : (Array.isArray(res.data) ? res.data : null);
      if (incomingTasks) {
        setTasks(incomingTasks);
        setDailyLimit(res.data.daily_limit || 0);
        setCompletedToday(res.data.completed_today || 0);
        setWeeklyStatus({
          weekly_joinings: res.data.weekly_joinings ?? 0,
          weekly_joinings_required: res.data.weekly_joinings_required ?? 1,
          ads_locked: res.data.ads_locked ?? false,
        });
      } else {
        setTasks([]);
      }
    } catch (e) {
      const err = e.response?.data;
      if (err?.error === 'package_required') {
        setLocked(true);
      } else if (err?.error === 'weekly_joining_required') {
        setWeeklyLocked(true);
        setWeeklyStatus({
          weekly_joinings: err.weekly_joinings ?? 0,
          weekly_joinings_required: err.weekly_joinings_required ?? 1,
          ads_locked: true,
        });
      } else {
        setLoadError(true);
      }
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

  const taskList = Array.isArray(tasks) ? tasks : [];
  const available = taskList.filter(t => !t.is_completed);
  const completed = taskList.filter(t => t.is_completed);
  const currentEarning = LEVEL_EARNINGS.find(l => l.level === Math.min(userLevel, 9))?.earning || 7;

  if (loading) return (
    <div className="neon-loading">
      <div className="neon-spinner"></div>
    </div>
  );

  if (loadError) return (
    <div className="neon-loading p-4">
      <div className="neon-card p-8 text-center max-w-sm w-full space-y-3">
        <p className="text-white font-semibold">Tasks load nahi hue</p>
        <button onClick={() => setRefresh(r => r + 1)} className="neon-btn text-sm px-5 py-2">Retry</button>
      </div>
    </div>
  );

  if (locked) return (
    <section className="lux-page">
      <div className="lux-empty">
        <h2>Tasks locked</h2>
        <p>Buy a package to unlock tasks and start earning.</p>
        <Link to="/package" className="lux-withdraw">View packages</Link>
      </div>
    </section>
  );

  if (weeklyLocked) return (
    <section className="lux-page">
      <div className="lux-empty">
        <h2>Ads temporarily locked</h2>
        <p>Is hafte {weeklyStatus?.weekly_joinings ?? 0} joining hui hai. Ek naya member package activate karwayein, ads unlock ho jayengi.</p>
        <Link to="/referrals" className="lux-withdraw">Share referral link</Link>
      </div>
    </section>
  );

  const balanceText = walletBalance === null ? '—' : `Rs ${(walletBalance * 100).toFixed(0)}`;

  const joining = weeklyStatus || { weekly_joinings: 0, weekly_joinings_required: 1, ads_locked: false };

  return (
    <section className="lux-page lux-tasks">
      <div className="lux-wrap">
        <header className="lux-page-head">
          <img src={taskLogo} alt="INSTOVA" className="lux-task-mark" />
          <div>
            <h1>Tasks</h1>
            <p>Complete tasks and earn money instantly</p>
          </div>
        </header>

        <section className="lux-balance">
          <span className="lux-balance-crown">
            <svg viewBox="0 0 24 14" aria-hidden="true"><path d="M2 12 L5 4 L9 9 L12 2 L15 9 L19 4 L22 12 Z" /></svg>
            <span className="lux-balance-icon"><NavIcon name="wallet" size={20} /></span>
          </span>
          <div>
            <p className="lux-kicker">Current Balance</p>
            <p className="lux-balance-amt">{balanceText}</p>
          </div>
          <Link to="/wallet" className="lux-withdraw">Withdraw <span aria-hidden="true">›</span></Link>
        </section>

        <p className={`lux-join-pill${joining.ads_locked ? ' is-locked' : ''}`}>
          <span>{joining.ads_locked ? '!' : '✓'}</span>
          Weekly Joining: {joining.weekly_joinings}/{joining.weekly_joinings_required} — {joining.ads_locked ? 'Ads locked' : 'Ads unlocked'}
        </p>

        <section className="lux-stats">
          <article><span className="lux-stat-icon"><NavIcon name="user" size={18} /></span><strong>{available.length}</strong><span>Available</span></article>
          <article><span className="lux-stat-icon"><NavIcon name="check" size={18} /></span><strong>{completedToday}</strong><span>Done Today</span></article>
          <article><span className="lux-stat-icon"><NavIcon name="clock" size={18} /></span><strong>{dailyLimit}</strong><span>Daily Limit</span></article>
          <article className="lux-stat-gold"><span className="lux-stat-icon"><NavIcon name="coin" size={18} /></span><strong>Rs {(completedToday * currentEarning).toFixed(0)}</strong><span>Earned</span></article>
        </section>

        {available.length === 0 ? (
          <section className="lux-empty">
            <p>All tasks completed</p>
            <span>Check back later for new tasks</span>
          </section>
        ) : (
          <div className="lux-task-grid">
            {available.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                currentEarning={currentEarning}
                onDone={(newBalance) => {
                  if (newBalance !== undefined) setWalletBalance(newBalance);
                  setRefresh((value) => value + 1);
                }}
              />
            ))}
          </div>
        )}

        {completed.length > 0 && (
          <section className="lux-done">
            <p>Completed</p>
            {completed.map((task) => (
              <div key={task.id}>
                <span>{task.title}</span>
                <strong>+Rs {currentEarning}</strong>
              </div>
            ))}
          </section>
        )}

        <section className="lux-promo">
          <input value={promoCode} onChange={(event) => setPromoCode(event.target.value)} placeholder="Promo code" className="lux-input" />
          <button type="button" onClick={redeemPromo} className="lux-withdraw">Apply</button>
          {promoMsg && <p>{promoMsg}</p>}
        </section>
      </div>
    </section>
  );
};

export default Tasks;
