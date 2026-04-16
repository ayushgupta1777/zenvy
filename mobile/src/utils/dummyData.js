// ============================================
// mobile/src/utils/dummyData.js
// DUMMY DATA for testing
// ============================================
export const DUMMY_PRODUCTS = [
  {
    _id: '1',
    title: 'Premium Cotton T-Shirt',
    description: 'High quality cotton t-shirt perfect for everyday wear',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'],
    price: 499,
    mrp: 999,
    discount: 50,
    stock: 100,
    averageRating: 4.5,
    reviewCount: 128,
    category: { name: 'Fashion', _id: 'cat1' },
    vendor: { storeName: 'Fashion Hub', _id: 'vendor1' }
  },
  {
    _id: '2',
    title: 'Wireless Bluetooth Earbuds',
    description: 'Premium sound quality with 24hr battery life',
    images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500'],
    price: 1999,
    mrp: 3999,
    discount: 50,
    stock: 50,
    averageRating: 4.3,
    reviewCount: 89,
    category: { name: 'Electronics', _id: 'cat2' },
    vendor: { storeName: 'Tech Store', _id: 'vendor1' }
  },
  {
    _id: '3',
    title: 'Sports Running Shoes',
    description: 'Comfortable running shoes for daily workouts',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
    price: 2499,
    mrp: 4999,
    discount: 50,
    stock: 75,
    averageRating: 4.7,
    reviewCount: 256,
    category: { name: 'Sports', _id: 'cat3' },
    vendor: { storeName: 'Sports World', _id: 'vendor2' }
  }
];

export const DUMMY_USER = {
  _id: 'user1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'customer',
  avatar: null
};

export const DUMMY_CART = {
  items: [
    {
      _id: 'cart1',
      product: DUMMY_PRODUCTS[0],
      quantity: 2,
      price: 499
    }
  ],
  totalItems: 2,
  totalPrice: 998
};