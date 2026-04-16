import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';



export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    console.log('📥 Fetching cart...');
    const response = await api.get('/cart');
    console.log('✅ Cart fetched:', response.data.data.cart);
    return response.data.data.cart;
  } catch (error) {
    console.error('❌ Fetch cart error:', error.response?.data);
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
  }
});
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity, resellPrice = 0 }, { rejectWithValue }) => {
    try {
      console.log('📤 Adding to cart:', { productId, quantity, resellPrice });
      
      const response = await api.post('/cart/items', {
        productId,
        quantity,
        resellPrice
      });

      console.log('✅ Added to cart:', response.data.data.cart);
      return response.data.data.cart;
      
    } catch (error) {
      console.error('❌ Add to cart error:', error.response?.data || error.message);
      
      // DON'T let the error crash the app
      const errorMessage = error.response?.data?.message || 'Failed to add to cart';
      
      // Still return something instead of rejecting
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity, resellPrice = 0 }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/cart/items/${itemId}`, { 
        quantity,
        resellPrice
      });
      return response.data.data.cart;
      
    } catch (error) {
      console.error('❌ Update cart error:', error);
      
      // Return current state instead of crashing
      return rejectWithValue(error.response?.data?.message || 'Update failed');
    }
  }
);
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/cart/items/${itemId}`);
      return response.data.data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clear',
  async (_, { rejectWithValue }) => {
    try {
      await api.delete('/cart/clear');
      return [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Add to extraReducers:
// builder.addCase(clearCart.fulfilled, (state) => {
//   state.items = [];
//   state.totalPrice = 0;
// });

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    isLoading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // FETCH CART
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items || [];
        state.totalItems = action.payload.totalItems || 0;
        state.totalPrice = action.payload.totalPrice || 0;
        console.log('📊 Cart state updated:', state.items);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ADD TO CART
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items || [];
        state.totalItems = action.payload.totalItems || 0;
        state.totalPrice = action.payload.totalPrice || 0;
        console.log('✅ ADDED! New cart state:', state);
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        console.error('❌ ADD ERROR:', action.payload);
      })

      // UPDATE CART ITEM
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.totalItems = action.payload.totalItems || 0;
        state.totalPrice = action.payload.totalPrice || 0;
      })

      // REMOVE FROM CART
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.totalItems = action.payload.totalItems || 0;
        state.totalPrice = action.payload.totalPrice || 0;
      });
  }
});

export const { clearError } = cartSlice.actions;
export default cartSlice.reducer;