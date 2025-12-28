import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { username, role, token }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on load to see if user was previously logged in
    const storedUser = localStorage.getItem("fraudApp_currentUser");
    const storedToken = localStorage.getItem("fraudApp_authToken");

    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (e) {
        // Invalid stored data, clear it
        localStorage.removeItem("fraudApp_currentUser");
        localStorage.removeItem("fraudApp_authToken");
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("fraudApp_currentUser", JSON.stringify(userData));
    // Token is already stored in api.js loginUser function
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("fraudApp_currentUser");
    localStorage.removeItem("fraudApp_authToken");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
