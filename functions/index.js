/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {FieldValue} = require("firebase-admin/firestore");

admin.initializeApp();
exports.addUser = functions.https.onCall({cors: true}, (data, context) => {
  const {name} = data;

  const db = admin.firestore();

  return db
      .collection("users")
      .add({
        name,
        signupTimestamp: FieldValue.serverTimestamp(),
      })
      .then(() => {
        return {message: "successfully added user", success: true};
      })
      .catch((error) => {
        throw new functions.https.HttpsError("unknown", error.message, error);
      });
});
