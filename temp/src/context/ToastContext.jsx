import { AlertCircle, CheckCircle, X } from 'lucide-react';
import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    // Auto-remove after 2 seconds (matches CSS animation)
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2000);
  }, []);

  const removeToast = (id) => {
      setToasts(prev => prev.filter(t => t.id !== id));
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className="toast-item" style={{borderLeftColor: toast.type === 'error' ? '#ef4444' : 'var(--theme-color)'}}>
             {toast.type === 'error' ? <AlertCircle size={20} color="#ef4444"/> : <CheckCircle size={20} color="var(--theme-color)"/>}
            <span style={{fontWeight:600, fontSize:'0.9rem'}}>{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} style={{background:'none', border:'none', cursor:'pointer', marginLeft:'auto', color:'#94a3b8'}}><X size={16}/></button>
            <div className="toast-progress" style={{backgroundColor: toast.type === 'error' ? '#ef4444' : 'var(--theme-color)'}}></div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);