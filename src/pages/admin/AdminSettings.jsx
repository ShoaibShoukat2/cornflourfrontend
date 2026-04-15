import { useState, useEffect } from 'react';
import api from '../../api/axios';

// ── Tab Button ─────────────────────────────────────────────────────────────────
const Tab = ({ active, onClick, icon, label }) => (
  <button onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
      active ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
    }`}>
    <span>{icon}</span>{label}
  </button>
);

// ── Flash Message ──────────────────────────────────────────────────────────────
const Flash = ({ msg }) => {
  if (!msg) return null;
  const ok = msg.startsWith('✅');
  return (
    <div className={`px-4 py-3 rounded-xl text-sm font-semibold border mb-4 ${ok ? 'bg-green-50 border-green-300 text-green-700' : 'bg-red-50 border-red-300 text-red-700'}`}>
      {msg}
    </div>
  );
};

// ── General Settings Tab ───────────────────────────────────────────────────────
const GeneralSettings = () => {
  const [form, setForm] = useState({
    site_name: '', minimum_withdrawal: '', signup_bonus: '',
    daily_bonus: '', max_tasks_per_day: '', maintenance_mode: false,
  });
  const [msg, setMsg] = useState('');
  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  useEffect(() => {
    api.get('/admin/site-settings/').then(r => {
      setForm({
        site_name: r.data.site_name || '',
        minimum_withdrawal: r.data.minimum_withdrawal || '',
        signup_bonus: r.data.signup_bonus || '',
        daily_bonus: r.data.daily_bonus || '',
        max_tasks_per_day: r.data.max_tasks_per_day || '',
        maintenance_mode: r.data.maintenance_mode || false,
      });
    }).catch(() => {});
  }, []);

  const save = async () => {
    try {
      await api.post('/admin/update-settings/', form);
      flash('✅ General settings saved');
    } catch { flash('❌ Failed to save'); }
  };

  const fields = [
    { key: 'site_name', label: '🏷 Site Name', type: 'text' },
    { key: 'minimum_withdrawal', label: '💸 Min Withdrawal (decimal)', type: 'number', hint: 'e.g. 0.50 = Rs 50' },
    { key: 'signup_bonus', label: '🎁 Signup Bonus (decimal)', type: 'number', hint: 'e.g. 0.50 = Rs 50' },
    { key: 'daily_bonus', label: '📅 Daily Bonus (decimal)', type: 'number' },
    { key: 'max_tasks_per_day', label: '🎯 Max Tasks Per Day', type: 'number' },
  ];

  return (
    <div className="space-y-4">
      <Flash msg={msg} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(f => (
          <div key={f.key}>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">{f.label}</label>
            <input type={f.type} value={form[f.key]}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
            {f.hint && <p className="text-xs text-gray-400 mt-1">{f.hint}</p>}
          </div>
        ))}
        <div className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl">
          <label className="text-sm font-semibold text-gray-600 flex-1">🔧 Maintenance Mode</label>
          <button onClick={() => setForm({ ...form, maintenance_mode: !form.maintenance_mode })}
            className={`w-12 h-6 rounded-full transition-all ${form.maintenance_mode ? 'bg-red-500' : 'bg-gray-300'}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-all mx-0.5 ${form.maintenance_mode ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>
      <button onClick={save} className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition">
        Save General Settings
      </button>
    </div>
  );
};

