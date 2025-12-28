import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
      logout();
      navigate('/login');
  }

  return (
    <header className="app-header">
      <div className="header-brand">
        <span style={{fontSize:'1.5rem'}}>🛡️</span> KaggleGuard AI 
        {user?.role === 'admin' && <span style={{fontSize:'0.8rem', background:'#e2e8f0', padding:'2px 6px', borderRadius:'4px', marginLeft:'10px'}}>ADMIN</span>}
      </div>
      
      {user && (
      <div className="header-user">
        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
             <div className="user-avatar"><User size={18} /></div>
             <span>{user.username}</span>
        </div>
        <button onClick={handleLogout} style={{background:'none', border:'none', cursor:'pointer', color:'var(--text-light)', marginLeft:'15px', display:'flex', alignItems:'center'}}>
            <LogOut size={18} />
        </button>
      </div>
      )}
    </header>
  );
};

export default Header;