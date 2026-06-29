import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA9EvYAhv689PEp6xlU56q3QVnJbSo97CY",
  authDomain: "watchverse-71ce8.firebaseapp.com",
  projectId: "watchverse-71ce8",
  storageBucket: "watchverse-71ce8.firebasestorage.app",
  messagingSenderId: "531611846859",
  appId: "1:531611846859:web:a43242ac6878065747b34e",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const signup = async (
  name,
  email,
  password
) => {

  const res =
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

  await updateProfile(
    res.user,
    {
      displayName: name,
    }
  );

  return res.user;
};

export const login = (
  email,
  password
) =>
  signInWithEmailAndPassword(
    auth,
    email,
    password
  );

export const logout = () =>
  signOut(auth);

const googleProvider =
  new GoogleAuthProvider();

export const googleLogin =
  () =>
    signInWithPopup(
      auth,
      googleProvider
    );