// ── Referral Commission Settings Tab ──────────────────────────────────────────
const ReferralSettings = () => {
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ signup_bonus: '', referral_enabled: true });
  const [msg, setMsg] = useState('');
  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  useEffect(() => {
    api.get('/admin/referral-commission-settings/').then(r => {
      setData(r.data);
      setForm({ signup_bonus: r.data.signup_bonus, referral_enabled: r.data.referral_enabled });
    }).catch(() => {});
  }, []);

  const save = async () => {
    try {
      await api.post('/admin/referral-commission-settings/', form);
      flash('✅ Referral settings saved');
    } catch { flash('❌ Failed to save'); }
  };

  const commissionRows = data ? [
    { label: 'L1 Package Commission', value: `${data.l1_package}%`, desc: 'Direct refer buys package', color: 'text-green-600' },
    { label: 'L2 Package Commission', value: `${data.l2_package}%`, desc: "Member's member buys package", color: 'text-blue-600' },
    { label: 'L3 Package Commission', value: `${data.l3_package}%`, desc: "Member's member's member buys", color: 'text-purple-600' },
    { label: 'L1 Task Commission', value: `${data.l1_task}%`, desc: 'Direct refer completes task', color: 'text-orange-600' },
    { label: 'L2 Task Commission', value: `${data.l2_task}%`, desc: "Member's member completes task", color: 'text-teal-600' },
    { label: 'L3 Task Commission', value: `${data.l3_task}%`, desc: "Member's member's member task", color: 'text-pink-600' },
  ] : [];

  return (
    <div className="space-y-5">
      <Flash msg={msg} />

      {/* Commission Rates Display */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">📊 Current Commission Rates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {commissionRows.map((r, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className={`text-2xl font-black ${r.color}`}>{r.value}</p>
              <p className="text-sm font-semibold text-gray-700 mt-1">{r.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">* Commission rates are fixed in system logic. Contact developer to change percentages.</p>
      </div>

      {/* Editable Settings */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-gray-700">⚙️ Editable Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">🎁 Signup Bonus (decimal)</label>
            <input type="number" value={form.signup_bonus}
              onChange={e => setForm({ ...form, signup_bonus: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
            <p className="text-xs text-gray-400 mt-1">e.g. 0.50 = Rs 50</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl">
            <label className="text-sm font-semibold text-gray-600 flex-1">🔗 Referral System</label>
            <button onClick={() => setForm({ ...form, referral_enabled: !form.referral_enabled })}
              className={`w-12 h-6 rounded-full transition-all ${form.referral_enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-all mx-0.5 ${form.referral_enabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
        <button onClick={save} className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition">
          Save Referral Settings
        </button>
      </div>
    </div>
  );
};

// ── Level Settings Tab ─────────────────────────────────────────────────────────
const LevelSettings = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/level-settings/').then(r => setData(r.data)).catch(() => {});
  }, []);

  const packageColors = {
    normal: 'bg-blue-50 border-blue-200 text-blue-700',
    super: 'bg-purple-50 border-purple-200 text-purple-700',
    premium: 'bg-orange-50 border-orange-200 text-orange-700',
    high_octane: 'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <div className="space-y-5">
      {/* Level Rewards */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">💰 Task Reward Per Level</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {data && Object.entries(data.level_rewards).map(([lvl, reward]) => (
            <div key={lvl} className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 font-semibold">Level {lvl}</p>
              <p className="text-lg font-black text-green-700 mt-1">Rs {(reward * 100).toFixed(0)}</p>
              <p className="text-xs text-gray-400">per task</p>
            </div>
          ))}
        </div>
      </div>

      {/* Task Limits Per Package */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">🎯 Daily Task Limits (Package × Level)</h3>
        {data && Object.entries(data.task_limits).map(([pkg, limits]) => (
          <div key={pkg} className={`border rounded-2xl p-4 mb-3 ${packageColors[pkg] || 'bg-gray-50 border-gray-200'}`}>
            <p className="font-bold text-sm capitalize mb-2">📦 {pkg.replace('_', ' ')} Package</p>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {limits.map((limit, i) => (
                <div key={i} className="bg-white rounded-lg p-2 text-center shadow-sm">
                  <p className="text-xs text-gray-400">L{i}</p>
                  <p className="font-black text-gray-800">{limit}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
        <p className="text-xs text-gray-400 mt-2">* Level settings are configured in system code. Contact developer to update.</p>
      </div>
    </div>
  );
};

// ── Payment Accounts Tab ───────────────────────────────────────────────────────
const PaymentAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ bank_name: '', account_title: '', account_number: '', instructions: '', is_active: true });
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');
  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const load = () => api.get('/admin/payment-accounts/').then(r => setAccounts(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      await api.post('/admin/payment-accounts/', form);
      flash('✅ Account saved');
      setForm({ bank_name: '', account_title: '', account_number: '', instructions: '', is_active: true });
      setEditing(null);
      load();
    } catch { flash('❌ Failed to save'); }
  };

  const del = async (id) => {
    if (!confirm('Delete this account?')) return;
    try {
      await api.delete(`/admin/payment-accounts/${id}/delete/`);
      flash('✅ Deleted'); load();
    } catch { flash('❌ Failed'); }
  };

  const startEdit = (acc) => {
    setEditing(acc.id);
    setForm({ bank_name: acc.bank_name, account_title: acc.account_title, account_number: acc.account_number, instructions: acc.instructions || '', is_active: acc.is_active });
  };

  const bankIcons = { JazzCash: '📱', EasyPaisa: '💚', 'Bank Transfer': '🏦', PayPal: '💙' };

  return (
    <div className="space-y-5">
      <Flash msg={msg} />

      {/* Existing Accounts */}
      {accounts.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3">💳 Existing Payment Accounts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {accounts.map(acc => (
              <div key={acc.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{bankIcons[acc.bank_name] || '💳'}</span>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{acc.bank_name}</p>
                      <p className="text-xs text-gray-400">{acc.account_title}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${acc.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {acc.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm font-mono text-gray-700 bg-gray-50 px-3 py-2 rounded-lg mb-3">{acc.account_number}</p>
                {acc.instructions && <p className="text-xs text-gray-400 mb-3">{acc.instructions}</p>}
                <div className="flex gap-2">
                  <button onClick={() => startEdit(acc)} className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-xl text-xs font-bold hover:bg-blue-100 transition">✏️ Edit</button>
                  <button onClick={() => del(acc.id)} className="flex-1 bg-red-50 text-red-600 py-2 rounded-xl text-xs font-bold hover:bg-red-100 transition">🗑️ Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Form */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-gray-700 mb-4">{editing ? '✏️ Edit Account' : '➕ Add New Account'}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: 'bank_name', label: 'Bank / Service Name', placeholder: 'e.g. JazzCash, EasyPaisa' },
            { key: 'account_title', label: 'Account Title', placeholder: 'e.g. Muhammad Ali' },
            { key: 'account_number', label: 'Account Number', placeholder: 'e.g. 03001234567' },
            { key: 'instructions', label: 'Instructions (optional)', placeholder: 'e.g. Send exact amount' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">{f.label}</label>
              <input type="text" value={form[f.key]} placeholder={f.placeholder}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
            </div>
          ))}
          <div className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-xl">
            <label className="text-sm font-semibold text-gray-600 flex-1">Active</label>
            <button onClick={() => setForm({ ...form, is_active: !form.is_active })}
              className={`w-12 h-6 rounded-full transition-all ${form.is_active ? 'bg-green-500' : 'bg-gray-300'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-all mx-0.5 ${form.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={save} className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition">
            {editing ? 'Update Account' : 'Add Account'}
          </button>
          {editing && (
            <button onClick={() => { setEditing(null); setForm({ bank_name: '', account_title: '', account_number: '', instructions: '', is_active: true }); }}
              className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition">
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Settings Page ─────────────────────────────────────────────────────────
const AdminSettings = () => {
  const [tab, setTab] = useState('general');

  const tabs = [
    { id: 'general', icon: '⚙️', label: 'General' },
    { id: 'referral', icon: '🤝', label: 'Referral Commission' },
    { id: 'levels', icon: '📈', label: 'Levels' },
    { id: 'payment', icon: '💳', label: 'Payment Accounts' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-gray-800">⚙️ Settings</h1>
        <p className="text-gray-400 text-sm mt-0.5">Manage site configuration</p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(t => <Tab key={t.id} active={tab === t.id} onClick={() => setTab(t.id)} icon={t.icon} label={t.label} />)}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        {tab === 'general' && <GeneralSettings />}
        {tab === 'referral' && <ReferralSettings />}
        {tab === 'levels' && <LevelSettings />}
        {tab === 'payment' && <PaymentAccounts />}
      </div>
    </div>
  );
};

export default AdminSettings;
