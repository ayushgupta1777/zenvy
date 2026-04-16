// ============================================
// backend/utils/pricing.js
// ============================================

/**
 * Calculate order pricing including all fees
 */
export const calculateOrderPricing = async (cartItems) => {
  const platformFeePercent = parseFloat(process.env.PLATFORM_FEE_PERCENT) || 5;
  
  // Fixed: explicitly hardcoded to 3% to prevent process.env.TAX_RATE from 
  // overriding this with an old 18% value on existing servers
  const taxRate = 3; 
  
  const freeShippingThreshold = parseFloat(process.env.FREE_SHIPPING_ABOVE) || 500;
  const defaultShippingCost = parseFloat(process.env.DEFAULT_SHIPPING_COST) || 50;

  // Calculate subtotal
  let subtotal = 0;
  let totalResellerCommission = 0;

  for (const item of cartItems) {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    // Add reseller commission if applicable
    if (item.reseller && item.resellerMargin) {
      totalResellerCommission += itemTotal * (item.resellerMargin / 100);
    }
  }

  // Calculate platform fee
  const platformFee = subtotal * (platformFeePercent / 100);

  // Calculate shipping
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : defaultShippingCost;

  // Calculate tax on subtotal + shipping
  const taxableAmount = subtotal + shippingCost;
  const tax = taxableAmount * (taxRate / 100);

  // Calculate total
  const total = subtotal + shippingCost + tax;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    platformFee: Math.round(platformFee * 100) / 100,
    resellerCommission: Math.round(totalResellerCommission * 100) / 100,
    shippingCost: Math.round(shippingCost * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    discount: 0,
    total: Math.round(total * 100) / 100
  };
};

/**
 * Calculate vendor settlement
 */
export const calculateVendorSettlement = (itemTotal, platformFeePercent, resellerCommission = 0) => {
  const platformFee = itemTotal * (platformFeePercent / 100);
  const settlement = itemTotal - platformFee - resellerCommission;
  return Math.round(settlement * 100) / 100;
};