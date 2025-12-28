import { useEffect, useState } from 'react';
import { getAllTransactions } from '../../services/api';
import TransactionList from '../TransactionList';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await getAllTransactions();
    setTransactions(data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div>
      <div className="page-header"><h1>Global Transaction History</h1></div>
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