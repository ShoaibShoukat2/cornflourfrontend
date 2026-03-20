import { useState, useEffect } from 'react';
import api from '../../api/axios';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [editUser, setEditUser] = useState(null); // user being edited
  const [editForm, setEditForm] = useState({ username: '', email: '', password: '', balance: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users/');
      setUsers(response.data);
    } catch (error) {
      setMessage('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (user) => {
    setEditUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      password: '',
      balance: (user.balance * 100).toFixed(0),
    });
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const payload = {
        username: editForm.username,
        email: editForm.email,
        balance: parseFloat(editForm.balance) / 100,
      };
      if (editForm.password) payload.password = editForm.password;

      await api.post(`/admin/edit-user/${editUser.id}/`, payload);
      setMessage(`✅ ${editForm.username} updated successfully`);
      setEditUser(null);
      fetchUsers();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const blockUser = async (userId, username) => {
    const reason = prompt(`Block ${username}? Enter reason:`);
    if (!reason) return;
    try {
      await api.post(`/admin/block-user/${userId}/`, { reason });
      setMessage(`✅ ${username} blocked`);
      fetchUsers();
    } catch { setMessage('Failed to block user'); }
  };

  const unblockUser = async (userId, username) => {
    if (!confirm(`Unblock ${username}?`)) return;
    try {
      await api.post(`/admin/unblock-user/${userId}/`);
      setMessage(`✅ ${username} unblocked`);
      fetchUsers();
    } catch { setMessage('Failed to unblock user'); }
  };

  const addBonus = async (userId, username) => {
    const amount = prompt(`Add bonus to ${username}. Enter amount (Rs):`);
    if (!amount || isNaN(amount)) return;
    const description = prompt('Bonus description (optional):') || 'Admin bonus';
    try {
      await api.post(`/admin/add-bonus/${userId}/`, { amount: parseFloat(amount) / 100, description });
      setMessage(`✅ Rs ${amount} bonus added to ${username}`);
      fetchUsers();
    } catch { setMessage('Failed to add bonus'); }
  };

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Manage Users 👥</h1>

        {message && (
          <div className={`px-4 py-3 rounded-lg mb-4 text-sm font-semibold border ${message.includes('✅') ? 'bg-green-50 border-green-300 text-green-700' : 'bg-red-50 border-red-300 text-red-700'}`}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <input
            type="text"
            placeholder="Search by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Balance</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">No users found</td></tr>
                ) : filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800 text-sm">{user.username}</p>
                      <p className="text-xs text-gray-400">Level {user.level}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600">Rs {(user.balance * 100).toFixed(0)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.is_active ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => openEdit(user)}
                          className="bg-orange-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-orange-600 transition"
                        >
                          Edit
                        </button>
                        {user.is_active ? (
                          <button onClick={() => blockUser(user.id, user.username)}
                            className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-600 transition">
                            Block
                          </button>
                        ) : (
                          <button onClick={() => unblockUser(user.id, user.username)}
                            className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-green-600 transition">
                            Unblock
                          </button>
                        )}
                        <button onClick={() => addBonus(user.id, user.username)}
                          className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-blue-600 transition">
                          Bonus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 rounded-t-2xl">
              <h2 className="text-white font-bold text-lg">Edit User — {editUser.username}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block font-semibold">Username</label>
                <input
                  value={editForm.username}
                  onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block font-semibold">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block font-semibold">New Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span></label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block font-semibold">Main Balance (Rs)</label>
                <input
                  type="number"
                  value={editForm.balance}
                  onChange={e => setEditForm({ ...editForm, balance: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditUser(null)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
