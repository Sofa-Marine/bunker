// ============================================================
// FIREBASE — полная конфигурация
// Замени YOUR_* на данные из Firebase Console →
// Project Settings → General → Your apps → SDK snippet
// ============================================================

import { initializeApp } from 'firebase/app';
import {
  getDatabase, ref, set, get, onValue,
  push, update, remove, serverTimestamp, query, orderByChild, equalTo,
} from 'firebase/database';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  signInAnonymously,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey:            "AIzaSyASF-7SZmgXHDjgr9QqXdLnP1bM-Sd9Qvo",
  authDomain:        "dark-web-83b36.firebaseapp.com",
  databaseURL:       "https://dark-web-83b36-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         "dark-web-83b36",
  storageBucket:     "dark-web-83b36.firebasestorage.app",
  messagingSenderId: "285266327316",
  appId:             "1:285266327316:web:daf79d340f8688629ab401",
};

const app = initializeApp(firebaseConfig);
export const db   = getDatabase(app);
export const auth = getAuth(app);

// ═══════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════

export async function registerUser(email, password, username) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName: username });
  // Create user profile in DB
  await set(ref(db, `users/${user.uid}`), {
    uid:       user.uid,
    username:  username.toUpperCase(),
    email,
    createdAt: Date.now(),
    stats: { games: 0, wins: 0, survived: 0, eliminated: 0 },
    settings: { theme: 'default', fontSize: 16 },
    rank: 'НОВОБРАНЕЦ',
  });
  return user;
}

export async function loginUser(email, password) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

export async function logoutUser() {
  await signOut(auth);
}

export function onAuthReady(callback) {
  return onAuthStateChanged(auth, callback);
}

// Fallback anon sign-in
export async function signInAnon() {
  const { user } = await signInAnonymously(auth);
  return user.uid;
}

// ═══════════════════════════════════════════════════════════
// USER PROFILE
// ═══════════════════════════════════════════════════════════

export async function getProfile(uid) {
  const snap = await get(ref(db, `users/${uid}`));
  return snap.exists() ? snap.val() : null;
}

export function listenProfile(uid, callback) {
  return onValue(ref(db, `users/${uid}`), snap => callback(snap.val()));
}

export async function updateProfile_(uid, data) {
  await update(ref(db, `users/${uid}`), data);
}

export async function updateStats(uid, delta) {
  const profile = await getProfile(uid);
  const stats   = profile?.stats || {};
  await update(ref(db, `users/${uid}/stats`), {
    games:     (stats.games     || 0) + (delta.games     || 0),
    wins:      (stats.wins      || 0) + (delta.wins      || 0),
    survived:  (stats.survived  || 0) + (delta.survived  || 0),
    eliminated:(stats.eliminated|| 0) + (delta.eliminated|| 0),
  });
}

export async function saveSettings(uid, settings) {
  await update(ref(db, `users/${uid}/settings`), settings);
}

// ═══════════════════════════════════════════════════════════
// CARD PACKS
// ═══════════════════════════════════════════════════════════

export async function createPack(uid, packData) {
  const packRef = push(ref(db, `packs`));
  await set(packRef, {
    ...packData,
    authorUid:  uid,
    createdAt:  Date.now(),
    updatedAt:  Date.now(),
    public:     packData.public ?? true,
    plays:      0,
  });
  // Save reference in user's packs list
  await set(ref(db, `users/${uid}/packs/${packRef.key}`), true);
  return packRef.key;
}

export async function updatePack(packId, data) {
  await update(ref(db, `packs/${packId}`), { ...data, updatedAt: Date.now() });
}

export async function deletePack(uid, packId) {
  await remove(ref(db, `packs/${packId}`));
  await remove(ref(db, `users/${uid}/packs/${packId}`));
}

export async function getPack(packId) {
  const snap = await get(ref(db, `packs/${packId}`));
  return snap.exists() ? { id: packId, ...snap.val() } : null;
}

export function listenPublicPacks(callback) {
  return onValue(ref(db, 'packs'), snap => {
    const val = snap.val() || {};
    const packs = Object.entries(val)
      .map(([id, p]) => ({ id, ...p }))
      .filter(p => p.public)
      .sort((a, b) => b.createdAt - a.createdAt);
    callback(packs);
  });
}

export async function getUserPacks(uid) {
  const snap = await get(ref(db, `users/${uid}/packs`));
  if (!snap.exists()) return [];
  const ids = Object.keys(snap.val());
  const packs = await Promise.all(ids.map(id => getPack(id)));
  return packs.filter(Boolean);
}

export function listenUserPacks(uid, callback) {
  return onValue(ref(db, `packs`), snap => {
    const val = snap.val() || {};
    const packs = Object.entries(val)
      .map(([id, p]) => ({ id, ...p }))
      .filter(p => p.authorUid === uid)
      .sort((a, b) => b.createdAt - a.createdAt);
    callback(packs);
  });
}

// ═══════════════════════════════════════════════════════════
// ROOMS
// ═══════════════════════════════════════════════════════════

