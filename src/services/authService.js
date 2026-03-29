import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "./firebase.js";

const MIN_PASSWORD_LENGTH = 6;

export function validateEmail(email) {
  const trimmed = String(email).trim();
  if (!trimmed) return "Email is required.";
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  return ok ? null : "Enter a valid email address.";
}

export function validatePassword(password) {
  if (!password || String(password).length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
}

function mapAuthError(code) {
  switch (code) {
    case "auth/email-already-in-use":
      return "That email is already registered.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Incorrect email or password.";
    case "auth/user-not-found":
      return "No account found for this email.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";
    default:
      return "Something went wrong. Please try again.";
  }
}

async function ensureUserDoc(uid, email, displayName) {
  if (!db) return;
  try {
    const ref = doc(db, "users", uid);
    await setDoc(
      ref,
      {
        email,
        name: displayName ?? "",
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch {
    // Auth still succeeds; profile can be synced once Firestore rules are set.
  }
}

export async function signUp(email, password, displayName) {
  if (!isFirebaseConfigured() || !auth) {
    throw new Error(
      "Firebase is not configured. Copy .env.example to .env and add your Firebase keys."
    );
  }
  const cred = await createUserWithEmailAndPassword(
    auth,
    String(email).trim(),
    password
  );
  await ensureUserDoc(cred.user.uid, cred.user.email ?? "", displayName);
  return cred.user;
}

export async function signUpWithHandledErrors(email, password, displayName) {
  try {
    const user = await signUp(email, password, displayName);
    return { user, error: null };
  } catch (e) {
    if (e?.message?.includes("Firebase is not configured")) {
      return { user: null, error: e.message };
    }
    const code = e?.code ?? "";
    return { user: null, error: mapAuthError(code) };
  }
}

export async function signIn(email, password) {
  if (!isFirebaseConfigured() || !auth) {
    throw new Error(
      "Firebase is not configured. Copy .env.example to .env and add your Firebase keys."
    );
  }
  const cred = await signInWithEmailAndPassword(
    auth,
    String(email).trim(),
    password
  );
  return cred.user;
}

export async function signInWithHandledErrors(email, password) {
  try {
    const user = await signIn(email, password);
    return { user, error: null };
  } catch (e) {
    if (e?.message?.includes("Firebase is not configured")) {
      return { user: null, error: e.message };
    }
    const code = e?.code ?? "";
    return { user: null, error: mapAuthError(code) };
  }
}

export async function signOut() {
  if (!auth) return;
  await firebaseSignOut(auth);
}
