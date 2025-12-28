import { ShieldCheck, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser, registerMerchant } from '../services/api';

// --- DATA: Quotes & Ads Pool ---
const CONTENT_POOL = [
    { text: "Trust is the currency of the new economy.", author: "Rachel Botsman", type: "quote" },
    { text: "Security is not a product, but a process.", author: "Bruce Schneier", type: "quote" },
    { text: "Fraud detection is the art of finding a needle in a haystack of needles.", author: "FinTech Daily", type: "quote" },
    { text: "Your customers expect speed. You demand security. We deliver both.", author: "KaggleGuard AI", type: "ad" },
    { text: "Stop financial loss before it happens with our Real-time Vector Analysis.", author: "KaggleGuard AI", type: "ad" },
    { text: "Processing over 1 million transactions daily with 99.9% accuracy.", author: "System Stats", type: "ad" },
];

// Shared layout
const AuthLayout = ({ children }) => {
  const [content, setContent] = useState(CONTENT_POOL[0]);

  // Select random content on mount
  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * CONTENT_POOL.length);
    setContent(CONTENT_POOL[randomIdx]);
  }, []);

  return (
    <div className="auth-split-screen">
      {/* Left Side - Visuals */}
      <div className="auth-visual-side">
          <div style={{fontSize:'2rem', fontWeight:800, marginBottom:'auto', display:'flex', alignItems:'center', gap:'10px'}}>
              <ShieldCheck size={32} color="#3b82f6"/> KaggleGuard AI
          </div>
          <div className="quote-box">
              <div className="quote-text">"{content.text}"</div>
              <div className="quote-author">
                  {content.type === 'ad' ? <TrendingUp size={16} style={{marginRight:8}}/> : null}
                  {content.author}
              </div>
          </div>
      </div>
      {/* Right Side - Form */}
      <div className="auth-form-side">
        <div className="auth-box-realistic">
          {children}
        </div>
      </div>
    </div>
  );
};

export const Login = () => {
  const [formData, setData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const isAdminRoute = location.pathname.includes('admin');
  const roleTarget = isAdminRoute ? 'admin' : 'merchant';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await loginUser(formData.username, formData.password, roleTarget);
      login(user);
      navigate(isAdminRoute ? '/admin/dashboard' : '/merchant/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-header">
        <h2>{isAdminRoute ? 'Admin Portal' : 'Welcome Back'}</h2>
        <p>{isAdminRoute ? 'System access only' : 'Sign in to your merchant dashboard.'}</p>
      </div>
      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        <div style={{marginBottom:'15px'}}>
            <label style={{display:'block', marginBottom:'8px', fontWeight:600, fontSize:'0.9rem'}}>Username</label>
            <input type="text" required value={formData.username} onChange={e=>setData({...formData, username:e.target.value})} />
        </div>
        <div style={{marginBottom:'25px'}}>
             <label style={{display:'block', marginBottom:'8px', fontWeight:600, fontSize:'0.9rem'}}>Password</label>
            <input type="password" required value={formData.password} onChange={e=>setData({...formData, password:e.target.value})} />
        </div>
        <button type="submit" className="btn-primary">Login</button>
        {!isAdminRoute && (
           <div className="auth-link">New here? <Link to="/signup">Create an account</Link></div>
        )}
      </form>
    </AuthLayout>
  );
};

export const Signup = () => {
    const [formData, setData] = useState({ username: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');

      if(formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          return;
      }

      try {
        const user = await registerMerchant(formData.username, formData.password);
        login(user);
        
        // --- REMOVED THE AUTOMATIC DUMMY TRANSACTION CODE FROM HERE ---
        
        navigate('/merchant/dashboard');
      } catch (err) {
        setError(err.message);
      }
    };
  
    return (
      <AuthLayout>
        <div className="auth-header">
            <h2>Get Started</h2>
            <p>Create your merchant account.</p>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
           <div style={{marginBottom:'15px'}}>
                <label style={{display:'block', marginBottom:'8px', fontWeight:600, fontSize:'0.9rem'}}>Username</label>
                <input type="text" required value={formData.username} onChange={e=>setData({...formData, username:e.target.value})} />
            </div>
            <div style={{marginBottom:'15px'}}>
                    <label style={{display:'block', marginBottom:'8px', fontWeight:600, fontSize:'0.9rem'}}>Password</label>
                <input type="password" required value={formData.password} onChange={e=>setData({...formData, password:e.target.value})} />
            </div>
            <div style={{marginBottom:'25px'}}>
                    <label style={{display:'block', marginBottom:'8px', fontWeight:600, fontSize:'0.9rem'}}>Confirm Password</label>
                <input type="password" required value={formData.confirmPassword} onChange={e=>setData({...formData, confirmPassword:e.target.value})} />
            </div>
          <button type="submit" className="btn-primary">Create Account</button>
          <div className="auth-link">Already have an account? <Link to="/login">Login</Link></div>
        </form>
      </AuthLayout>
    );
};