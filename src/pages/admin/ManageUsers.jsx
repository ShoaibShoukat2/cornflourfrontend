import { useState, useEffect } from 'react';
import api from '../../api/axios';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users/');
      setUsers(response.data);
    } catch (error) {
      console.error(error);
      setMessage('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const blockUser = async (userId, username) => {
    const reason = prompt(`Block ${username}? Enter reason:`);
    if (!reason) return;
    
    try {
      await api.post(`/admin/block-user/${userId}/`, { reason });
      setMessage(`✅ User ${username} blocked successfully`);
      fetchUsers();
    } catch (error) {
      setMessage('Failed to block user');
    }
  };

  const unblockUser = async (userId, username) => {
    if (!confirm(`Unblock ${username}?`)) return;
    
    try {
      await api.post(`/admin/unblock-user/${userId}/`);
      setMessage(`✅ User ${username} unblocked successfully`);
      fetchUsers();
    } catch (error) {
      setMessage('Failed to unblock user');
    }
  };

  const addBonus = async (userId, username) => {
    const amount = prompt(`Add bonus to ${username}. Enter amount (₹):`);
    if (!amount || isNaN(amount)) return;
    
    const description = prompt('Enter bonus description (optional):') || 'Admin bonus';
    
    try {
      await api.post(`/admin/add-bonus/${userId}/`, { amount: parseFloat(amount), description });
      setMessage(`✅ Added ₹${amount} bonus to ${username}`);
      fetchUsers();
    } catch (error) {
      setMessage('Failed to add bonus');
    }
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-6 md:mb-8">Manage Users 👥</h1>

        {message && (
          <div className={`${message.includes('✅') ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'} border px-4 py-3 rounded mb-6`}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-xl p-4 md:p-6 shadow-md mb-6">
          <input
            type="text"
            placeholder="Search users by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600">Username</th>
                  <th className="px-4 py-3 text-left text-gray-600">Email</th>
                  <th className="px-4 py-3 text-left text-gray-600">Level</th>
                  <th className="px-4 py-3 text-left text-gray-600">Balance</th>
                  <th className="px-4 py-3 text-left text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold">{user.username}</td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">Level {user.level}</td>
                      <td className="px-4 py-3 text-green-600 font-bold">₹{(user.balance * 100).toFixed(0)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-sm ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {user.is_active ? 'Active' : 'Blocked'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {user.is_active ? (
                            <button
                              onClick={() => blockUser(user.id, user.username)}
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                            >
                              Block
                            </button>
                          ) : (
                            <button
                              onClick={() => unblockUser(user.id, user.username)}
                              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                            >
                              Unblock
                            </button>
                          )}
                          <button
                            onClick={() => addBonus(user.id, user.username)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                          >
                            Bonus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800">
            💡 <strong>Tip:</strong> For bulk operations and advanced features, use the Django admin panel at{' '}
            <a href="http://localhost:8000/admin" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
              http://localhost:8000/admin
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
