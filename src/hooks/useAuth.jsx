import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthReady, getProfile } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(undefined); // undefined = loading
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const unsub = onAuthReady(async firebaseUser => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const p = await getProfile(firebaseUser.uid);
        setProfile(p);
      } else {
        setProfile(null);
      }
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
