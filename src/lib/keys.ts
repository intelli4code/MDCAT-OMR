import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type { AnswerKey, Answer, AnswerMap } from './types';

const getKeysCollectionRef = (userId: string) => {
  const appId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!appId) {
    console.error('Firebase Project ID is not configured.');
    throw new Error('Firebase Project ID is not configured.');
  }
  return collection(db, 'artifacts', appId, 'users', userId, 'answer_keys');
};

export const saveNewKey = async (
  userId: string,
  keyName: string,
  answers: AnswerMap
) => {
  const answersObject = Object.fromEntries(answers);
  const questionCount = answers.size > 0 ? Math.max(...Array.from(answers.keys())) : 0;

  const keysRef = getKeysCollectionRef(userId);
  await addDoc(keysRef, {
    keyName,
    questionCount,
    answers: answersObject,
    createdAt: serverTimestamp(),
  });
};

export const loadSavedKeys = async (userId: string): Promise<AnswerKey[]> => {
  try {
    const keysRef = getKeysCollectionRef(userId);
    const q = query(keysRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<AnswerKey, 'id'>),
    }));
  } catch (error) {
    console.error("Error loading saved keys:", error);
    // This can happen if the composite index is not created in Firestore.
    // As a fallback, fetch without ordering.
    const keysRef = getKeysCollectionRef(userId);
    const querySnapshot = await getDocs(keysRef);
    const keys = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<AnswerKey, 'id'> }));
    // Sort manually client-side
    return keys.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  }
};

export const deleteKey = async (userId: string, docId: string) => {
  const keysRef = getKeysCollectionRef(userId);
  await deleteDoc(doc(keysRef, docId));
};

export const importKeys = async (userId: string, keys: Omit<AnswerKey, 'id' | 'createdAt'>[]) => {
  const keysRef = getKeysCollectionRef(userId);
  const batch = writeBatch(db);

  keys.forEach((key) => {
    const docRef = doc(keysRef);
    batch.set(docRef, { ...key, createdAt: serverTimestamp() });
  });

  await batch.commit();
}
