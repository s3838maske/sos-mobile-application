import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User as AppUser, EmergencyContact } from '../redux/types';
import { auth, db } from './firebase';

// Sign in with email and password
export const signInUser = async (email: string, password: string): Promise<AppUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        uid: user.uid,
        name: userData.name || user.displayName || 'User',
        email: user.email || '',
        phone: userData.phone || user.phoneNumber || '',
        emergencyContacts: userData.emergencyContacts || [],
        createdAt: userData.createdAt ? 
          (userData.createdAt.toDate ? userData.createdAt.toDate().toISOString() : userData.createdAt) : 
          new Date().toISOString(),
      };
    } else {
      // If user document doesn't exist, create a basic one
      const newUser: AppUser = {
        uid: user.uid,
        name: user.displayName || 'User',
        email: user.email || '',
        phone: user.phoneNumber || '',
        emergencyContacts: [],
        createdAt: new Date().toISOString(),
      };
      
      await setDoc(doc(db, 'users', user.uid), {
        ...newUser,
        createdAt: new Date().toISOString(),
      });
      
      return newUser;
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign in');
  }
};

// Sign up with email and password
export const signUpUser = async (
  name: string,
  email: string,
  phone: string,
  password: string
): Promise<AppUser> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update the user's display name
    await updateProfile(user, {
      displayName: name,
    });
    
    // Create user document in Firestore
    const newUser: AppUser = {
      uid: user.uid,
      name,
      email,
      phone,
      emergencyContacts: [],
      createdAt: new Date().toISOString(),
    };
    
    await setDoc(doc(db, 'users', user.uid), {
      ...newUser,
      createdAt: new Date().toISOString(),
    });
    
    return newUser;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create account');
  }
};

// Sign out user
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign out');
  }
};

// Update user profile
export const updateUserProfile = async (userData: AppUser): Promise<AppUser> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }
    
    // Update Firebase Auth profile
    await updateProfile(user, {
      displayName: userData.name,
    });
    
    // Update Firestore document
    await setDoc(doc(db, 'users', user.uid), {
      ...userData,
      updatedAt: new Date(),
    }, { merge: true });
    
    return userData;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update profile');
  }
};

// Add emergency contact
export const addEmergencyContact = async (
  userId: string,
  contact: EmergencyContact
): Promise<void> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const emergencyContacts = userData.emergencyContacts || [];
      
      await setDoc(doc(db, 'users', userId), {
        emergencyContacts: [...emergencyContacts, contact],
        updatedAt: new Date(),
      }, { merge: true });
    } else {
      throw new Error('User document not found');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to add emergency contact');
  }
};

// Remove emergency contact
export const removeEmergencyContact = async (
  userId: string,
  contactIndex: number
): Promise<void> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const emergencyContacts = userData.emergencyContacts || [];
      
      if (contactIndex >= 0 && contactIndex < emergencyContacts.length) {
        const updatedContacts = emergencyContacts.filter((_: any, index: number) => index !== contactIndex);
        
        await setDoc(doc(db, 'users', userId), {
          emergencyContacts: updatedContacts,
          updatedAt: new Date(),
        }, { merge: true });
      } else {
        throw new Error('Invalid contact index');
      }
    } else {
      throw new Error('User document not found');
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to remove emergency contact');
  }
};

// Get user data by ID
export const getUserById = async (userId: string): Promise<AppUser | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        uid: userId,
        name: userData.name || 'User',
        email: userData.email || '',
        phone: userData.phone || '',
        emergencyContacts: userData.emergencyContacts || [],
        createdAt: userData.createdAt ? 
          (userData.createdAt.toDate ? userData.createdAt.toDate().toISOString() : userData.createdAt) : 
          new Date().toISOString(),
      };
    }
    
    return null;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get user data');
  }
};

// Check if user is admin
export const isAdminUser = (email: string): boolean => {
  return email === 'admin@safetyapp.com';
};
