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
import { store } from "../store";
import { setUser as setReduxUser, clearUser } from "../store/slices/authSlice";
import { supabase } from "../lib/supabaseClient";

function mapFirebaseUser(fb: FirebaseUser): User {
  // authService.currentUser always has the latest profile (post-updateProfile),
  // while the onAuthStateChanged snapshot can be stale on first registration.
  return {
    uid: fb.uid,
    email: fb.email,
    displayName: authService.currentUser?.displayName ?? fb.displayName,
    photoURL: fb.photoURL,
  };
}

type AuthContextType = {
  user: User | null;
  isAuthLoading: boolean;
  role: 'student' | 'psychologist' | null;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [role, setRole] = useState<'student' | 'psychologist' | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authService, async (firebaseUser) => {
      if (firebaseUser) {
        store.dispatch(
          setReduxUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
          }),
        );
        setUser(mapFirebaseUser(firebaseUser));

        // Fetch role from Supabase profiles table
        // maybeSingle() returns null (not 406) when no row exists yet
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('uid', firebaseUser.uid)
          .maybeSingle();
        setRole((data?.role as 'student' | 'psychologist') ?? 'student');
      } else {
        store.dispatch(clearUser());
        setUser(null);
        setRole(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthLoading, role }}>
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
