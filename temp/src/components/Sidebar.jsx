import { LogOut, ShieldAlert, User } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ brandName, menuItems }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
      logout();
      navigate(user?.role === 'admin' ? '/admin/login' : '/login');
  }

  return (
      <aside className="sidebar">
         <div className="sidebar-brand">
            <ShieldAlert size={28} color="var(--theme-color)" />
            {brandName}
         </div>
         
         <nav className="sidebar-menu">
            {menuItems.map((item, index) => (
                <NavLink 
                    key={index} 
                    to={item.path} 
                    className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}
                >
                    {item.icon} {item.label}
                </NavLink>
            ))}
         </nav>

         {user && (
         <div className="sidebar-user">
             <div className="user-info">
                <div className="user-avatar"><User size={20} /></div>
                <span>{user.username}</span>
             </div>
            <button onClick={handleLogout} className="logout-btn" title="Logout">
                <LogOut size={20}/>
            </button>
         </div>
         )}
      </aside>
  );
};

export default Sidebar;