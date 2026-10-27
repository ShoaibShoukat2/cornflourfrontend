import { useEffect, useState } from 'react';
import api from '../api/axios';

const Terms = () => {
  const [sections, setSections] = useState([]);
  const [error, setError] = useState(false);

  const load = async () => {
    setError(false);
    try {
      const res = await api.get('/auth/terms/');
      setSections(res.data.sections || []);
    } catch {
      setError(true);
    }
  };

  useEffect(() => { load(); }, []);

  if (error && !sections.length) {
    return (
      <section className="lux-page">
        <div className="lux-empty">
          <p>Terms load nahi hui</p>
          <button type="button" onClick={load} className="lux-withdraw">Retry</button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 px-4">
      <section className="max-w-lg mx-auto space-y-4">
        <header className="text-center">
          <h1 className="text-2xl font-black neon-title">Terms & Conditions</h1>
          <p className="neon-subtitle text-sm mt-1">Instovaearn.com · Withdrawals, complaints, packages, and support</p>
        </header>
        {sections.map((section, index) => (
          <article key={`${section.title}-${index}`} className="neon-card p-4">
            <h2 className="font-bold text-white">{index + 1}. {section.title}</h2>
            <p className="text-sm text-white/75 mt-2 leading-relaxed">{section.body}</p>
          </article>
        ))}
      </section>
    </section>
  );
};

export default Terms;
