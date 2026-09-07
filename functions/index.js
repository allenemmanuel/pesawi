const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { randomUUID } = require("crypto");

setGlobalOptions({ maxInstances: 10 });

let ready = false;
function ensureAdmin() {
  if (!ready) {
    initializeApp();
    ready = true;
  }
}

const COURTS = [
  { id: "desk-pingat", name: "Pingat", pin: process.env.SCORER_PIN || process.env.COURT_PIN_1 || "1001" },
  { id: "desk-futsal", name: "Futsal", pin: process.env.SCORER_PIN || process.env.COURT_PIN_1 || "1001" },
  { id: "desk-pentanque", name: "Pentanque", pin: process.env.SCORER_PIN || process.env.COURT_PIN_1 || "1001" },
  { id: "desk-karom", name: "Karom", pin: process.env.SCORER_PIN || process.env.COURT_PIN_1 || "1001" },
  { id: "desk-ping-pong", name: "Ping Pong", pin: process.env.SCORER_PIN || process.env.COURT_PIN_1 || "1001" },
  { id: "desk-pickleball", name: "Pickleball", pin: process.env.SCORER_PIN || process.env.COURT_PIN_1 || "1001" },
  { id: "desk-badminton", name: "Badminton", pin: process.env.SCORER_PIN || process.env.COURT_PIN_1 || "1001" },
  { id: "desk-sepak-takraw", name: "Sepak Takraw", pin: process.env.SCORER_PIN || process.env.COURT_PIN_1 || "1001" },
  { id: "desk-dart", name: "Dart", pin: process.env.SCORER_PIN || process.env.COURT_PIN_1 || "1001" },
  { id: "desk-bola-tampar", name: "Bola Tampar", pin: process.env.SCORER_PIN || process.env.COURT_PIN_1 || "1001" },
];

const DEFAULT_MEDALS = [
  { wilayahId: "kota-kinabalu", gold: 8, silver: 5, bronze: 4 },
  { wilayahId: "tawau", gold: 6, silver: 7, bronze: 5 },
  { wilayahId: "sandakan", gold: 5, silver: 4, bronze: 8 },
  { wilayahId: "lahad-datu", gold: 3, silver: 6, bronze: 4 },
  { wilayahId: "keningau", gold: 2, silver: 3, bronze: 6 },
];

async function seed(db) {
  const batch = db.batch();
  for (const court of COURTS) {
    batch.set(
      db.collection("courts").doc(court.id),
      { id: court.id, name: court.name },
      { merge: true },
    );
  }
  const medals = db.collection("meta").doc("medals");
  const snap = await medals.get();
  if (!snap.exists) {
    batch.set(medals, { rows: DEFAULT_MEDALS });
  }
  await batch.commit();
}

exports.loginCourt = onCall(async (request) => {
  ensureAdmin();
  const courtId = String(request.data?.courtId ?? "");
  const pin = String(request.data?.pin ?? "");
  const court = COURTS.find((item) => item.id === courtId);
  if (!court || court.pin !== pin) {
    throw new HttpsError("unauthenticated", "Wrong board or PIN.");
  }

  const db = getFirestore();
  const auth = getAuth();
  await seed(db);

  const sessionId = randomUUID();
  const uid = `court-${court.id}`;
  await db.collection("courts").doc(court.id).set(
    {
      id: court.id,
      name: court.name,
      sessionId,
      signedInAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  try {
    await auth.revokeRefreshTokens(uid);
  } catch {
    // first login for this court
  }

  let token;
  try {
    token = await auth.createCustomToken(uid, {
      courtId: court.id,
      sessionId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Auth token failed.";
    console.error("createCustomToken failed", message);
    throw new HttpsError(
      "failed-precondition",
      message.includes("signBlob")
        ? "Server is missing Service Account Token Creator permission. Wait a minute and try again."
        : "Could not create court session. Enable Authentication in Firebase Console.",
    );
  }

  return {
    token,
    court: { id: court.id, name: court.name },
  };
});
