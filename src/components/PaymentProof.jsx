import { useState } from 'react';
import api from '../api/axios';

const PaymentProof = ({ id, kind = 'package' }) => {
  const [src, setSrc] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    if (src) {
      setOpen(true);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const path = kind === 'upgrade' ? `/admin/upgrade-proof/${id}/` : `/admin/package-proof/${id}/`;
      const res = await api.get(path);
      if (!res.data?.screenshot) {
        setError('No payment proof uploaded');
        return;
      }
      setSrc(res.data.screenshot);
      setOpen(true);
    } catch {
      setError('Proof could not load');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button type="button" onClick={load} className="text-xs font-bold text-blue-600 underline">
        {loading ? 'Loading proof...' : 'View payment proof'}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {open && src && (
        <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl p-3 max-w-sm w-full" onClick={(event) => event.stopPropagation()}>
            <img src={src} alt="Payment proof" className="w-full rounded-xl object-contain max-h-[70vh]" />
            <button type="button" onClick={() => setOpen(false)} className="mt-3 w-full bg-gray-100 text-gray-700 py-2 rounded-xl text-sm font-semibold">Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentProof;
