import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
} from "firebase/firestore";
import { User as AppUser, EmergencyContact } from "../redux/types";
import { auth, db } from "./firebase";

// Sign in with email and password
export const signInUser = async (
  email: string,
  password: string,
): Promise<AppUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        uid: user.uid,
        name: userData.name || user.displayName || "User",
        email: user.email || "",
        phone: userData.phone || user.phoneNumber || "",
        emergencyContacts: userData.emergencyContacts || [],
        createdAt: userData.createdAt
          ? userData.createdAt.toDate
            ? userData.createdAt.toDate().toISOString()
            : userData.createdAt
          : new Date().toISOString(),
      };
    } else {
      // If user document doesn't exist, create a basic one
      const newUser: AppUser = {
        uid: user.uid,
        name: user.displayName || "User",
        email: user.email || "",
        phone: user.phoneNumber || "",
        emergencyContacts: [],
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", user.uid), {
        ...newUser,
        createdAt: new Date().toISOString(),
      });

      return newUser;
    }
  } catch (error: any) {
    throw new Error(error.message || "Failed to sign in");
  }
};

// Sign up with email and password
export const signUpUser = async (
  name: string,
  email: string,
  phone: string,
  password: string,
): Promise<AppUser> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
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

    await setDoc(doc(db, "users", user.uid), {
      ...newUser,
      createdAt: new Date().toISOString(),
    });

    return newUser;
  } catch (error: any) {
    throw new Error(error.message || "Failed to create account");
  }
};

// Sign out user
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    // Ensure local session artifacts are cleared
    await AsyncStorage.removeItem("authToken");
  } catch (error: any) {
    throw new Error(error.message || "Failed to sign out");
  }
};

// Update user profile
export const updateUserProfile = async (
  userData: AppUser,
): Promise<AppUser> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user is currently signed in");
    }

    // Update Firebase Auth profile
    await updateProfile(user, {
      displayName: userData.name,
    });

    // Update Firestore document
    await setDoc(
      doc(db, "users", user.uid),
      {
        ...userData,
        updatedAt: new Date(),
      },
      { merge: true },
    );

    return userData;
  } catch (error: any) {
    throw new Error(error.message || "Failed to update profile");
  }
};

// Add emergency contact
export const addEmergencyContact = async (
  userId: string,
  contact: EmergencyContact,
): Promise<void> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const emergencyContacts = userData.emergencyContacts || [];

      await setDoc(
        doc(db, "users", userId),
        {
          emergencyContacts: [...emergencyContacts, contact],
          updatedAt: new Date(),
        },
        { merge: true },
      );
    } else {
      throw new Error("User document not found");
    }
  } catch (error: any) {
    throw new Error(error.message || "Failed to add emergency contact");
  }
};

// Remove emergency contact
export const removeEmergencyContact = async (
  userId: string,
  contactIndex: number,
): Promise<void> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const emergencyContacts = userData.emergencyContacts || [];

      if (contactIndex >= 0 && contactIndex < emergencyContacts.length) {
        const updatedContacts = emergencyContacts.filter(
          (_: any, index: number) => index !== contactIndex,
        );

        await setDoc(
          doc(db, "users", userId),
          {
            emergencyContacts: updatedContacts,
            updatedAt: new Date(),
          },
          { merge: true },
        );
      } else {
        throw new Error("Invalid contact index");
      }
    } else {
      throw new Error("User document not found");
    }
  } catch (error: any) {
    throw new Error(error.message || "Failed to remove emergency contact");
  }
};

// Get user data by ID
export const getUserById = async (userId: string): Promise<AppUser | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        uid: userId,
        name: userData.name || "User",
        email: userData.email || "",
        phone: userData.phone || "",
        emergencyContacts: userData.emergencyContacts || [],
        createdAt: userData.createdAt
          ? userData.createdAt.toDate
            ? userData.createdAt.toDate().toISOString()
            : userData.createdAt
          : new Date().toISOString(),
      };
    }

    return null;
  } catch (error: any) {
    throw new Error(error.message || "Failed to get user data");
  }
};

// Update emergency contact
export const updateEmergencyContact = async (
  userId: string,
  contactIndex: number,
  contact: EmergencyContact,
): Promise<void> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const emergencyContacts = userData.emergencyContacts || [];

      if (contactIndex >= 0 && contactIndex < emergencyContacts.length) {
        const updatedContacts = emergencyContacts.map(
          (c: any, index: number) => (index === contactIndex ? contact : c),
        );

        await setDoc(
          doc(db, "users", userId),
          {
            emergencyContacts: updatedContacts,
            updatedAt: new Date(),
          },
          { merge: true },
        );
      } else {
        throw new Error("Invalid contact index");
      }
    } else {
      throw new Error("User document not found");
    }
  } catch (error: any) {
    throw new Error(error.message || "Failed to update emergency contact");
  }
};

// Check if user is admin
export const isAdminUser = (email: string): boolean => {
  return email === "admin@safetyapp.com";
};

// Get all users (Admin only)
export const getAllUsers = async (): Promise<AppUser[]> => {
  try {
    const q = query(collection(db, "users"));
    const querySnapshot = await getDocs(q);
    const users: AppUser[] = [];

    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        uid: doc.id,
        name: userData.name || "User",
        email: userData.email || "",
        phone: userData.phone || "",
        emergencyContacts: userData.emergencyContacts || [],
        createdAt: userData.createdAt
          ? userData.createdAt.toDate
            ? userData.createdAt.toDate().toISOString()
            : userData.createdAt
          : new Date().toISOString(),
      });
    });

    return users;
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch users");
  }
};

// Delete user (Admin only)
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "users", userId));
    // Note: This only deletes the Firestore document.
    // Authentication record deletion requires Firebase Admin SDK or Cloud Functions.
  } catch (error: any) {
    throw new Error(error.message || "Failed to delete user");
  }
};
// Update user password
export const changeUserPassword = async (
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error("No user is currently signed in");
    }

    // Reauthenticate user before updating password
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword,
    );
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);
  } catch (error: any) {
    throw new Error(error.message || "Failed to change password");
  }
};

// Send password reset email
export const forgotPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(error.message || "Failed to send reset email");
  }
};
