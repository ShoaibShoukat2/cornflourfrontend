// -- Users List -----------------------------------------------------------------
const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { setPage(1); }, [searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => { fetchUsers(); }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const search = searchTerm.trim();
      const url = `/admin/users/?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
      const res = await api.get(url);
      if (res.data.users) {
        setUsers(res.data.users);
        setTotalPages(res.data.total_pages || 1);
        setTotal(res.data.total || 0);
      } else {
        setUsers(Array.isArray(res.data) ? res.data : []);
        setTotalPages(1);
        setTotal(Array.isArray(res.data) ? res.data.length : 0);
      }
    } catch { setMessage('Failed to load users'); }
    finally { setLoading(false); }
  };

  if (selectedUserId) {
    return <UserDetail userId={selectedUserId} onBack={() => { setSelectedUserId(null); fetchUsers(); }} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Manage Users ??</h1>
        <span className="text-sm text-gray-400">{total} total</span>
      </div>

      {message && (
        <div className="px-4 py-3 rounded-xl text-sm font-semibold border bg-red-50 border-red-300 text-red-700">
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <input type="text" placeholder="?? Search by username or email..."
          value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="md:hidden divide-y divide-gray-100">
            {users.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No users found</p>
            ) : users.map(user => (
              <div key={user.id} className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-gray-50" onClick={() => setSelectedUserId(user.id)}>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{user.username}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  <p className="text-xs font-bold text-green-600 mt-0.5">Rs {(user.balance * 100).toFixed(0)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.is_active ? 'Active' : 'Blocked'}
                  </span>
                  <span className="text-gray-400">›</span>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Balance</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">No users found</td></tr>
                ) : users.map(user => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedUserId(user.id)}>
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
                      <button onClick={e => { e.stopPropagation(); setSelectedUserId(user.id); }}
                        className="bg-orange-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-orange-600 transition">
                        View Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed">
            ? Previous
          </button>
          <span className="text-sm text-gray-600 font-semibold">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed">
            Next ?
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;