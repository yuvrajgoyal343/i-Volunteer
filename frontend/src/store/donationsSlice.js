import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const DONATIONS_STORAGE_KEY = 'ivolunteer_donations_v2';

function readStoredDonations() {
  const raw = localStorage.getItem(DONATIONS_STORAGE_KEY);
  if (!raw) return [];

  const donations = JSON.parse(raw);
  if (!Array.isArray(donations)) {
    throw new Error('Saved donation data is invalid.');
  }
  return donations;
}

function writeStoredDonations(donations) {
  localStorage.setItem(DONATIONS_STORAGE_KEY, JSON.stringify(donations));
}

export const loadDonations = createAsyncThunk(
  'donations/load',
  async (userId, { rejectWithValue }) => {
    try {
      return readStoredDonations().filter(donation => donation.userId === userId);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to load saved donations.');
    }
  }
);

export const createDonation = createAsyncThunk(
  'donations/create',
  async (donation, { rejectWithValue }) => {
    try {
      const donations = readStoredDonations();
      const date = new Date().toISOString().split('T')[0];
      const id = Date.now();
      const savedDonation = {
        ...donation,
        id,
        donationRef: `DON-${id}-${Math.floor(Math.random() * 1000)}`,
        status: 'requested',
        date,
        lastUpdated: date
      };

      donations.unshift(savedDonation);
      writeStoredDonations(donations);
      return savedDonation;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to save the donation.');
    }
  }
);

const donationsSlice = createSlice({
  name: 'donations',
  initialState: {
    items: [],
    userId: null,
    status: 'idle',
    error: null
  },
  reducers: {
    clearDonations(state) {
      state.items = [];
      state.userId = null;
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDonations.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadDonations.fulfilled, (state, action) => {
        state.items = action.payload;
        state.userId = action.meta.arg;
        state.status = 'succeeded';
      })
      .addCase(loadDonations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message || 'Failed to load saved donations.';
      })
      .addCase(createDonation.fulfilled, (state, action) => {
        if (state.userId === action.payload.userId) {
          state.items.unshift(action.payload);
        }
      })
      .addCase(createDonation.rejected, (state, action) => {
        state.error = action.payload || action.error.message || 'Failed to save the donation.';
      });
  }
});

export const { clearDonations } = donationsSlice.actions;
export default donationsSlice.reducer;