export async function createRoom(uid, roomData) {
  const code    = Math.random().toString(36).slice(2,8).toUpperCase();
  const roomRef = push(ref(db, 'rooms'));
  await set(roomRef, {
    ...roomData,
    hostUid:   uid,
    code,
    createdAt: Date.now(),
    status:    'waiting',
    round:     0,
    phase:     'waiting',
  });
  return { roomId: roomRef.key, code };
}

export async function getRoomByCode(code) {
  const snap = await get(ref(db, 'rooms'));
  if (!snap.exists()) return null;
  const all = snap.val();
  const entry = Object.entries(all).find(([, r]) => r.code === code.toUpperCase() && r.status === 'waiting');
  return entry ? { roomId: entry[0], ...entry[1] } : null;
}

export async function getRoom(roomId) {
  const snap = await get(ref(db, `rooms/${roomId}`));
  return snap.exists() ? snap.val() : null;
}

export function listenRoom(roomId, callback) {
  return onValue(ref(db, `rooms/${roomId}`), snap => callback(snap.val()));
}

export function listenPublicRooms(callback) {
  return onValue(ref(db, 'rooms'), snap => {
    const val = snap.val() || {};
    const rooms = Object.entries(val)
      .map(([id, r]) => ({ id, ...r }))
      .filter(r => r.status === 'waiting' && !r.password)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 20);
    callback(rooms);
  });
}

export async function updateRoom(roomId, data) {
  await update(ref(db, `rooms/${roomId}`), data);
}

export async function deleteRoom(roomId) {
  await remove(ref(db, `rooms/${roomId}`));
}

// ═══════════════════════════════════════════════════════════
// PLAYERS IN ROOM
// ═══════════════════════════════════════════════════════════

export async function joinRoom(roomId, playerData) {
  const uid = auth.currentUser?.uid || await signInAnon();
  await set(ref(db, `rooms/${roomId}/players/${uid}`), {
    ...playerData,
    uid,
    joinedAt:  Date.now(),
    ready:     false,
    eliminated:false,
  });
  return uid;
}

export async function leaveRoom(roomId, uid) {
  await remove(ref(db, `rooms/${roomId}/players/${uid}`));
}

export function listenPlayers(roomId, callback) {
  return onValue(ref(db, `rooms/${roomId}/players`), snap => {
    const val = snap.val() || {};
    callback(Object.entries(val).map(([uid, p]) => ({ uid, ...p })));
  });
}

export async function setPlayerReady(roomId, uid, cardLabel) {
  await update(ref(db, `rooms/${roomId}/players/${uid}`), {
    ready: true, revealedCard: cardLabel,
  });
}

// ═══════════════════════════════════════════════════════════
// CHAT
// ═══════════════════════════════════════════════════════════

export async function sendChatMessage(roomId, msg) {
  await push(ref(db, `rooms/${roomId}/chat`), {
    ...msg, timestamp: Date.now(),
  });
}

export function listenChat(roomId, callback) {
  return onValue(ref(db, `rooms/${roomId}/chat`), snap => {
    const val = snap.val() || {};
    callback(Object.values(val).sort((a, b) => a.timestamp - b.timestamp));
  });
}

// ═══════════════════════════════════════════════════════════
// VOTES
// ═══════════════════════════════════════════════════════════

export async function castVote(roomId, fromUid, toUid) {
  await set(ref(db, `rooms/${roomId}/votes/${fromUid}`), toUid);
}

export function listenVotes(roomId, callback) {
  return onValue(ref(db, `rooms/${roomId}/votes`), snap => callback(snap.val() || {}));
}

export async function clearVotes(roomId) {
  await remove(ref(db, `rooms/${roomId}/votes`));
}

// ═══════════════════════════════════════════════════════════
// GAME PHASE
// ═══════════════════════════════════════════════════════════

export async function advancePhase(roomId, newPhase, extraData = {}) {
  await update(ref(db, `rooms/${roomId}`), {
    phase: newPhase, ...extraData, updatedAt: Date.now(),
  });
}

// ═══════════════════════════════════════════════════════════
// ADMIN UTILS
// ═══════════════════════════════════════════════════════════

export async function isUserBanned(uid) {
  const snap = await get(ref(db, `users/${uid}/banned`));
  return snap.exists() && snap.val() === true;
}

export async function getGlobalStats() {
  const [usersSnap, packsSnap, roomsSnap] = await Promise.all([
    get(ref(db, 'users')),
    get(ref(db, 'packs')),
    get(ref(db, 'rooms')),
  ]);
  const users = usersSnap.val() || {};
  const packs = packsSnap.val() || {};
  const rooms = roomsSnap.val() || {};
  const activeRooms = Object.values(rooms).filter(r => r.status === 'waiting' || r.status === 'playing');
  const activePlayers = activeRooms.reduce((sum, r) => sum + Object.keys(r.players || {}).length, 0);
  return {
    totalUsers:    Object.keys(users).length,
    totalPacks:    Object.keys(packs).length,
    totalRooms:    Object.keys(rooms).length,
    activeRooms:   activeRooms.length,
    activePlayers,
    bannedUsers:   Object.values(users).filter(u => u.banned).length,
  };
}
