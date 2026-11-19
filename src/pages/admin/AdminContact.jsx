import { useEffect, useState } from 'react';
import api from '../../api/axios';

const INITIAL_FORM = {
  contact_admin_name: '',
  contact_admin_purpose: '',
  contact_instructions: '',
  support_phone: '',
  whatsapp_contact_number: '',
  botim_contact_number: '',
  botim_contact_link: '',
  whatsapp_icon: '',
  botim_icon: '',
};
const CONTACT_KEYS = Object.keys(INITIAL_FORM);

const AdminContact = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/admin/site-settings/')
      .then(({ data }) => setForm((current) => ({ ...current, ...data })))
      .catch((error) => setMessage(error.response?.data?.error || 'Could not load contact settings'))
      .finally(() => setLoading(false));
  }, []);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const uploadIcon = (key, file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage('Select an image file for the icon');
      return;
    }
    if (file.size > 256 * 1024) {
      setMessage('Icons must be 256KB or smaller');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update(key, reader.result);
    reader.onerror = () => setMessage('Could not read the selected icon');
    reader.readAsDataURL(file);
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload = Object.fromEntries(CONTACT_KEYS.map((key) => [key, form[key] || '']));
      await api.post('/admin/update-settings/', payload);
      setMessage('Contact settings saved');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Could not save contact settings');
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: 'contact_admin_name', label: 'Admin / Leader Name', type: 'text' },
    { key: 'contact_admin_purpose', label: 'Purpose / Role', type: 'text' },
    { key: 'contact_instructions', label: 'Instructions for Users', type: 'textarea' },
    { key: 'support_phone', label: 'Support Number (WhatsApp fallback)', type: 'tel' },
    { key: 'whatsapp_contact_number', label: 'WhatsApp Number', type: 'tel' },
    { key: 'botim_contact_number', label: 'Botim Number', type: 'tel' },
    { key: 'botim_contact_link', label: 'Botim Direct Chat Link', type: 'url' },
  ];

  return (
    <section className="mx-auto max-w-3xl space-y-5">
      <header>
        <h1 className="text-2xl font-black text-gray-800">Contact Us Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage the support contact details shown on the user Contact Us page.</p>
      </header>

      {message && (
        <p role="status" className={`rounded-xl border px-4 py-3 text-sm font-semibold ${message.includes('saved') ? 'border-green-200 bg-green-50 text-green-700' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
          {message}
        </p>
      )}
      {loading ? <p className="text-sm text-gray-500">Loading contact settings…</p> : (
        <form onSubmit={save} className="space-y-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <label key={field.key} className={`block text-xs font-semibold text-gray-600 ${field.type === 'textarea' ? 'sm:col-span-2' : ''}`}>
                {field.label}
                {field.type === 'textarea' ? (
                  <textarea rows={4} value={form[field.key] || ''} onChange={(event) => update(field.key, event.target.value)}
                    className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-3 text-sm text-gray-800 focus:border-orange-400 focus:outline-none" />
                ) : (
                  <input type={field.type} value={form[field.key] || ''} onChange={(event) => update(field.key, event.target.value)}
                    className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-3 text-sm text-gray-800 focus:border-orange-400 focus:outline-none" />
                )}
              </label>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { key: 'whatsapp_icon', label: 'WhatsApp Icon' },
              { key: 'botim_icon', label: 'Botim Icon' },
            ].map(({ key, label }) => (
              <label key={key} className="block rounded-xl border border-gray-200 p-4 text-xs font-semibold text-gray-600">
                {label}
                <span className="mt-3 flex items-center gap-3">
                  {form[key] && <img src={form[key]} alt="" className="h-11 w-11 rounded-lg object-contain" />}
                  <input type="file" accept="image/*" onChange={(event) => uploadIcon(key, event.target.files?.[0])}
                    className="min-w-0 text-xs" />
                </span>
                <span className="mt-2 block font-normal text-gray-400">Image up to 256KB</span>
              </label>
            ))}
          </div>

          <button type="submit" disabled={saving}
            className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 text-sm font-bold text-white disabled:opacity-60 sm:w-auto">
            {saving ? 'Saving…' : 'Save Contact Settings'}
          </button>
        </form>
      )}
    </section>
  );
};

export default AdminContact;
