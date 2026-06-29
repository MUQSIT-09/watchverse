import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { getLibrary as getUserLibrary } from "../utils/libraryStorage.js"
import {
  syncUser,
} from "../services/api";
import {
  auth,
} from "../firebase/firebase";

import {
  onAuthStateChanged,
} from "firebase/auth";

const AuthContext =
  createContext();

export const AuthProvider =
({ children }) => {

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
  auth,
  async (currentUser) => {

    setUser(
      currentUser
    );

    if (currentUser) {

      try {

        await syncUser(
          currentUser
        );

        console.log(
          "User Synced"
        );

      } catch (error) {

        console.log(
          "Sync Error",
          error
        );

      }

    }

    setLoading(
      false
    );
  }
);

    return unsubscribe;

  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth =
  () =>
    useContext(
      AuthContext
    );