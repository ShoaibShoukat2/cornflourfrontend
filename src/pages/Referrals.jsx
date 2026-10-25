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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(stats.referral_link);
    } catch {
      const input = document.createElement('input');
      input.value = stats.referral_link;
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

  return (
    <section className="lux-page">
      <div className="lux-wrap">
        <article className="lux-team-banner">
          <span className="lux-medal"><NavIcon name="users" size={26} /></span>
          <div>
            <h1>My Team</h1>
            <p>Grow together, learn together</p>
          </div>
        </article>

        <section className="lux-stats">
          <article><span className="lux-stat-icon"><NavIcon name="users" size={16} /></span><strong>{referred}</strong><span>Referred</span></article>
          <article><span className="lux-stat-icon"><NavIcon name="check" size={16} /></span><strong>{active}</strong><span>Active</span></article>
          <article><span className="lux-stat-icon"><NavIcon name="history" size={16} /></span><strong>{pending}</strong><span>Pending</span></article>
          <article className="lux-stat-gold"><span className="lux-stat-icon"><NavIcon name="upgrade" size={16} /></span><strong>Level {stats.level ?? 0}</strong><span>Team Level</span></article>
        </section>

        <article className="lux-link-card">
          <p className="lux-progress-title">Your Referral Link</p>
          <p className="lux-level-caption">Share this link and invite your friends</p>
          <div className="lux-link-row">
            <span>{stats.referral_link}</span>
            <button type="button" onClick={copyToClipboard}>{copied ? 'Copied' : 'Copy Link'}</button>
          </div>
          {stats.ads_locked && (
            <p className="lux-level-caption">Is hafte {stats.weekly_joinings}/{stats.weekly_joinings_required} joining. Ads unlock ke liye ek member activate karwayein.</p>
          )}
        </article>

        <article className="lux-member-card">
          <header>
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
          {rows.map((member) => (
            <div key={member.id} className="lux-member">
              <span className="lux-member-avatar">{(member.username || '?').charAt(0).toUpperCase()}</span>
              <div>
                <strong>{member.username}</strong>
                <p>Joined {new Date(member.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <span className={`lux-member-status ${member.status === 'active' ? 'is-active' : 'is-pending'}`}>
                {member.status === 'active' ? 'Active' : 'Pending'}
              </span>
            </div>
          ))}
        </article>
      </div>
    </section>
  );
};

export default Referrals;
