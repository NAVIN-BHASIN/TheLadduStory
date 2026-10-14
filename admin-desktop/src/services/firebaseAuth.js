/**
 * =========================================================================
 * THE LADDU STORY - GOOGLE FIREBASE PHONE AUTHENTICATION SERVICE
 * Free Tier: 10,000 carrier SMS OTPs per month with Google reCAPTCHA
 * Project: TheLadduStory (theladdustory-3dddd)
 * =========================================================================
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const STORAGE_KEY = 'tls_firebase_config';

export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCfSfpJlXikLAmsW03DtnbSnBSsk4luTD4",
  authDomain: "theladdustory-3dddd.firebaseapp.com",
  projectId: "theladdustory-3dddd",
  storageBucket: "theladdustory-3dddd.firebasestorage.app",
  messagingSenderId: "38476234221",
  appId: "1:38476234221:web:2b07a7df170fa3c17cfbe4",
  measurementId: "G-STT3S7D4LS"
};

const getStoredConfig = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.apiKey) return parsed;
    }
  } catch (e) {}
  return DEFAULT_FIREBASE_CONFIG;
};

let currentConfig = getStoredConfig();
let firebaseApp = null;
let firebaseAuth = null;

const initFirebase = () => {
  if (!currentConfig || !currentConfig.apiKey || !currentConfig.projectId) {
    return false;
  }
  try {
    firebaseApp = getApps().length === 0 ? initializeApp(currentConfig) : getApp();
    firebaseAuth = getAuth(firebaseApp);
    return true;
  } catch (err) {
    console.error('[Firebase] Init error:', err);
    return false;
  }
};

// Initial attempt
initFirebase();

export const isFirebaseConfigured = () => {
  return !!(currentConfig.apiKey && currentConfig.projectId && firebaseAuth);
};

export const getFirebaseConfig = () => currentConfig;

export const saveFirebaseConfig = (cfg) => {
  currentConfig = { ...currentConfig, ...cfg };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentConfig));
  } catch (e) {}
  return initFirebase();
};

/**
 * Initialize invisible reCAPTCHA on the given HTML element ID
 */
export const setupRecaptchaVerifier = (containerId = 'recaptcha-container') => {
  if (!firebaseAuth) {
    initFirebase();
  }
  if (!firebaseAuth) return null;

  try {
    // Ensure container exists in DOM
    let containerEl = document.getElementById(containerId);
    if (!containerEl) {
      containerEl = document.createElement('div');
      containerEl.id = containerId;
      document.body.appendChild(containerEl);
    }

    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {}
    }

    const verifier = new RecaptchaVerifier(firebaseAuth, containerId, {
      size: 'invisible',
      callback: () => {
        console.log('[Firebase] reCAPTCHA resolved successfully');
      },
      'expired-callback': () => {
        console.warn('[Firebase] reCAPTCHA expired, refreshing');
      }
    });

    window.recaptchaVerifier = verifier;
    return verifier;
  } catch (err) {
    console.error('[Firebase] reCAPTCHA setup error:', err);
    return null;
  }
};

/**
 * Dispatch Carrier SMS OTP via Google Firebase
 * @param {string} rawPhone 10-digit Indian mobile number
 * @param {RecaptchaVerifier} verifier
 */
export const sendFirebaseSmsOtp = async (rawPhone, verifier) => {
  const cleanPhone = (rawPhone || '').replace(/\D/g, '').slice(-10);
  const formattedE164 = `+91${cleanPhone}`;

  if (!isFirebaseConfigured()) {
    console.warn('[Firebase] Firebase not initialized. Falling back to sandbox demo.');
    const demoCode = Math.floor(100000 + Math.random() * 900000).toString();
    return {
      success: true,
      mode: 'DEMO',
      demoCode,
      message: `Carrier SMS simulated for +91 ${cleanPhone}.`
    };
  }

  try {
    let appVerifier = verifier || window.recaptchaVerifier;
    if (!appVerifier) {
      appVerifier = setupRecaptchaVerifier('recaptcha-container');
    }

    console.log(`[Firebase] Requesting carrier SMS OTP for ${formattedE164}...`);
    const confirmationResult = await signInWithPhoneNumber(firebaseAuth, formattedE164, appVerifier);
    console.log('[Firebase] SMS successfully sent by carrier to handset.');

    return {
      success: true,
      mode: 'LIVE',
      confirmationResult,
      message: `SMS OTP dispatched via Google Firebase to +91 ${cleanPhone}`
    };
  } catch (err) {
    console.error('[Firebase] sendFirebaseSmsOtp error:', err);

    // If reCAPTCHA or domain issue occurs during initial setup, provide clear message
    let friendlyMessage = err.message || 'Failed to dispatch SMS OTP.';
    if (friendlyMessage.includes('auth/unauthorized-domain')) {
      friendlyMessage = 'Domain not authorized in Firebase Console. Please add this domain under Firebase Authentication > Settings > Authorized Domains.';
    } else if (friendlyMessage.includes('auth/operation-not-allowed')) {
      friendlyMessage = 'Phone sign-in is disabled in Firebase. Please enable Phone Authentication in Firebase Console > Authentication > Sign-in method.';
    }

    return {
      success: false,
      error: friendlyMessage
    };
  }
};

/**
 * Verify OTP entered by customer against Firebase confirmation result
 */
export const verifyFirebaseSmsOtp = async (confirmationResult, enteredOtp) => {
  if (!confirmationResult || !confirmationResult.confirm) {
    throw new Error('Invalid or expired confirmation session.');
  }
  const result = await confirmationResult.confirm(enteredOtp);
  return result.user;
};
