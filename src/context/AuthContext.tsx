import {
  createContext,
  useContext,
  useState,
  useEffect,
  type PropsWithChildren,
} from "react";
import { authService } from "../firebase/firebaseConfig";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import type { User } from "../types";

function mapFirebaseUser(fb: FirebaseUser): User {
  return {
    uid: fb.uid,
    email: fb.email,
    displayName: fb.displayName,
    photoURL: fb.photoURL,
  };
}

type AuthContextType = {
  user: User | null;
  isAuthLoading: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authService, (currentUser) => {
      setUser(currentUser ? mapFirebaseUser(currentUser) : null);
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
