const TOKEN_KEY = 'kings_tire_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

/** Decode JWT payload and confirm it has not expired */
export const isLoggedIn = () => {
  const token = getToken();
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      clearToken();
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

// Backwards-compatible helpers
export const setLoggedIn = (token) => setToken(token);
export const clearLoggedIn = () => clearToken();
