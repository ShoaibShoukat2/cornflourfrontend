import { useEffect, useState } from 'react';
import api from '../../api/axios';

const AdminTerms = () => {
  const [sections, setSections] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/terms/')
      .then((res) => setSections(res.data.sections || []))
      .catch(() => setMessage('Could not load terms'))
      .finally(() => setLoading(false));
  }, []);

  const update = (index, key, value) => {
    setSections((current) => current.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [key]: value } : item
    )));
  };

  const save = async () => {
    setMessage('');
    try {
      const res = await api.post('/admin/terms/', { sections });
      setSections(res.data.sections || sections);
      setMessage('Terms updated');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Could not save terms');
    }
  };

  if (loading) return <p className="text-center text-gray-400 py-10">Loading...</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Terms & Conditions</h1>
      {message && <p className="text-sm font-semibold text-orange-600">{message}</p>}
      {sections.map((section, index) => (
        <div key={index} className="bg-white rounded-xl p-4 shadow-sm space-y-2">
          <input
            value={section.title}
            onChange={(event) => update(index, 'title', event.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold"
          />
          <textarea
            value={section.body}
            onChange={(event) => update(index, 'body', event.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </div>
      ))}
      <button type="button" onClick={save} className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold">
        Save terms
      </button>
    </div>
  );
};

export default AdminTerms;
