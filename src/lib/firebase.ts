import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

const app = !getApps().length ? initializeApp(firebaseConfig as FirebaseOptions) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
