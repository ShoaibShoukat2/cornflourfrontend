import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowPathIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';

const fmtRs = (n) => `Rs ${Number(n || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;

const maxOf = (arr) => Math.max(...arr, 1);

/** Multi-series line chart (SVG) */
const LineChart = ({ labels, series, height = 200 }) => {
  const W = 600;
  const H = height;
  const pad = { t: 12, r: 12, b: 28, l: 44 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const allVals = series.flatMap((s) => s.data);
  const max = maxOf(allVals);
  const n = labels.length;

  const xAt = (i) => pad.l + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const yAt = (v) => pad.t + innerH - (v / max) * innerH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img">
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = pad.t + innerH * (1 - t);
        const val = Math.round(max * t);
        return (
          <g key={t}>
            <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="#e5e7eb" strokeWidth="1" />
            <text x={pad.l - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">{val}</text>
          </g>
        );
      })}
      {series.map((s) => {
        const pts = s.data.map((v, i) => `${xAt(i)},${yAt(v)}`).join(' ');
        return (
          <g key={s.key}>
            <polyline fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" points={pts} />
            {s.data.map((v, i) => (
              <circle key={i} cx={xAt(i)} cy={yAt(v)} r="3.5" fill={s.color} stroke="#fff" strokeWidth="1.5" />
            ))}
          </g>
        );
      })}
      {labels.map((lb, i) => (
        <text key={i} x={xAt(i)} y={H - 6} textAnchor="middle" fontSize="8" fill="#6b7280">
          {n > 10 && i % 2 !== 0 ? '' : lb}
        </text>
      ))}
    </svg>
  );
};

/** Bar chart (optional signed mode for profit/loss) */
const BarChart = ({ labels, data, color = '#f97316', height = 180, signed = false }) => {
  const W = 600;
  const H = height;
  const pad = { t: 12, r: 12, b: 28, l: 36 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const max = signed ? maxOf(data.map((v) => Math.abs(v))) : maxOf(data);
  const n = data.length;
  const gap = 4;
  const barW = n ? (innerW - gap * (n - 1)) / n : innerW;
  const midY = pad.t + innerH / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img">
      {signed && <line x1={pad.l} y1={midY} x2={W - pad.r} y2={midY} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 3" />}
      {data.map((v, i) => {
        const h = (Math.abs(v) / max) * (signed ? innerH / 2 - 4 : innerH);
        const x = pad.l + i * (barW + gap);
        const y = signed
          ? (v >= 0 ? midY - h : midY)
          : pad.t + innerH - h;
        const fill = signed ? (v >= 0 ? '#22c55e' : '#ef4444') : color;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={Math.max(h, 0)} rx="3" fill={fill} opacity={0.9} />
            {Math.abs(v) > 0 && (
              <text x={x + barW / 2} y={v >= 0 ? y - 4 : y + h + 10} textAnchor="middle" fontSize="7" fill="#374151">
                {Math.round(v)}
              </text>
            )}
          </g>
        );
      })}
      {labels.map((lb, i) => (
        <text key={i} x={pad.l + i * (barW + gap) + barW / 2} y={H - 6} textAnchor="middle" fontSize="8" fill="#6b7280">
          {n > 10 && i % 2 !== 0 ? '' : lb}
        </text>
      ))}
    </svg>
  );
};

/** Donut chart for user segments */
const DonutChart = ({ segments, size = 160 }) => {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = 52;
  const cx = size / 2;
  const cy = size / 2;
  const C = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="18" />
        {segments.filter((s) => s.value > 0).map((s) => {
          const frac = s.value / total;
          const dash = frac * C;
          const el = (
            <circle
              key={s.name}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="18"
              strokeDasharray={`${dash} ${C - dash}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          );
          offset += dash;
          return el;
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="18" fontWeight="bold" fill="#1f2937">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9" fill="#6b7280">users</text>
      </svg>
      <div className="flex-1 space-y-2 min-w-0">
        {segments.map((s) => (
          <div key={s.name} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2 min-w-0">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color }} />
              <span className="text-gray-600 truncate">{s.name}</span>
            </span>
            <span className="font-bold text-gray-800 flex-shrink-0">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChartCard = ({ title, subtitle, children, legend }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
    <div className="mb-3">
      <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    {legend && <div className="flex flex-wrap gap-3 mb-3">{legend}</div>}
    {children}
  </div>
);

const LegendItem = ({ color, label }) => (
  <span className="flex items-center gap-1.5 text-xs text-gray-600">
    <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
    {label}
  </span>
);

const DashboardCharts = ({ refreshToken = 0 }) => {
  const [charts, setCharts] = useState(null);
  const [days, setDays] = useState(14);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/admin/dashboard-charts/?days=${days}`);
      setCharts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load, refreshToken]);

  useEffect(() => {
    const id = setInterval(load, 45000);
    return () => clearInterval(id);
  }, [load]);

  if (loading && !charts) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 flex justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!charts) return null;

  const { labels, series, user_segments, package_tiers, summary } = charts;
  const profitPositive = summary.platform_net_rs >= 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ChartBarIcon className="w-5 h-5 text-orange-500" />
          <h2 className="font-bold text-gray-800">Live Analytics</h2>
          <span className="text-xs text-gray-400 hidden sm:inline">
            Updated {charts.updated_at ? new Date(charts.updated_at).toLocaleTimeString() : 'now'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                days === d ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {d}d
            </button>
          ))}
          <button type="button" onClick={load} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600" title="Refresh charts">
            <ArrowPathIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Profit / loss summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className={`rounded-2xl p-4 border-2 ${profitPositive ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <p className="text-xs font-semibold text-gray-500 uppercase">Platform Net</p>
          <p className={`text-xl font-black mt-1 ${profitPositive ? 'text-green-700' : 'text-red-700'}`}>
            {fmtRs(summary.platform_net_rs)}
          </p>
          <p className="text-xs mt-1 text-gray-500">{profitPositive ? 'Profit' : 'Loss'} (Deposits − Payouts)</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase">Money In</p>
          <p className="text-xl font-black text-green-600 mt-1">{fmtRs(summary.total_deposited_rs)}</p>
          <p className="text-xs text-gray-400 mt-1">Approved packages</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase">Money Out</p>
          <p className="text-xl font-black text-red-600 mt-1">{fmtRs(summary.total_withdrawn_rs)}</p>
          <p className="text-xs text-gray-400 mt-1">Withdrawals + referrals</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase">Premium Users</p>
          <p className="text-xl font-black text-orange-600 mt-1">{summary.premium_users}</p>
          <p className="text-xs text-gray-400 mt-1">of {summary.total_users} total · {summary.free_users} free</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard
          title="Profit / Loss (Daily Net)"
          subtitle="Deposits − withdrawals − referral payouts per day"
        >
          <BarChart labels={labels} data={series.net_profit_rs} signed />
        </ChartCard>

        <ChartCard
          title="Money Flow"
          subtitle="Package deposits vs approved withdrawals"
          legend={[
            <LegendItem key="d" color="#22c55e" label="Deposits (Rs)" />,
            <LegendItem key="w" color="#ef4444" label="Withdrawals (Rs)" />,
          ]}
        >
          <LineChart
            labels={labels}
            series={[
              { key: 'dep', data: series.deposits_rs, color: '#22c55e' },
              { key: 'wdr', data: series.withdrawals_rs, color: '#ef4444' },
            ]}
          />
        </ChartCard>

        <ChartCard title="New Signups" subtitle="Users registered per day">
          <BarChart labels={labels} data={series.new_users} color="#3b82f6" />
        </ChartCard>

        <ChartCard title="Referral Payouts" subtitle="Commission paid out per day (Rs)">
          <LineChart
            labels={labels}
            series={[{ key: 'ref', data: series.referral_payout_rs, color: '#a855f7' }]}
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Users: Premium vs Free" subtitle="Live membership breakdown">
          <DonutChart segments={user_segments} />
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/admin/reports" className="text-xs font-semibold text-orange-500 hover:text-orange-600">
              View approved members →
            </Link>
            <span className="text-xs text-gray-400">
              {summary.pending_packages} pending packages · {summary.pending_withdrawals} pending withdrawals
            </span>
          </div>
        </ChartCard>

        <ChartCard title="Package Tiers (Premium)" subtitle="Approved packages by plan">
          {package_tiers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No approved packages yet</p>
          ) : (
            <div className="space-y-3">
              {package_tiers.map((t, i) => {
                const max = maxOf(package_tiers.map((x) => x.count));
                const pct = (t.count / max) * 100;
                const colors = ['#f97316', '#8b5cf6', '#22c55e', '#3b82f6'];
                return (
                  <div key={t.key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-gray-700">{t.name}</span>
                      <span className="font-bold text-gray-800">{t.count}</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: colors[i % colors.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
};

export default DashboardCharts;
