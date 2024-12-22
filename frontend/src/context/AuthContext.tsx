import {
   createContext,
   ReactNode,
   useState,
   useCallback,
   useEffect,
} from 'react';

import { IAuthContextType } from './AuthContext.types';

export const AuthContext = createContext<IAuthContextType | undefined>(
   undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
   const [isAuthenticated, setIsAuthenticated] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const loginUser = useCallback(
      async (name: string, password: string, currentlyUser?: any) => {
         try {
            setError(null);
            if (currentlyUser) {
               if (
                  name === currentlyUser.name &&
                  password === currentlyUser.password
               ) {
                  console.log(true);
                  setIsAuthenticated(true);
               } else {
                  throw new Error('Invalid login username or password');
               }
            } else {
               return;
            }
         } catch (err) {
            setIsAuthenticated(false);
            console.log(false);
            setError((err as Error).message);
         }
      },
      []
   );

   useEffect(() => {
      const currentlyUser = JSON.parse(
         localStorage.getItem('user') as string
      );
      if (currentlyUser) {
         const { name, password } = currentlyUser;
         loginUser(name, password, currentlyUser);
      }
   }, [loginUser]);

   const logout = useCallback(() => {
      setIsAuthenticated(false);
   }, []);

   return (
      <AuthContext.Provider
         value={{ isAuthenticated, loginUser, logout, error }}
      >
         {children}
      </AuthContext.Provider>
   );
};
