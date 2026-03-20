import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

const Settings = () => {
  const { user, fetchUser } = useContext(AuthContext);
  const [message, setMessage] = useState('');
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: ''
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await api.post('/auth/change-password/', passwordData);
      setMessage('✅ Password changed successfully!');
      setPasswordData({ old_password: '', new_password: '' });
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to change password');
    }
  };

  const sendVerificationEmail = async () => {
    setMessage('');
    try {
      const response = await api.post('/auth/send-verification/', { email: user.email });
      setMessage('✅ Verification email sent to your email!');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to send email');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Simple Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">⚙️ SETTINGS</h1>
          <p className="text-lg text-gray-600">Your Account • Profile Settings</p>
        </div>

        {/* Success Message */}
        {message && (
          <div className="bg-green-100 border-2 border-green-400 text-green-800 px-6 py-4 rounded-2xl mb-6 text-center text-lg font-semibold shadow-lg">
            {message}
          </div>
        )}

        {/* Profile Information */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">👤 YOUR PROFILE</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
              <span className="text-gray-600 font-semibold">Username:</span>
              <span className="font-bold text-lg">{user?.username}</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
              <span className="text-gray-600 font-semibold">Email:</span>
              <div className="text-right">
                <span className="font-bold text-lg">{user?.email}</span>
                {user?.is_email_verified ? (
                  <span className="block text-sm text-green-600">✅ Verified</span>
                ) : (
                  <span className="block text-sm text-red-600">❌ Not Verified</span>
                )}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
              <span className="text-gray-600 font-semibold">Level:</span>
              <span className="font-bold text-lg text-blue-600">Level {user?.level}</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
              <span className="text-gray-600 font-semibold">Points:</span>
              <span className="font-bold text-lg text-purple-600">{user?.points} points</span>
            </div>
          </div>
        </div>

        {/* Email Verification */}
        {!user?.is_email_verified && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">📧 VERIFY EMAIL</h2>
            <p className="text-center text-gray-600 mb-6 text-lg">
              Verify your email to earn Rs 25 bonus!
            </p>
            <button
              onClick={sendVerificationEmail}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition shadow-lg"
            >
              📧 SEND VERIFICATION EMAIL
            </button>
          </div>
        )}

        {/* Change Password */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🔒 CHANGE PASSWORD</h2>
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-3 text-lg font-semibold">Current Password</label>
              <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  value={passwordData.old_password}
                  onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                  placeholder="Enter your current password"
                  className="w-full px-4 py-4 pr-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 text-lg"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showOldPassword ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 mb-3 text-lg font-semibold">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  placeholder="Enter your new password"
                  className="w-full px-4 py-4 pr-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 text-lg"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showNewPassword ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition shadow-lg"
            >
              🔒 CHANGE PASSWORD
            </button>
          </form>
        </div>

        {/* Account Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">📊 ACCOUNT INFO</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-6 text-center">
              <div className="text-3xl mb-2">📅</div>
              <p className="text-gray-600 font-semibold mb-1">Member Since</p>
              <p className="text-xl font-bold text-blue-600">
                {new Date(user?.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-purple-50 rounded-xl p-6 text-center">
              <div className="text-3xl mb-2">🔗</div>
              <p className="text-gray-600 font-semibold mb-1">Referral Code</p>
              <p className="text-xl font-bold text-purple-600">{user?.referral_code}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
