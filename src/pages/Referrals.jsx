import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { NavIcon } from '../components/NavIcons';

const Referrals = () => {
  const [stats, setStats] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoadError(false);
    try {
      const [statsRes, refRes] = await Promise.allSettled([
        api.get('/referrals/stats/'),
        api.get('/referrals/list/'),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (refRes.status === 'fulfilled') setReferrals(refRes.value.data || []);
      if (statsRes.status !== 'fulfilled') setLoadError(true);
    } catch {
      setLoadError(true);
    }
  };

  const shareLink = (() => {
    const code = stats?.referral_code;
    if (!code) return stats?.referral_link || '';
    const host = window.location.hostname;
    const origin = host === 'instovaearn.com' || host === 'www.instovaearn.com'
      ? 'https://www.instovaearn.com'
      : window.location.origin;
    return `${origin}/register?ref=${encodeURIComponent(code)}`;
  })();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
    } catch {
      const input = document.createElement('input');
      input.value = shareLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rows = useMemo(() => {
    if (filter === 'active') return referrals.filter((row) => row.status === 'active');
    if (filter === 'pending') return referrals.filter((row) => row.status !== 'active');
    return referrals;
  }, [filter, referrals]);

  if (!stats) {
    return (
      <section className="lux-page">
        <div className="lux-empty">
          {loadError ? (
            <>
              <p>Team load nahi hui</p>
              <button type="button" onClick={fetchData} className="lux-withdraw">Retry</button>
            </>
          ) : <p>Loading...</p>}
        </div>
      </section>
    );
  }

  const referred = stats.referred_total ?? ((stats.direct_referrals || 0) + (stats.indirect_referrals || 0));
  const active = stats.active_members ?? stats.total_team ?? stats.total_referrals ?? 0;
  const pending = stats.pending_members ?? Math.max(0, referred - active);

  const flowers = ['is-rose', 'is-lilac', 'is-blush', 'is-violet'];

  return (
    <section className="lux-page lux-team">
      <div className="lux-wrap">
        <article className="lux-team-banner">
          <span className="lux-team-badge" aria-hidden="true">
            <svg className="lux-team-crown" viewBox="0 0 24 14"><path d="M2 12 L5 4 L9 9 L12 2 L15 9 L19 4 L22 12 Z" /></svg>
            <NavIcon name="users" size={26} />
          </span>
          <div>
            <h1>My Team</h1>
            <p>Grow together, learn together</p>
          </div>
        </article>

        <section className="lux-team-stats">
          <article className="is-rose">
            <span><NavIcon name="users" size={18} /></span>
            <strong>{referred}</strong>
            <small>Referred</small>
          </article>
          <article className="is-lilac">
            <span><NavIcon name="user" size={18} /></span>
            <strong>{active}</strong>
            <small>Active</small>
          </article>
          <article className="is-blush">
            <span><NavIcon name="clock" size={18} /></span>
            <strong>{pending}</strong>
            <small>Pending</small>
          </article>
          <article className="is-level">
            <span><NavIcon name="star" size={18} /></span>
            <strong>Level {stats.level ?? 0}</strong>
            <small>Team Level</small>
          </article>
        </section>

        <article className="lux-link-card">
          <div className="lux-link-head">
            <span><NavIcon name="link" size={16} /></span>
            <div>
              <p>Your Referral Link</p>
              <small>Share this link and invite your friends</small>
            </div>
          </div>
          <div className="lux-link-row">
            <NavIcon name="link" size={14} />
            <span>{shareLink}</span>
            <button type="button" onClick={copyToClipboard}>
              <NavIcon name="tasks" size={14} />
              {copied ? 'Copied' : 'Copy Link'}
            </button>
          </div>
          {stats.ads_locked && (
            <p className="lux-link-note">Is hafte {stats.weekly_joinings}/{stats.weekly_joinings_required} joining. Ads unlock ke liye ek member activate karwayein.</p>
          )}
        </article>

        <article className="lux-member-card">
          <header>
            <span className="lux-member-mark"><NavIcon name="users" size={16} /></span>
            <div>
              <h2>Team Members</h2>
              <p>Your growing team</p>
            </div>
            <select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter team">
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
            </select>
          </header>
          {rows.length === 0 && <p className="lux-member-empty">No members in this list yet.</p>}
          {rows.map((member, index) => (
            <div key={member.id} className="lux-member">
              <span className={`lux-bloom ${flowers[index % flowers.length]}`} aria-hidden="true" />
              <div>
                <strong>{member.username}</strong>
                <p>Joined {new Date(member.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <span className={`lux-member-status ${member.status === 'active' ? 'is-active' : 'is-pending'}`}>
                <i />
                {member.status === 'active' ? 'Active' : 'Pending'}
              </span>
              <em aria-hidden="true">›</em>
            </div>
          ))}
        </article>
      </div>
    </section>
  );
};

export default Referrals;
