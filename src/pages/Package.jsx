import { useState, useEffect } from 'react';
import api from '../api/axios';

const Package = () => {
  const [step, setStep] = useState('info'); // info | payment | submitted
  const [account, setAccount] = useState(null);
  const [packageStatus, setPackageStatus] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/auth/package-status/');
      setPackageStatus(res.data);
      if (res.data.status === 'pending') setStep('submitted');
      if (res.data.status === 'approved') setStep('active');
    } catch (e) {
      console.error(e);
    }
  };

  const handleBuyClick = async () => {
    setError('');
    try {
      const res = await api.get('/auth/payment-account/');
      setAccount(res.data);
      setStep('payment');
    } catch (e) {
      setError('Payment account not set up yet. Please contact admin.');
    }
  };

  const handleScreenshot = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshot(reader.result);
      setScreenshotPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!screenshot) { setError('Please upload your payment screenshot'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/submit-payment/', { screenshot });
      setStep('submitted');
      setMessage('Payment submitted! Your account will be activated within 24 hours after verification.');
    } catch (e) {
      setError(e.response?.data?.error || 'Submission failed, try again');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: '🎯', text: 'Unlimited Tasks Daily' },
    { icon: '👥', text: 'Referral Bonus Rs 50 per friend' },
    { icon: '💸', text: 'Withdraw via JazzCash / EasyPaisa' },
    { icon: '🎁', text: 'Daily Bonus every day' },
    { icon: '📈', text: 'Earn up to Rs 10,000 per month' },
    { icon: '⚡', text: 'Priority support' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 pt-8 pb-16 text-center">
        <div className="w-14 h-14 bg-white rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg">
          <span className="text-2xl">📦</span>
        </div>
        <h1 className="text-xl font-bold">Package</h1>
        <p className="text-orange-100 text-sm mt-1">One time investment, earn daily</p>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-10 pb-10">

        {/* ── ACTIVE ── */}
        {step === 'active' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-black text-green-600 mb-2">Package Active!</h2>
            <p className="text-gray-500">Your Corn Plan is active. Start earning now.</p>
          </div>
        )}

        {/* ── SUBMITTED ── */}
        {step === 'submitted' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-black text-orange-500 mb-2">Under Review</h2>
            <p className="text-gray-600 mb-2">Your payment screenshot has been submitted.</p>
            <p className="text-gray-500 text-sm">Your account will be activated within <span className="font-bold text-orange-500">24 hours</span> after verification by admin.</p>
          </div>
        )}

        {/* ── PAYMENT STEP ── */}
        {step === 'payment' && account && (
          <div className="space-y-4">
            {/* Bank Details Card */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 text-white text-center">
                <p className="font-bold text-lg">Send Payment To</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Bank Name</p>
                  <p className="text-lg font-black text-gray-800">{account.bank_name}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Account Title</p>
                  <p className="text-lg font-black text-gray-800">{account.account_title}</p>
                </div>
                <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
                  <p className="text-xs text-gray-400 mb-1">Account Number</p>
                  <p className="text-2xl font-black text-orange-600 tracking-widest">{account.account_number}</p>
                </div>
                <div className="bg-blue-50 rounded-2xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Amount to Send</p>
                  <p className="text-2xl font-black text-blue-600">Rs 1800</p>
                </div>
                {account.instructions && (
                  <p className="text-sm text-gray-500 text-center">{account.instructions}</p>
                )}
              </div>
            </div>

            {/* Screenshot Upload */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-700 text-center mb-4">Upload Payment Screenshot</h3>

              <label className="block cursor-pointer">
                <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition ${screenshotPreview ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-orange-400'}`}>
                  {screenshotPreview ? (
                    <img src={screenshotPreview} alt="screenshot" className="max-h-48 mx-auto rounded-xl object-contain" />
                  ) : (
                    <>
                      <div className="text-4xl mb-2">📸</div>
                      <p className="text-gray-500 text-sm">Tap to upload screenshot</p>
                    </>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handleScreenshot} className="hidden" />
              </label>

              {screenshotPreview && (
                <p className="text-center text-green-600 text-sm font-semibold mt-2">✅ Screenshot selected</p>
              )}

              {error && (
                <div className="mt-3 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl text-center">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="mt-4 w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 rounded-2xl text-base shadow-md hover:opacity-90 transition disabled:opacity-60"
              >
                {loading ? 'Submitting...' : 'Submit Payment'}
              </button>

              <button onClick={() => setStep('info')} className="mt-3 w-full text-gray-400 text-sm py-2">
                ← Go Back
              </button>
            </div>
          </div>
        )}

        {/* ── INFO STEP ── */}
        {step === 'info' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-center py-2 text-sm font-bold">
                ⭐ BEST PACKAGE ⭐
              </div>
              <div className="p-6 text-center">
                <p className="text-2xl font-black text-orange-500 mb-1">Corn Plan</p>
                <p className="text-gray-500 text-sm mb-2">One Time Payment</p>
                <p className="text-6xl font-black text-gray-800">Rs 1800</p>
                <p className="text-gray-400 text-sm mt-1">Lifetime access</p>
              </div>

              <div className="border-t border-gray-100 mx-6" />

              <div className="p-6 space-y-4">
                {features.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">{f.icon}</span>
                    </div>
                    <p className="text-gray-700 font-medium text-sm">{f.text}</p>
                  </div>
                ))}
              </div>

              <div className="px-6 pb-6">
                {error && (
                  <div className="mb-3 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl text-center">
                    {error}
                  </div>
                )}
                <button
                  onClick={handleBuyClick}
                  className="block w-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-center font-bold py-4 rounded-2xl text-base shadow-md hover:opacity-90 transition"
                >
                  Buy Now — Rs 1800
                </button>
              </div>
            </div>

            {/* How it works */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-700 text-center mb-4">How to Buy</h2>
              <div className="space-y-3">
                {[
                  'Click "Buy Now" to see our bank account details',
                  'Send Rs 1800 via JazzCash or EasyPaisa',
                  'Upload your payment screenshot',
                  'Account activated within 24 hours',
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</div>
                    <p className="text-gray-600 text-sm">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Package;
