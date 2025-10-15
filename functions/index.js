const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.savePostProject = functions.https.onCall(async (data, context) => {
  const { project } = data;
  const uid = context.auth.uid;

  if (!uid) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const db = admin.firestore();
  await db.collection("users").doc(uid).collection("postProjects").doc(project.id).set(project);

  return { success: true };
});

exports.loadPostProject = functions.https.onCall(async (data, context) => {
  const { projectId } = data;
  const uid = context.auth.uid;

  if (!uid) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const db = admin.firestore();
  const doc = await db.collection("users").doc(uid).collection("postProjects").doc(projectId).get();

  if (!doc.exists) {
    throw new functions.https.HttpsError("not-found", "No such document!");
  }

  return doc.data();
});
