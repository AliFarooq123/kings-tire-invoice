const KEY = 'kings_tire_auth';
export const isLoggedIn = () => localStorage.getItem(KEY) === 'true';
export const setLoggedIn = () => localStorage.setItem(KEY, 'true');
export const clearLoggedIn = () => localStorage.removeItem(KEY);