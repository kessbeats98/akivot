'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.className = "text-dark antialiased min-h-screen bg-login font-sans pb-32";
    return () => {
      document.body.className = "text-dark antialiased min-h-screen bg-default font-sans pb-32";
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Better Auth login endpoint
      await api.post('/auth/sign-in/email', { email, password });
      
      // Fetch session to determine role
      const { data: user } = await api.get('/auth/session');
      
      if (user?.role === 'walker') {
        router.push('/walker');
      } else {
        router.push('/owner');
      }
    } catch (err) {
      setError('שגיאה בהתחברות. אנא בדוק את פרטי ההתחברות שלך.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col relative overflow-hidden text-white min-h-[calc(100vh-2.5rem)] -mt-10">
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute top-40 -left-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center relative z-10 pt-12 pb-8">
        <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl mb-8 rotate-3">
          <span className="material-symbols-rounded text-brand text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight mb-3">ברוכים הבאים לעקבות</h1>
        <p className="text-white/80 text-lg font-medium max-w-xs leading-relaxed">
          האפליקציה שתלווה את בונו בכל טיול. תמונות, מסלולים, ועדכונים חיים.
        </p>
      </div>

      <div className="bg-surface w-full rounded-t-super px-8 pt-10 pb-12 relative z-20 shadow-glass">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8"></div>
        <h2 className="text-xl font-bold text-dark text-center mb-6">התחברות</h2>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-medium">{error}</div>}
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-dark px-1">אימייל</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-gray-200 text-dark rounded-2xl py-4 px-4 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
              placeholder="name@example.com"
              required
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-dark px-1">סיסמה</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-gray-200 text-dark rounded-2xl py-4 px-4 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand text-white rounded-2xl py-4 px-6 font-bold shadow-glow-brand transition-transform active:scale-95 mt-4 flex justify-center items-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span className="material-symbols-rounded text-lg">login</span>
                <span>היכנס לחשבון</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
