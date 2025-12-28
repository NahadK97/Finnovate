import { Navigate, Outlet, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import './styles/main.css';

// Components
import { LayoutDashboard, List, PlusCircle } from 'lucide-react';
import { Login, Signup } from './components/AuthForms';
import MerchantDashboard from './components/MerchantDashboard';
import MerchantTransactions from './components/MerchantTransactions';
import Sidebar from './components/Sidebar';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminTransactions from './components/admin/AdminTransactions';

// --- SHARED SIDEBAR LAYOUT ---
const SidebarLayout = ({ brand, menuItems }) => (
  <div className="app-layout">
      <Sidebar brandName={brand} menuItems={menuItems} />
      <main className="main-content">
         <Outlet />
      </main>
  </div>
);

// Define menus
const adminMenu = [
    { label: 'Overview', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Global Transactions', path: '/admin/transactions', icon: <List size={20} /> },
];
const merchantMenu = [
    { label: 'New Transaction', path: '/merchant/dashboard', icon: <PlusCircle size={20} /> },
    { label: 'My History', path: '/merchant/transactions', icon: <List size={20} /> },
];

// --- ROUTE PROTECTION ---
const PrivateRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>; 
  if (!user) return <Navigate to={requiredRole === 'admin' ? '/admin/login' : '/login'} />;
  if (requiredRole && user.role !== requiredRole) {
      return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/merchant/dashboard'} />;
  }
  return children;
};


function App() {
  return (
    <AuthProvider>
      <ToastProvider> {/* Wrap with Toast Provider */}
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Protected Merchant Routes */}
          <Route element={<PrivateRoute requiredRole="merchant"><SidebarLayout brand="KaggleGuard" menuItems={merchantMenu}/></PrivateRoute>}>
             <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
             <Route path="/merchant/transactions" element={<MerchantTransactions />} />
             {/* Redirect base merchant path */}
             <Route path="/merchant" element={<Navigate to="/merchant/dashboard" />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<PrivateRoute requiredRole="admin"><SidebarLayout brand="Admin Panel" menuItems={adminMenu}/></PrivateRoute>}>
             <Route path="/admin/dashboard" element={<AdminDashboard />} />
             <Route path="/admin/transactions" element={<AdminTransactions />} />
             {/* Redirect base admin path */}
             <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;