import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  addEmergencyContact as addEmergencyContactService,
  getUserById,
  removeEmergencyContact as removeEmergencyContactService,
  signInUser as signInUserService,
  signOutUser as signOutUserService,
  signUpUser as signUpUserService,
  updateEmergencyContact as updateEmergencyContactService,
  updateUserProfile as updateUserProfileService,
} from '../../services/authService';
import { AuthState, EmergencyContact, User } from '../types';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const signInUser = createAsyncThunk(
  'auth/signInUser',
  async ({ email, password }: { email: string; password: string }) => {
    return await signInUserService(email, password);
  }
);

export const signUpUser = createAsyncThunk(
  'auth/signUpUser',
  async ({ email, password, name, phone }: {
    email: string;
    password: string;
    name: string;
    phone: string;
  }) => {
    return await signUpUserService(name, email, phone, password);
  }
);

export const signOutUser = createAsyncThunk(
  'auth/signOutUser',
  async () => {
    await signOutUserService();
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (userData: User) => {
    return await updateUserProfileService(userData);
  }
);

export const addEmergencyContact = createAsyncThunk(
  'auth/addEmergencyContact',
  async ({ userId, contact }: { userId: string; contact: EmergencyContact }) => {
    await addEmergencyContactService(userId, contact);
    // Fetch updated user data
    const updatedUser = await getUserById(userId);
    return updatedUser;
  }
);

export const updateEmergencyContact = createAsyncThunk(
  'auth/updateEmergencyContact',
  async ({ userId, contactIndex, contact }: {
    userId: string;
    contactIndex: number;
    contact: EmergencyContact
  }) => {
    await updateEmergencyContactService(userId, contactIndex, contact);
    // Fetch updated user data
    const updatedUser = await getUserById(userId);
    return updatedUser;
  }
);

export const removeEmergencyContact = createAsyncThunk(
  'auth/removeEmergencyContact',
  async ({ userId, contactIndex }: { userId: string; contactIndex: number }) => {
    await removeEmergencyContactService(userId, contactIndex);
    // Fetch updated user data
    const updatedUser = await getUserById(userId);
    return updatedUser;
  }
);

export const refreshUserData = createAsyncThunk(
  'auth/refreshUserData',
  async (userId: string) => {
    const userData = await getUserById(userId);
    return userData;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign In
      .addCase(signInUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signInUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Sign in failed';
      })
      // Sign Up
      .addCase(signUpUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Sign up failed';
      })
      // Sign Out
      .addCase(signOutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      // Update Profile
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        if (state.user) {
          state.user = { ...state.user, ...action.payload };
        }
      })
      // Add Emergency Contact
      .addCase(addEmergencyContact.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addEmergencyContact.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload;
        }
        state.error = null;
      })
      .addCase(addEmergencyContact.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to add emergency contact';
      })
      // Update Emergency Contact
      .addCase(updateEmergencyContact.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateEmergencyContact.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload;
        }
        state.error = null;
      })
      .addCase(updateEmergencyContact.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update emergency contact';
      })
      // Remove Emergency Contact
      .addCase(removeEmergencyContact.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeEmergencyContact.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload;
        }
        state.error = null;
      })
      .addCase(removeEmergencyContact.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to remove emergency contact';
      })
      // Refresh User Data
      .addCase(refreshUserData.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
        }
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
