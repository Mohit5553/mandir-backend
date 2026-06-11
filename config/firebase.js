const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let isFirebaseInitialized = false;

try {
  const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    isFirebaseInitialized = true;
    console.log('🔥 Firebase Admin initialized successfully.');
  } else {
    console.warn('⚠️ Firebase Admin skipped: firebase-service-account.json not found.');
  }
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error.message);
}

const sendPushNotification = async (title, body, tokens) => {
  if (!isFirebaseInitialized || !tokens || tokens.length === 0) return { successCount: 0, failureCount: 0 };
  
  try {
    const message = {
      notification: { title, body },
      tokens: tokens
    };
    const response = await admin.messaging().sendMulticast(message);
    console.log(`📡 Push notifications sent: ${response.successCount} successful, ${response.failureCount} failed.`);
    return response;
  } catch (error) {
    console.error('❌ Error sending push notification:', error);
    return { successCount: 0, failureCount: tokens.length };
  }
};

module.exports = { admin, isFirebaseInitialized, sendPushNotification };
