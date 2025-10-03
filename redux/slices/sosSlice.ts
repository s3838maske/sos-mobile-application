import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    fetchSOSEvents as fetchSOSEventsService,
    logSOSEvent as logSOSEventService,
    updateSOSEventStatus,
} from '../../services/sosService';
import { SOSEvent, SOSState } from '../types';

const initialState: SOSState = {
  events: [],
  isActive: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const logSOSEvent = createAsyncThunk(
  'sos/logSOSEvent',
  async (sosData: { location: any; message: string; timestamp: string; userId?: string }) => {
    await logSOSEventService(sosData);
    return { ...sosData, id: Date.now().toString() } as SOSEvent;
  }
);

export const fetchSOSEvents = createAsyncThunk(
  'sos/fetchSOSEvents',
  async (limitCount: number = 50) => {
    return await fetchSOSEventsService(limitCount);
  }
);

export const updateSOSStatus = createAsyncThunk(
  'sos/updateSOSStatus',
  async ({ eventId, status }: { eventId: string; status: 'active' | 'resolved' | 'false_alarm' }) => {
    await updateSOSEventStatus(eventId, status);
    return { eventId, status };
  }
);

const sosSlice = createSlice({
  name: 'sos',
  initialState,
  reducers: {
    setSOSActive: (state, action: PayloadAction<boolean>) => {
      state.isActive = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    addSOSEvent: (state, action: PayloadAction<SOSEvent>) => {
      state.events.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Log SOS Event
      .addCase(logSOSEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logSOSEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events.unshift(action.payload);
        state.isActive = true;
        state.error = null;
      })
      .addCase(logSOSEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to log SOS event';
      })
      // Fetch SOS Events
      .addCase(fetchSOSEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSOSEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = action.payload;
        state.error = null;
      })
      .addCase(fetchSOSEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch SOS events';
      })
      // Update SOS Status
      .addCase(updateSOSStatus.fulfilled, (state, action) => {
        const event = state.events.find(e => e.id === action.payload.eventId);
        if (event) {
          event.status = action.payload.status;
        }
        if (action.payload.status === 'resolved' || action.payload.status === 'false_alarm') {
          state.isActive = false;
        }
      });
  },
});

export const { setSOSActive, clearError, addSOSEvent } = sosSlice.actions;
export default sosSlice.reducer;
