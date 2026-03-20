import { useState, useEffect } from 'react';
import api from '../api/axios';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState('');
  const [promoCode, setPromoCode] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks/');
      setTasks(response.data);
    } catch (error) {
      if (error.response?.data?.error === 'package_required') {
        setMessage('🔒 Buy the Corn Plan to access tasks');
      } else {
        console.error(error);
      }
    }
  };

  const completeTask = async (taskId, verificationInput = '') => {
    try {
      const response = await api.post('/tasks/complete/', { task_id: taskId, verification_input: verificationInput });
      setMessage(`✅ Task Complete! You earned Rs ${(response.data.amount * 100).toFixed(0)}`);
      fetchTasks();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Task failed');
    }
  };

  const redeemPromo = async () => {
    try {
      const response = await api.post('/tasks/promo-code/', { code: promoCode });
      setMessage(`✅ Promo Code Success! You earned Rs ${(response.data.amount * 100).toFixed(0)}`);
      setPromoCode('');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Invalid promo code');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Simple Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🎯 TASKS</h1>
          <p className="text-lg text-gray-600">Complete Tasks • Earn Money</p>
        </div>

        {/* Success Message */}
        {message && (
          <div className="bg-green-100 border-2 border-green-400 text-green-800 px-6 py-4 rounded-2xl mb-6 text-center text-lg font-semibold shadow-lg">
            {message}
          </div>
        )}

        {/* Promo Code Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">🎫 Enter Promo Code</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Type promo code here"
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 text-lg"
            />
            <button
              onClick={redeemPromo}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition shadow-lg"
            >
              GET MONEY
            </button>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Task Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white text-center">
                <div className="text-4xl mb-2">💰</div>
                <h3 className="text-xl font-bold mb-1">{task.title}</h3>
                <p className="text-2xl font-black">Rs {(task.reward * 100).toFixed(0)}</p>
              </div>
              
              {/* Task Content */}
              <div className="p-6">
                <p className="text-gray-700 text-lg mb-4 text-center">{task.description}</p>
                
                <div className="text-center mb-4">
                  <span className="bg-gray-100 px-4 py-2 rounded-full text-gray-600 font-semibold">
                    ⏱️ {Math.floor(task.time_required / 60)} minutes
                  </span>
                </div>
                
                {/* Task Link */}
                {task.url && (
                  <a
                    href={task.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-blue-100 text-blue-600 py-3 rounded-xl text-center mb-4 hover:bg-blue-200 transition font-semibold text-lg"
                  >
                    🔗 OPEN TASK
                  </a>
                )}
                
                {/* Complete Button */}
                {task.is_completed ? (
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-600 py-4 rounded-xl font-bold text-lg cursor-not-allowed"
                  >
                    ✅ COMPLETED
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const verification = prompt('Enter verification code (if any):');
                      completeTask(task.id, verification || '');
                    }}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition shadow-lg"
                  >
                    ✅ COMPLETE TASK
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* No Tasks Message */}
        {tasks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">No Tasks Available</h3>
            <p className="text-lg text-gray-500">Check back later for new tasks!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
