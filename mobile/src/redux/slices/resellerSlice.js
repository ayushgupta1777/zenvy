import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

/**
 * Apply to become a reseller - AUTO-APPROVED instantly
 */
export const applyForReseller = createAsyncThunk(
  'reseller/apply',
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/reseller/apply', formData);
      
      // ✅ CRITICAL: Update auth state immediately so user doesn't need to logout
      if (response.data.success && response.data.data.user) {
        // Dispatch action to update user in auth slice
        dispatch({ 
          type: 'auth/updateUser', 
          payload: response.data.data.user 
        });
      }
      
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to apply as reseller');
    }
  }
);

/**
 * Generate share link for product with custom margin
 */
export const generateShareLink = createAsyncThunk(
  'reseller/generateShareLink',
  async ({ productId, margin }, { rejectWithValue }) => {
    try {
      const response = await api.post('/reseller/share-link', { productId, margin });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate share link');
    }
  }
);

/**
 * Get wallet balance and stats
 */
export const getWallet = createAsyncThunk(
  'reseller/getWallet',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/reseller/wallet');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

/**
 * Get reseller dashboard stats
 */
export const getResellerStats = createAsyncThunk(
  'reseller/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/reseller/stats');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

/**
 * Get transaction history with pagination
 */
export const getTransactions = createAsyncThunk(
  'reseller/getTransactions',
  async ({ page = 1, limit = 20, type = 'all' }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reseller/transactions?page=${page}&limit=${limit}&type=${type}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

/**
 * Get sales history
 */
export const getSales = createAsyncThunk(
  'reseller/getSales',
  async ({ page = 1, limit = 20, status = 'all' }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reseller/sales?page=${page}&limit=${limit}&status=${status}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

/**
 * Get withdrawal requests history
 */
export const getWithdrawals = createAsyncThunk(
  'reseller/getWithdrawals',
  async ({ page = 1, limit = 20, status = 'all' }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reseller/withdrawals?page=${page}&limit=${limit}&status=${status}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

/**
 * Request withdrawal
 */
export const requestWithdrawal = createAsyncThunk(
  'reseller/requestWithdrawal',
  async ({ amount, bankDetails }, { rejectWithValue }) => {
    try {
      const response = await api.post('/reseller/withdraw', { amount, bankDetails });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const resellerSlice = createSlice({
  name: 'reseller',
  initialState: {
    wallet: null,
    stats: null,
    transactions: {
      data: [],
      pagination: null,
      isLoading: false
    },
    sales: {
      data: [],
      pagination: null,
      isLoading: false
    },
    withdrawals: {
      data: [],
      pagination: null,
      isLoading: false
    },
    shareData: null,
    isLoading: false,
    error: null,
    successMessage: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
    clearShareData: (state) => {
      state.shareData = null;
    }
  },
  extraReducers: (builder) => {
    // Apply for Reseller
    builder
      .addCase(applyForReseller.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(applyForReseller.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wallet = action.payload.wallet;
        state.successMessage = 'You are now a reseller! Start earning 🎉';
        state.error = null;
      })
      .addCase(applyForReseller.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to submit application';
      })

    // Generate Share Link
      .addCase(generateShareLink.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateShareLink.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shareData = action.payload;
        state.error = null;
      })
      .addCase(generateShareLink.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

    // Get Wallet
      .addCase(getWallet.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getWallet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wallet = action.payload;
      })
      .addCase(getWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

    // Get Stats
      .addCase(getResellerStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getResellerStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(getResellerStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

    // Get Transactions
      .addCase(getTransactions.pending, (state) => {
        state.transactions.isLoading = true;
      })
      .addCase(getTransactions.fulfilled, (state, action) => {
        state.transactions.isLoading = false;
        state.transactions.data = action.payload.transactions;
        state.transactions.pagination = action.payload.pagination;
      })
      .addCase(getTransactions.rejected, (state, action) => {
        state.transactions.isLoading = false;
        state.error = action.payload;
      })

    // Get Sales
      .addCase(getSales.pending, (state) => {
        state.sales.isLoading = true;
      })
      .addCase(getSales.fulfilled, (state, action) => {
        state.sales.isLoading = false;
        state.sales.data = action.payload.orders;
        state.sales.pagination = action.payload.pagination;
      })
      .addCase(getSales.rejected, (state, action) => {
        state.sales.isLoading = false;
        state.error = action.payload;
      })

    // Get Withdrawals
      .addCase(getWithdrawals.pending, (state) => {
        state.withdrawals.isLoading = true;
      })
      .addCase(getWithdrawals.fulfilled, (state, action) => {
        state.withdrawals.isLoading = false;
        state.withdrawals.data = action.payload.withdrawals;
        state.withdrawals.pagination = action.payload.pagination;
      })
      .addCase(getWithdrawals.rejected, (state, action) => {
        state.withdrawals.isLoading = false;
        state.error = action.payload;
      })

    // Request Withdrawal
      .addCase(requestWithdrawal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestWithdrawal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wallet = action.payload.wallet;
        state.successMessage = 'Withdrawal request submitted successfully!';
      })
      .addCase(requestWithdrawal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearSuccess, clearShareData } = resellerSlice.actions;
export default resellerSlice.reducer;