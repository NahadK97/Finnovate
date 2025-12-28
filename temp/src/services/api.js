import { v4 as uuidv4 } from "uuid";

// --- API CONFIGURATION ---
const API_BASE_URL = "http://127.0.0.1:8000";

// --- HELPER: Get auth token from localStorage ---
const getAuthToken = () => {
  return localStorage.getItem("fraudApp_authToken");
};

// --- HELPER: API request wrapper ---
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add auth token if available
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // For analyze-risk endpoint, add API key if needed
  if (endpoint.includes("analyze-risk")) {
    const apiKey = import.meta.env.VITE_API_KEY || "dev-api-key";
    if (apiKey) {
      headers["X-API-Key"] = apiKey;
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Check content type to handle different response types
    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      try {
        data = await response.json();
      } catch (jsonError) {
        // If JSON parsing fails, try to get text
        const text = await response.text();
        console.error("Failed to parse JSON response:", text);
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
      }
    } else {
      // If not JSON, get as text
      const text = await response.text();
      console.warn("Non-JSON response received:", text);
      // Try to parse as JSON anyway (some servers don't set content-type correctly)
      try {
        data = JSON.parse(text);
      } catch {
        // If it's not JSON, return as a message
        data = { message: text || "Success" };
      }
    }

    if (!response.ok) {
      throw new Error(
        data.error || data.message || `HTTP error! status: ${response.status}`
      );
    }

    return data;
  } catch (error) {
    if (error.message.includes("fetch")) {
      throw new Error("Network error: Could not connect to server");
    }
    throw error;
  }
};

// --- AUTHENTICATION ---

