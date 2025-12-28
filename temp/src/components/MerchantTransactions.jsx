import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMerchantTransactions } from '../services/api';
import TransactionList from './TransactionList';

const MerchantTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ total: 0, high: 0, moderate: 0, low: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMerchantTransactions(user.username);
      setTransactions(data);

      // Calculate Merchant's specific stats
      const counts = data.reduce((acc, curr) => {
        acc[curr.risk_label]++;
        return acc;
      }, { high: 0, moderate: 0, low: 0 });
      setStats({ total: data.length, ...counts });
    } catch (err) {
      console.error("Failed to load transactions:", err);
      setError(err.message || "Failed to load transactions");
      setTransactions([]);
      setStats({ total: 0, high: 0, moderate: 0, low: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if(user) loadData(); }, [user]);

  return (
    <div>
      <div className="page-header"><h1>My Transaction History</h1></div>
      
      {error && (
        <div className="error-message" style={{margin: '1rem 0', padding: '1rem', background: '#fee', border: '1px solid #fcc', borderRadius: '4px'}}>
          Error: {error}
        </div>
      )}

      {/* Merchant Stats */}
      <div className="stats-grid">
        <div className="stat-card"><h3>My Total</h3><div className="stat-value">{stats.total}</div></div>
        <div className="stat-card"><h3>Safe</h3><div className="stat-value" style={{color:'#10b981'}}>{stats.low}</div></div>
        <div className="stat-card"><h3>Warnings</h3><div className="stat-value" style={{color:'#f59e0b'}}>{stats.moderate}</div></div>
        <div className="stat-card"><h3>Blocked</h3><div className="stat-value" style={{color:'#ef4444'}}>{stats.high}</div></div>
      </div>

      <TransactionList 
        title="Recent Activity" 
        transactions={transactions} 
        onRefresh={loadData}
        loading={loading}
      />
    </div>
  );
};
export default MerchantTransactions;