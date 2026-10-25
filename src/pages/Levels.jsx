import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Crown = () => (
  <svg viewBox="0 0 24 16" className="lux-level-crown" aria-hidden="true">
    <path d="M2 14 L5 5 L9 10 L12 2 L15 10 L19 5 L22 14 Z" />
  </svg>
);

const Levels = () => {
  const [level, setLevel] = useState(null);
  const [error, setError] = useState(false);

  const load = async () => {
    setError(false);
    try {
      const res = await api.get('/auth/dashboard-stats/');
      setLevel(res.data.level || null);
    } catch {
      setError(true);
    }
  };

  useEffect(() => { load(); }, []);

  if (!level) {
    return (
      <section className="lux-page">
        <div className="lux-empty">
          {error ? (
            <>
              <p>Levels load nahi hue</p>
              <button type="button" onClick={load} className="lux-withdraw">Retry</button>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </section>
    );
  }

  const requirements = Array.isArray(level.requirements) && level.requirements.length
    ? level.requirements
    : [0, 7, 20, 35, 50, 100, 120, 300, 450, 800];
  const current = Number(level.current || 0);
  const approved = Number(level.approved_direct || 0);
  const working = current < 9 ? current + 1 : 9;
  const target = Number(requirements[working] || 0);
  const shown = Math.min(approved, target || approved);
  const percent = current >= 9 ? 100 : (target > 0 ? Math.min(100, Math.round((approved / target) * 100)) : 0);

  const rows = requirements.slice(1).map((needed, index) => {
    const number = index + 1;
    const goal = Number(needed || 0);
    if (number < working || current >= 9) {
      return { number, state: 'done', have: goal, goal, note: `${goal} / ${goal} milestones` };
    }
    if (number === working && current < 9) {
      return { number, state: 'current', have: approved, goal, note: `${approved} / ${goal} milestones` };
    }
    return { number, state: 'locked', have: 0, goal, note: 'Complete more approved activity' };
  });

  return (
    <section className="lux-page">
      <div className="lux-wrap">
        <article className="lux-progress-card">
          <p className="lux-progress-title">Your Progress</p>
          <div className="lux-progress-main">
            <span className="lux-medal"><Crown /></span>
            <div>
              <p className="lux-level-name">LEVEL {working}</p>
              <p className="lux-level-count">{current >= 9 ? `${target} / ${target}` : `${shown} / ${target}`}</p>
              <p className="lux-level-caption">approved activity milestones</p>
            </div>
          </div>
          <div className="lux-level-bar">
            <span style={{ width: `${percent}%` }} />
          </div>
          <p className="lux-level-percent">{percent}%</p>
        </article>

        {rows.map((row) => (
          <article key={row.number} className={`lux-level-card lux-level-${row.state}`}>
            <span className={`lux-level-badge lux-badge-${row.state}`}>
              <small>LEVEL</small>
              <strong>{row.number}</strong>
            </span>
            <div className="lux-level-copy">
              <h2>Level {row.number}</h2>
              {row.state === 'done' && <span className="lux-pill lux-pill-done">Completed</span>}
              {row.state === 'current' && <span className="lux-pill lux-pill-now">Current Level</span>}
              {row.state === 'locked' && <span className="lux-pill lux-pill-lock">Locked</span>}
              <p>{row.note}</p>
            </div>
            <Link to="/referrals" className="lux-level-go" aria-label={`Level ${row.number} team`}>›</Link>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Levels;