// Sign up a new merchant
export const registerMerchant = async (username, password) => {
  const response = await apiRequest("/api/signup", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  // Backend returns success response, we need to return user object
  // Since backend doesn't return user data on signup, we'll create a basic structure
  // The actual user data will come from login
  return { username, role: "merchant" };
};

// Login user (merchant or admin)
export const loginUser = async (username, password, requiredRole) => {
  const response = await apiRequest("/api/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  // Debug: Log the actual response to see what we're getting
  console.log("Login API response:", response);

  // Backend might return different formats, handle multiple possibilities
  // Format 1: {token, username}
  // Format 2: {message: "success", token, username}
  // Format 3: {user: {username}, token}
  // Format 4: Just a success message (use username from request)

  const token = response.token || response.access_token || response.auth_token;
  const responseUsername =
    response.username || response.user?.username || username;

  // If we have a token, use it. If not, check if it's just a success message
  // Some backends might return just {"message": "Login successful"} or similar
  if (response.message && !token) {
    // If we only have a message but no token, maybe token-based auth isn't used
    // or the backend uses session-based auth. For now, we'll use a placeholder
    // and rely on the username from the request
    const role = username === "admin" ? "admin" : "merchant";

    // Store a placeholder token or use username as identifier
    const placeholderToken = `token_${username}_${Date.now()}`;
    localStorage.setItem("fraudApp_authToken", placeholderToken);

    return {
      username: username,
      role: role,
      token: placeholderToken,
    };
  }

  if (token && responseUsername) {
    // Store token for future API calls
    localStorage.setItem("fraudApp_authToken", token);

    // Determine role - if username is 'admin', it's admin, otherwise merchant
    const role = username === "admin" ? "admin" : "merchant";

    return {
      username: responseUsername,
      role: role,
      token: token,
    };
  }

  // If we get here, the response structure is unexpected
  // Log it for debugging and throw a helpful error
  console.error(
    "Unexpected login response structure:",
    JSON.stringify(response, null, 2)
  );
  throw new Error(
    response.message ||
      response.error ||
      `Invalid response from server. Expected token and username, but received: ${JSON.stringify(
        response
      )}`
  );
};

// --- RISK ANALYSIS API ---
export const analyzeRisk = async (transactionPayload, currentUser) => {
  // Generate transaction ID (UUID)
  const transactionId = uuidv4();

  // Format date/time - backend expects it in the payload
  const dateTime = new Date().toISOString();

  // Prepare payload according to backend requirements:
  // transaction_id (uuid), username, date/time, amount, V1-V28 variables
  const payload = {
    transaction_id: transactionId,
    username: currentUser.username,
    "date/time": dateTime,
    Amount: transactionPayload.Amount,
    Time: transactionPayload.Time,
    ...Object.keys(transactionPayload)
      .filter((key) => key.startsWith("V") && key.length <= 3)
      .reduce((acc, key) => {
        acc[key] = transactionPayload[key];
        return acc;
      }, {}),
  };

  const response = await apiRequest("/api/analyze-risk", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  // Backend returns {fraud_probability, flagged}
  // Map to frontend expected format
  const fraudProbability = response.fraud_probability || 0;
  const riskLabel =
    fraudProbability > 0.5
      ? "high"
      : fraudProbability >= 0.1
      ? "moderate"
      : "low";

  return {
    transaction_id: transactionId.slice(0, 8).toUpperCase(),
    fraud_probability: fraudProbability,
    risk_label: riskLabel,
    explanation:
      fraudProbability > 0.5
        ? "Transaction flagged as high risk."
        : fraudProbability >= 0.1
        ? "Transaction shows moderate risk indicators."
        : "Transaction appears safe.",
    timestamp: dateTime,
  };
};

// --- GET TRANSACTIONS ---

// Admin: Get all transactions
export const getAllTransactions = async (limit = 100) => {
  try {
    const response = await apiRequest(
      `/api/get-all-transactions?limit=${limit}`,
      {
        method: "GET",
      }
    );

    // Debug: Log the actual response to see what we're getting
    console.log("getAllTransactions API response:", response);

    // Backend returns transaction list
    // Map backend format to frontend expected format
    let transactions = [];

    if (Array.isArray(response)) {
      transactions = response;
    } else if (response.transactions && Array.isArray(response.transactions)) {
      transactions = response.transactions;
    } else if (response.data && Array.isArray(response.data)) {
      transactions = response.data;
    } else {
      console.warn("Unexpected transaction response format:", response);
      // Try to extract transactions from response object
      transactions = Object.values(response).find(Array.isArray) || [];
    }

    if (transactions.length === 0) {
      console.log("No transactions found in response");
      return [];
    }

    console.log(`Found ${transactions.length} raw transactions, mapping...`);

    const mapped = transactions
      .map((txn, index) => {
        const result = mapTransactionToFrontendFormat(txn, index);
        if (result === null) {
          console.warn(`Transaction at index ${index} was filtered out:`, txn);
        }
        return result;
      })
      .filter((txn) => txn !== null) // Filter out any null mappings
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (mapped.length !== transactions.length) {
      console.warn(
        `Warning: ${
          transactions.length - mapped.length
        } transactions were filtered out during mapping`
      );
    }
    console.log(`Successfully loaded ${mapped.length} transactions`);
    return mapped;
  } catch (error) {
    console.error("Error fetching all transactions:", error);
    throw error;
  }
};

// Merchant: Get transactions by username
export const getMerchantTransactions = async (username) => {
  try {
    const response = await apiRequest(`/api/get-transactions/${username}`, {
      method: "GET",
    });

    // Debug: Log the actual response to see what we're getting
    console.log(
      `getMerchantTransactions API response for ${username}:`,
      response
    );

    // Backend returns transaction list for the user
    let transactions = [];

    if (Array.isArray(response)) {
      transactions = response;
    } else if (response.transactions && Array.isArray(response.transactions)) {
      transactions = response.transactions;
    } else if (response.data && Array.isArray(response.data)) {
      transactions = response.data;
    } else {
      console.warn("Unexpected transaction response format:", response);
      // Try to extract transactions from response object
      transactions = Object.values(response).find(Array.isArray) || [];
    }

    if (transactions.length === 0) {
      console.log(`No transactions found for user: ${username}`);
      return [];
    }

    console.log(
      `Found ${transactions.length} raw transactions for ${username}, mapping...`
    );

    const mapped = transactions
      .map((txn, index) => {
        const result = mapTransactionToFrontendFormat(txn, index);
        if (result === null) {
          console.warn(
            `Transaction at index ${index} was filtered out for ${username}:`,
            txn
          );
        }
        return result;
      })
      .filter((txn) => txn !== null) // Filter out any null mappings
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (mapped.length !== transactions.length) {
      console.warn(
        `Warning: ${
          transactions.length - mapped.length
        } transactions were filtered out during mapping for ${username}`
      );
    }
    console.log(
      `Successfully loaded ${mapped.length} transactions for ${username}`
    );
    return mapped;
  } catch (error) {
    console.error(`Error fetching transactions for ${username}:`, error);
    throw error;
  }
};

// --- HELPER: Map backend transaction format to frontend format ---
const mapTransactionToFrontendFormat = (txn, index) => {
  if (!txn || typeof txn !== "object") return null;

  // Log the first transaction for debugging
  if (index === 0) {
    console.log("Mapping sample:", JSON.stringify(txn, null, 2));
  }

  // 1. EXTRACT ID: It's nested inside txn.transaction
  const transactionId =
    txn.transaction?.transaction_id || txn.transaction?._id || `TXN-${index}`;

  // 2. FRAUD PROBABILITY: It's in txn.response
  let fraudProbability = 0;
  if (txn.response && txn.response.fraud_probability !== undefined) {
    fraudProbability = txn.response.fraud_probability;
  }

  // 3. RISK LABEL
  const riskLabel =
    fraudProbability > 0.5
      ? "high"
      : fraudProbability >= 0.1
      ? "moderate"
      : "low";

  // 4. TIMESTAMP: It's in txn.transaction["date/time"]
  const timestamp = txn.transaction?.["date/time"] || new Date().toISOString();

  // 5. MERCHANT USERNAME: It's in txn.transaction.username
  const merchantUsername = txn.transaction?.username || "unknown";

  // 6. PAYLOAD: Extract the numeric features and amount from txn.transaction
  let payload = {};
  if (txn.transaction) {
    payload = {
      Amount: txn.transaction.Amount || 0,
      Time: txn.transaction.Time || 0,
    };
    // Map V1-V28 from the nested transaction object
    for (let i = 1; i <= 28; i++) {
      const key = `V${i}`;
      if (txn.transaction[key] !== undefined) {
        payload[key] = txn.transaction[key];
      }
    }
  }

  return {
    transaction_id: transactionId.toString().slice(0, 8).toUpperCase(),
    fraud_probability: parseFloat(fraudProbability),
    risk_label: riskLabel,
    timestamp: timestamp,
    payload: payload,
    merchant_username: merchantUsername,
    explanation:
      fraudProbability > 0.5
        ? "Transaction flagged as high risk."
        : fraudProbability >= 0.1
        ? "Transaction shows moderate risk indicators."
        : "Transaction appears safe.",
  };
};
