import { v4 as uuidv4 } from 'uuid';

// --- LOCAL STORAGE KEYS ---
const USERS_KEY = 'fraudApp_users';
const TRANSACTIONS_KEY = 'fraudApp_transactions';

// --- HELPER: DB ACCESS ---
const getDB = (key) => JSON.parse(localStorage.getItem(key)) || [];
const setDB = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// --- AUTHENTICATION SIMULATION ---
// (Keep registerMerchant and loginUser exactly as they were in the previous version)
export const registerMerchant = async (username, password) => {
  await new Promise(r => setTimeout(r, 500)); 
  const users = getDB(USERS_KEY);
  if (users.find(u => u.username === username)) throw new Error("Username already exists");
  const newUser = { id: uuidv4(), username, password, role: 'merchant' };
  users.push(newUser);
  setDB(USERS_KEY, users);
  return { id: newUser.id, username: newUser.username, role: newUser.role };
};

export const loginUser = async (username, password, requiredRole) => {
  await new Promise(r => setTimeout(r, 500));
  if (requiredRole === 'admin' && username === 'admin' && password === 'admin123') {
    return { id: 'admin-1', username: 'admin', role: 'admin' };
  }
  const users = getDB(USERS_KEY);
  const user = users.find(u => u.username === username && u.password === password && u.role === 'merchant');
  if (!user && requiredRole === 'merchant') throw new Error("Invalid credentials");
  if (!user && requiredRole === 'admin') throw new Error("Not an admin account");
  return { id: user.id, username: user.username, role: user.role };
};


// --- RISK API SIMULATION (POST) ---
export const analyzeRisk = async (transactionPayload, currentUser) => {
    // Simulating network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const transactionId = uuidv4().slice(0, 8).toUpperCase();
    const isHighAmount = transactionPayload.Amount > 5000;
    let probability = isHighAmount ? (Math.random() * 0.2 + 0.8) : (Math.random() * 0.15); 
    if(transactionPayload.Amount > 1000 && transactionPayload.Amount <= 5000) {
         probability = Math.random() * 0.4 + 0.1; 
    }
    
    let riskLabel = 'low';
    if (probability > 0.5) riskLabel = 'high';
    else if (probability >= 0.1) riskLabel = 'moderate';

    const result = {
      transaction_id: transactionId,
      fraud_probability: parseFloat(probability.toFixed(4)),
      risk_label: riskLabel,
      explanation: isHighAmount ? "Amount exceeds typical threshold." : "Transaction pattern is normal.",
      timestamp: new Date().toISOString()
    };

    const newRecord = {
        ...result,
        payload: transactionPayload,
        merchant_username: currentUser.username || 'demo_user'
    };

    const transactions = getDB(TRANSACTIONS_KEY);
    transactions.push(newRecord); // Add to end
    setDB(TRANSACTIONS_KEY, transactions);

    // REMOVED ALERT. The UI component will handle the toast notification.
    return result;
};

// --- GET APIs (Sorted Newest First) ---

// Admin: Get All
export const getAllTransactions = async () => {
    await new Promise(r => setTimeout(r, 500));
    const data = getDB(TRANSACTIONS_KEY);
    // Sort descending by timestamp
    return data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// Merchant: Get Only Theirs
export const getMerchantTransactions = async (username) => {
    await new Promise(r => setTimeout(r, 500));
    const allData = getDB(TRANSACTIONS_KEY);
    // Filter by username OR 'demo_user' for initial signups who haven't done txns yet
    const merchantData = allData.filter(txn => txn.merchant_username === username);
    // Sort descending by timestamp
    return merchantData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}