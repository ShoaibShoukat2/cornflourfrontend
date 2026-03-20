import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsOpen(false);
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Corn Flour
            </span>
          </Link>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 hover:text-orange-600 focus:outline-none p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop menu */}
          {user ? (
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {user.is_staff ? (
                // Admin Menu
                <>
                  <Link to="/admin/dashboard" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition text-sm lg:text-base font-medium">
                    📊 Dashboard
                  </Link>
                  <Link to="/admin/users" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition text-sm lg:text-base font-medium">
                    👥 Users
                  </Link>
                  <Link to="/admin/withdrawals" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition text-sm lg:text-base font-medium">
                    💸 Withdrawals
                  </Link>
                  <Link to="/admin/packages" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition text-sm lg:text-base font-medium">
                    📦 Packages
                  </Link>
                  <div className="h-6 w-px bg-gray-300 mx-2"></div>
                  <div className="flex items-center space-x-2 px-3 py-2 bg-orange-50 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{user.username}</span>
                  </div>
                </>
              ) : (
                // User Menu
                <>
                  <Link to="/dashboard" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition text-sm lg:text-base font-medium">
                    🏠 Home
                  </Link>
                  <Link to="/tasks" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition text-sm lg:text-base font-medium">
                    🎯 Tasks
                  </Link>
                  <Link to="/referrals" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition text-sm lg:text-base font-medium">
                    👥 Referrals
                  </Link>
                  <Link to="/wallet" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition text-sm lg:text-base font-medium">
                    💰 Wallet
                  </Link>
                  <Link to="/package" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition text-sm lg:text-base font-medium">
                    📦 Package
                  </Link>
                  <Link to="/settings" className="px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition text-sm lg:text-base font-medium">
                    ⚙️ Settings
                  </Link>
                  <div className="h-6 w-px bg-gray-300 mx-2"></div>
                  <div className="flex items-center space-x-2 px-3 py-2 bg-orange-50 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{user.username}</span>
                  </div>
                </>
              )}
              <button 
                onClick={handleLogout} 
                className="ml-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition text-sm lg:text-base font-medium shadow-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-3">
              <Link to="/login" className="px-5 py-2 text-gray-700 hover:text-orange-600 font-medium transition">
                Login
              </Link>
              <Link to="/register" className="px-5 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition font-medium shadow-md">
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 mt-2 pt-4">
            {user ? (
              <div className="flex flex-col space-y-2">
                {/* User Info */}
                <div className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg mb-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{user.username}</p>
                    <p className="text-xs text-gray-600">{user.is_staff ? 'Admin' : 'User'}</p>
                  </div>
                </div>

                {user.is_staff ? (
                  // Admin Mobile Menu
                  <>
                    <Link to="/admin/dashboard" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg text-gray-700 hover:bg-orange-50 font-medium transition">
                      📊 Admin Dashboard
                    </Link>
                    <Link to="/admin/users" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg text-gray-700 hover:bg-orange-50 font-medium transition">
                      👥 Manage Users
                    </Link>
                    <Link to="/admin/withdrawals" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg text-gray-700 hover:bg-orange-50 font-medium transition">
                      💸 Manage Withdrawals
                    </Link>
                    <Link to="/admin/packages" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg text-gray-700 hover:bg-orange-50 font-medium transition">
                      📦 Manage Packages
                    </Link>
                  </>
                ) : (
                  // User Mobile Menu
                  <>
                    <Link to="/dashboard" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg text-gray-700 hover:bg-orange-50 font-medium transition">
                      🏠 Home
                    </Link>
                    <Link to="/tasks" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg text-gray-700 hover:bg-orange-50 font-medium transition">
                      🎯 Tasks
                    </Link>
                    <Link to="/referrals" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg text-gray-700 hover:bg-orange-50 font-medium transition">
                      👥 Referrals
                    </Link>
                    <Link to="/wallet" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg text-gray-700 hover:bg-orange-50 font-medium transition">
                      💰 Wallet
                    </Link>
                    <Link to="/package" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg text-gray-700 hover:bg-orange-50 font-medium transition">
                      📦 Package
                    </Link>
                    <Link to="/settings" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-lg text-gray-700 hover:bg-orange-50 font-medium transition">
                      ⚙️ Settings
                    </Link>
                  </>
                )}
                <button 
                  onClick={handleLogout} 
                  className="mt-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition font-medium shadow-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <Link to="/login" onClick={() => setIsOpen(false)} className="px-4 py-3 text-center text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition">
                  Login
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition font-medium text-center shadow-md">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
