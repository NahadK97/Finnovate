import { FileText, RefreshCw, X } from 'lucide-react';
import { useState } from 'react';

const TransactionModal = ({ txn, onClose }) => {
    if(!txn) return null;
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
           <div className="modal-header">
               <h2>Transaction Details</h2>
               <button className="close-btn" onClick={onClose}><X size={20}/></button>
           </div>

           <div className="detail-row"><span className="detail-label">ID:</span> <span className="detail-value">{txn.transaction_id}</span></div>
           <div className="detail-row"><span className="detail-label">Merchant:</span> <span className="detail-value">{txn.merchant_username}</span></div>
           <div className="detail-row"><span className="detail-label">Time:</span> <span className="detail-value">{new Date(txn.timestamp).toLocaleString()}</span></div>
           <div className="detail-row" style={{fontSize:'1.1rem', borderBottom:'none'}}>
               <span className="detail-label">Amount:</span> 
               <strong style={{color:'var(--theme-color)'}}>${txn.payload.Amount.toFixed(2)}</strong>
           </div>

           <div className={`risk-summary-box ${txn.risk_label}`}>
               <div className="detail-row" style={{border:0, padding:0}}><span className="detail-label">Risk Score:</span> <strong>{(txn.fraud_probability * 100).toFixed(2)}%</strong></div>
               <div className="detail-row" style={{border:0, padding:0}}><span className="detail-label">Status:</span> <span className={`status-label status-${txn.risk_label}`}>{txn.risk_label}</span></div>
               <p style={{fontSize:'0.9rem', marginTop:'10px', fontStyle:'italic', color:'var(--text-dark)'}}>"{txn.explanation}"</p>
           </div>

           <h4>Kaggle Vectors (V1-V28)</h4>
           <div className="v-grid-modal">
               {Array.from({length: 28}, (_, i) => i + 1).map(num => {
                   const key = `V${num}`;
                   const val = txn.payload[key] !== undefined && txn.payload[key] !== null && txn.payload[key] !== "" ? Number(txn.payload[key]).toFixed(4) : 'N/A';
                   return <div key={key} className="v-item"><strong>{key}</strong>{val}</div>
               })}
           </div>
        </div>
      </div>
    );
}

const TransactionList = ({ title, transactions, onRefresh, loading }) => {
  const [selectedTxn, setSelectedTxn] = useState(null);

  return (
    <div className="widget-container" style={{height:'auto'}}>
        <div className="widget-header">
            <h3>{title}</h3>
            <button onClick={onRefresh} className="refresh-btn" disabled={loading}>
                <RefreshCw size={16} className={loading ? 'spin-anim' : ''} style={{marginRight:'6px'}}/> Refresh
            </button>
        </div>
        
        <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Time</th>
              <th>Merchant</th>
              <th>Amount</th>
              <th>Score</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.transaction_id} onClick={() => setSelectedTxn(txn)}>
                <td style={{fontFamily:'monospace', fontWeight:600}}>{txn.transaction_id}</td>
                <td>{new Date(txn.timestamp).toLocaleTimeString()} <small style={{color:'var(--text-light)'}}>{new Date(txn.timestamp).toLocaleDateString()}</small></td>
                <td>{txn.merchant_username}</td>
                <td><strong>${txn.payload.Amount.toFixed(2)}</strong></td>
                <td>{(txn.fraud_probability * 100).toFixed(1)}%</td>
                <td><span className={`status-label status-${txn.risk_label}`}>{txn.risk_label}</span></td>
                <td><FileText size={18} color="var(--text-light)" /></td>
              </tr>
            ))}
            {transactions.length === 0 && <tr><td colSpan="7" style={{textAlign:'center', padding:'30px', color:'var(--text-light)'}}>No transactions found.</td></tr>}
          </tbody>
        </table>
        </div>
      <TransactionModal txn={selectedTxn} onClose={() => setSelectedTxn(null)} />
      <style>{` .spin-anim { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } } `}</style>
    </div>
  );
};

export default TransactionList;