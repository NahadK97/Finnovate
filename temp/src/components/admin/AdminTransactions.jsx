import { useEffect, useState } from 'react';
import { getAllTransactions } from '../../services/api';
import TransactionList from '../TransactionList';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllTransactions();
      setTransactions(data);
    } catch (err) {
      console.error("Failed to load transactions:", err);
      setError(err.message || "Failed to load transactions");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div>
      <div className="page-header"><h1>Global Transaction History</h1></div>
      {error && (
        <div className="error-message" style={{margin: '1rem 0', padding: '1rem', background: '#fee', border: '1px solid #fcc', borderRadius: '4px'}}>
          Error: {error}
        </div>
      )}
      <TransactionList 
        title="All Merchant Transactions" 
        transactions={transactions} 
        onRefresh={loadData}
        loading={loading}
      />
    </div>
  );
};
export default AdminTransactions;