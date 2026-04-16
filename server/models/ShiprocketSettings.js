
import mongoose from 'mongoose';


// 9. SHIPROCKET SETTINGS MODEL
const shiprocketSettingsSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  token: String,
  tokenExpiresAt: Date,
  channelId: String,

  // Manual override: the warehouse/pickup name as it appears in Shiprocket dashboard
  // This is used directly in order creation - no API sync needed
  defaultPickupName: { type: String, default: '' },

  // Pickup Locations
  pickupLocations: [{
    id: String,
    name: String,
    phone: String,
    email: String,
    address: String,
    address_2: String,
    city: String,
    state: String,
    pincode: String,
    isDefault: Boolean
  }],

  // Auto-sync settings
  autoCreateShipment: { type: Boolean, default: true },
  autoFetchTracking: { type: Boolean, default: true },
  trackingUpdateInterval: { type: Number, default: 60 }, // minutes

  // Packaging defaults
  defaultWeight: { type: Number, default: 0.5 }, // kg
  defaultLength: { type: Number, default: 10 }, // cm
  defaultBreadth: { type: Number, default: 10 }, // cm
  defaultHeight: { type: Number, default: 10 }, // cm

  isActive: { type: Boolean, default: true }
}, { timestamps: true });




const ShiprocketSettings = mongoose.model('ShiprocketSettings', shiprocketSettingsSchema);

export default ShiprocketSettings;