import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Very Simple */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-500 via-blue-500 to-purple-600">
        <div className="container mx-auto px-4 py-16 md:py-24 text-center text-white">
          {/* Big Money Icon */}
          <div className="text-8xl md:text-9xl mb-6">💰</div>
          
          {/* Simple Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6">
            Ghar Baithe Paise Kamao
          </h1>
          
          <p className="text-2xl md:text-3xl mb-8 font-bold">
            Kaam Karo • Paise Pao
          </p>
          
          {/* Big Start Button */}
          <Link
            to="/register"
            className="inline-block bg-yellow-400 text-gray-900 px-12 py-6 rounded-2xl text-2xl md:text-3xl font-black hover:bg-yellow-300 transition shadow-2xl mb-6"
          >
            🚀 Shuru Karo - FREE
          </Link>
          
          <p className="text-xl md:text-2xl font-bold">
            ✅ Koi Paisa Nahi Lagta
          </p>
        </div>
      </div>

      {/* How Much You Can Earn - Visual */}
      <div className="py-12 bg-yellow-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-gray-800 mb-8">
            Kitna Kamaoge? 💵
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="text-6xl mb-4">📅</div>
              <div className="text-4xl font-black text-green-600 mb-2">₹10</div>
              <div className="text-xl font-bold text-gray-700">Har Din</div>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="text-6xl mb-4">📆</div>
              <div className="text-4xl font-black text-blue-600 mb-2">₹300</div>
              <div className="text-xl font-bold text-gray-700">Har Mahina</div>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <div className="text-6xl mb-4">👥</div>
              <div className="text-4xl font-black text-purple-600 mb-2">₹500+</div>
              <div className="text-xl font-bold text-gray-700">Dost Bulao</div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works - Super Simple with Big Icons */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-black text-center text-gray-800 mb-12">
            Kaise Kaam Karta Hai? 🤔
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 shadow-2xl">
                <span className="text-7xl">1️⃣</span>
              </div>
              <div className="text-6xl mb-4">📱</div>
              <h3 className="text-2xl md:text-3xl font-black text-gray-800 mb-3">
                Mobile Kholo
              </h3>
              <p className="text-xl text-gray-600">
                Apna naam aur number dalo
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 shadow-2xl">
                <span className="text-7xl">2️⃣</span>
              </div>
              <div className="text-6xl mb-4">👆</div>
              <h3 className="text-2xl md:text-3xl font-black text-gray-800 mb-3">
                Kaam Karo
              </h3>
              <p className="text-xl text-gray-600">
                Video dekho, button dabao
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 shadow-2xl">
                <span className="text-7xl">3️⃣</span>
              </div>
              <div className="text-6xl mb-4">💸</div>
              <h3 className="text-2xl md:text-3xl font-black text-gray-800 mb-3">
                Paise Nikalo
              </h3>
              <p className="text-xl text-gray-600">
                Bank mein paise aayenge
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* What You Get - Big Icons Only */}
      <div className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-black text-center text-gray-800 mb-12">
            Kya Milega? 🎁
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl p-6 text-center shadow-lg">
              <div className="text-7xl mb-3">🎁</div>
              <p className="text-lg font-bold text-gray-800">₹10 FREE</p>
              <p className="text-sm text-gray-600">Shuru Mein</p>
            </div>
            
            <div className="bg-white rounded-3xl p-6 text-center shadow-lg">
              <div className="text-7xl mb-3">📺</div>
              <p className="text-lg font-bold text-gray-800">Video Dekho</p>
              <p className="text-sm text-gray-600">Paise Kamao</p>
            </div>
            
            <div className="bg-white rounded-3xl p-6 text-center shadow-lg">
              <div className="text-7xl mb-3">👥</div>
              <p className="text-lg font-bold text-gray-800">Dost Bulao</p>
              <p className="text-sm text-gray-600">Extra Paise</p>
            </div>
            
            <div className="bg-white rounded-3xl p-6 text-center shadow-lg">
              <div className="text-7xl mb-3">🏦</div>
              <p className="text-lg font-bold text-gray-800">Bank Mein</p>
              <p className="text-sm text-gray-600">Paise Aayenge</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods - Visual */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-gray-800 mb-8">
            Paise Kaise Milenge? 💳
          </h2>
          <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-6 w-40">
              <div className="text-5xl mb-2">🏦</div>
              <p className="font-bold text-gray-800">Bank</p>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-6 w-40">
              <div className="text-5xl mb-2">📱</div>
              <p className="font-bold text-gray-800">JazzCash</p>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-6 w-40">
              <div className="text-5xl mb-2">💳</div>
              <p className="font-bold text-gray-800">EasyPaisa</p>
            </div>
            <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl p-6 w-40">
              <div className="text-5xl mb-2">💰</div>
              <p className="font-bold text-gray-800">PayPal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Big CTA - Very Simple */}
      <div className="py-20 bg-gradient-to-br from-green-500 via-blue-500 to-purple-600">
        <div className="container mx-auto px-4 text-center text-white">
          <div className="text-8xl mb-6">👇</div>
          <h2 className="text-4xl md:text-6xl font-black mb-8">
            Abhi Shuru Karo!
          </h2>
          <Link
            to="/register"
            className="inline-block bg-yellow-400 text-gray-900 px-16 py-8 rounded-3xl text-3xl md:text-4xl font-black hover:bg-yellow-300 transition shadow-2xl"
          >
            ✅ FREE Mein Join Karo
          </Link>
          <p className="text-2xl md:text-3xl font-bold mt-8">
            10,000+ Log Kama Rahe Hain! 🎉
          </p>
        </div>
      </div>

      {/* Footer - Simple */}
      <div className="bg-gray-900 text-white py-6 text-center">
        <p className="text-lg">© 2026 Corn Flour</p>
      </div>
    </div>
  );
};

export default Home;
