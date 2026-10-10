const config = { apiKey: "AIzaSyASeDklB5OFEoCC1dPfYkENl5ZUFGKJtJU", authDomain: "frontline-frenzy.firebaseapp.com", projectId: "frontline-frenzy", appId: "1:27705112941:web:41225f0c86a73601904264" };
export type FirebaseUser = { uid: string; displayName: string | null; photoURL: string | null };
export type FirebaseLeaderboardEntry = { id: string; name: string; score: number; games: number; wins: number };
let services: Promise<any> | null = null;
const FIREBASE_CDN = "https://www.gstatic.com/firebasejs/12.10.0";

function loadFirebaseModule(name: string): Promise<any> {
  // The CDN modules are deliberately runtime imports: this keeps the free
  // self-hosted Docker build independent of an npm Firebase dependency.
  return import(/* @vite-ignore */ `${FIREBASE_CDN}/${name}.js`);
}

async function getServices(): Promise<any> {
  services ??= Promise.all([
    loadFirebaseModule("firebase-app"),
    loadFirebaseModule("firebase-auth"),
    loadFirebaseModule("firebase-firestore"),
  ]).then(([app, auth, firestore]) => ({ auth, firestore, app: app.initializeApp(config) }));
  return services;
}
export async function firebaseGoogleSignIn(): Promise<FirebaseUser> {
  const { app, auth, firestore } = await getServices();
  const result = await auth.signInWithPopup(auth.getAuth(app), new auth.GoogleAuthProvider());
  const user = result.user as FirebaseUser;
  // A missing Firestore database/rule must not discard a successful Google
  // session. The account screen can still confirm sign-in while the owner
  // finishes the leaderboard database setup.
  try {
    await firestore.setDoc(firestore.doc(firestore.getFirestore(app), "leaderboard", user.uid), { name: user.displayName || "Commander", score: 0, games: 0, wins: 0 }, { merge: true });
  } catch (error) {
    console.warn("Firebase commander profile could not be saved", error);
  }
  return user;
}
export async function firebaseSignOut(): Promise<void> { const { app, auth } = await getServices(); await auth.signOut(auth.getAuth(app)); }
export async function firebaseLeaderboard(): Promise<FirebaseLeaderboardEntry[]> {
  const { app, firestore } = await getServices();
  const snapshot = await firestore.getDocs(firestore.query(firestore.collection(firestore.getFirestore(app), "leaderboard"), firestore.orderBy("score", "desc"), firestore.limit(50)));
  return snapshot.docs.map((row: any) => { const data = row.data(); return { id: row.id, name: String(data.name || "Commander"), score: Number(data.score || 0), games: Number(data.games || 0), wins: Number(data.wins || 0) }; });
}
