import { app } from "./firebase";
import {
  getMessaging,
  getToken,
  isSupported,
} from "firebase/messaging";

export const getFirebaseToken = async () => {
  const supported = await isSupported();

  if (!supported) {
    return null;
  }

  const messaging = getMessaging(app);

  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  });

  return token;
};