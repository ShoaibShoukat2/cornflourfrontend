import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import api, { readCache } from '../api/axios';

const Crown = () => (
  <svg viewBox="0 0 24 16" aria-hidden="true">
    <path d="M2 14 L5 5 L9 10 L12 2 L15 10 L19 5 L22 14 Z" />
  </svg>
);

const Wreath = ({ number, state }) => (
  <span className={`lux-wreath lux-wreath-${state}`} aria-hidden="true">
    <svg viewBox="0 0 64 64">
      <path d="M32 8c-8 8-14 16-12 28-8-6-10-16-4-26 6 2 12 1 16-2z" />
      <path d="M32 8c8 8 14 16 12 28 8-6 10-16 4-26-6 2-12 1-16-2z" />
      <path d="M18 38c-6 8-4 16 4 20" />
      <path d="M46 38c6 8 4 16-4 20" />
      <circle cx="32" cy="36" r="13" />
    </svg>
    <span>
      <small>LEVEL</small>
      <strong>{number}</strong>
    </span>
    {state === 'locked' && (
      <svg className="lux-wreath-lock" viewBox="0 0 24 24">
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 118 0v3" />
      </svg>
    )}
  </span>
);

const Levels = () => {
  const [level, setLevel] = useState(readCache('/auth/dashboard-stats/')?.level || null);
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
      <section className="lux-page lux-levels">
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
      return { number, state: 'done', note: `${goal} / ${goal} milestones` };
    }
    if (number === working && current < 9) {
      return { number, state: 'current', note: `${approved} / ${goal} milestones` };
    }
    return { number, state: 'locked', note: 'Complete more approved activity' };
  });

  return (
    <section className="lux-page lux-levels">
      <div className="lux-wrap">
        <article className="lux-progress-card">
          <div className="lux-progress-main">
            <span className="lux-medal"><Crown /></span>
            <div>
              <p className="lux-progress-title">Your Progress</p>
              <p className="lux-level-plaque">LEVEL {working}</p>
              <p className="lux-level-count">{current >= 9 ? `${target} / ${target}` : `${shown} / ${target}`}</p>
              <p className="lux-level-caption">approved activity milestones</p>
            </div>
          </div>
          <div className="lux-level-meter">
            <div className="lux-level-bar">
              <span style={{ width: `${percent}%` }} />
            </div>
            <strong>{percent}%</strong>
          </div>
        </article>

        {rows.map((row) => (
          <article key={row.number} className={`lux-level-card lux-level-${row.state}`}>
            <Wreath number={row.number} state={row.state} />
            <div className="lux-level-copy">
              <h2>Level {row.number}</h2>
              {row.state === 'done' && (
                <span className="lux-pill lux-pill-done">
                  <svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" /></svg>
                  Completed
                </span>
              )}
              {row.state === 'current' && (
                <span className="lux-pill lux-pill-now"><Crown /> Current Level</span>
              )}
              {row.state === 'locked' && (
                <span className="lux-pill lux-pill-lock">
                  <svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 118 0v3" /></svg>
                  Locked
                </span>
              )}
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
