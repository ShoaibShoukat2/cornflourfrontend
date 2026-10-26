import { useEffect, useState } from 'react';
import { subscribeNetwork } from '../api/axios';

const NetworkBanner = () => {
  const [status, setStatus] = useState({ kind: 'ok', message: '' });

  useEffect(() => subscribeNetwork(setStatus), []);

  if (!status.message || status.kind === 'ok') return null;

  return (
    <div className={`net-banner is-${status.kind}`} role="status">
      <span className="net-dot" aria-hidden="true" />
      <p>{status.message}</p>
    </div>
  );
};

export default NetworkBanner;
