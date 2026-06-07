import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

function requireFirestore(userId) {
  if (!db) throw new Error('Firestore is not configured.');
  if (!userId) throw new Error('A Firebase user id is required.');
}

export async function saveWorkoutLogToFirestore(userId, log) {
  requireFirestore(userId);
  const logId = log.id || crypto.randomUUID();
  const logRef = doc(db, 'users', userId, 'workoutLogs', logId);
  const nextLog = { ...log, id: logId };
  await setDoc(logRef, nextLog, { merge: true });
  return nextLog;
}

export async function loadWorkoutLogsFromFirestore(userId) {
  requireFirestore(userId);
  const logsRef = collection(db, 'users', userId, 'workoutLogs');
  const logsQuery = query(logsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(logsQuery);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function deleteWorkoutLogFromFirestore(userId, logId) {
  requireFirestore(userId);
  const logRef = doc(db, 'users', userId, 'workoutLogs', logId);
  await deleteDoc(logRef);
}

export async function saveUserProfileToFirestore(userId, profile) {
  requireFirestore(userId);
  const profileRef = doc(db, 'users', userId, 'profile', 'settings');
  await setDoc(profileRef, profile, { merge: true });
  return profile;
}

export async function loadUserProfileFromFirestore(userId) {
  requireFirestore(userId);
  const profileRef = doc(db, 'users', userId, 'profile', 'settings');
  const snapshot = await getDoc(profileRef);
  return snapshot.exists() ? snapshot.data() : null;
}
