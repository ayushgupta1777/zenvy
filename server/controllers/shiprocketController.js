// ============================================
// backend/controllers/shiprocketController.js
// Shiprocket Management Controller
// ============================================
import ShiprocketSettings from '../models/ShiprocketSettings.js';
import Order from '../models/Order.js';
import shiprocketService from '../services/shiprocketService.js';
import { AppError } from '../middleware/errorHandler.js';
import axios from 'axios';

/**
 * @desc    Proxy PDF download explicitly for Android devices
 * @route   GET /api/shiprocket/proxy-pdf?url=...
 * @access  Private (Admin/Vendor)
 */
export const proxyPdfDownload = async (req, res, next) => {
  try {
    const { url } = req.query;
    if (!url) return next(new AppError('URL required', 400));
    
    const decodedUrl = decodeURIComponent(url);
    
    // SSRF Protection: Ensure url points to Shiprocket or known safe cloud storage
    const isSafeDomain = decodedUrl.includes('shiprocket') || 
                         decodedUrl.includes('amazonaws.com') ||
                         decodedUrl.includes('storage.googleapis.com');
                         
    if (!isSafeDomain) {
      console.error(`[SSRF Blocked] Unauthorized proxy destination requested: ${decodedUrl}`);
      return next(new AppError(`Unauthorized proxy destination`, 403));
    }
    
    const response = await axios({
      url: decodedUrl,
      method: 'GET',
      responseType: 'stream'
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Order_Document_${Date.now()}.pdf"`);
    
    response.data.pipe(res);
  } catch (error) {
    console.error('Proxy PDF error:', error.message);
    next(new AppError('Failed to fetch PDF document. The link might be expired.', 500));
  }
};

/**
 * @desc    Get Shiprocket settings
 * @route   GET /api/shiprocket/settings
 * @access  Private (Admin/Vendor)
 */
export const getSettings = async (req, res, next) => {
  try {
    let settings = await ShiprocketSettings.findOne({ isActive: true });

    if (!settings) {
      return res.json({
        success: true,
        data: {
          settings: {
            email: '',
            isActive: false,
            pickupLocations: [],
            autoCreateShipment: true,
            autoFetchTracking: true
          }
        }
      });
    }

    // Don't send password to frontend
    const settingsObj = settings.toObject();
    delete settingsObj.password;

    res.json({
      success: true,
      data: { settings: settingsObj }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Shiprocket settings
 * @route   PUT /api/shiprocket/settings
 * @access  Private (Admin)
 */
export const updateSettings = async (req, res, next) => {
  try {
    const {
      email,
      password,
      channelId,
      defaultPickupName,
      autoCreateShipment,
      autoFetchTracking,
      trackingUpdateInterval,
      defaultWeight,
      defaultLength,
      defaultBreadth,
      defaultHeight
    } = req.body;

    // --- Settings Unification Logic ---
    // Ensure only one active settings document exists to prevent configuration conflicts
    let settings = await ShiprocketSettings.findOne({ isActive: true });

    if (!settings) {
      // Deactivate any rogue settings documents that might exist
      await ShiprocketSettings.updateMany({}, { isActive: false });

      settings = new ShiprocketSettings({
        email: (email || '').trim(),
        password: (password || '').trim(),
        isActive: true
      });
    } else {
      // Deactivate any OTHER documents just to be safe (Clean up duplicates)
      await ShiprocketSettings.updateMany({ _id: { $ne: settings._id } }, { isActive: false });

      if (email) settings.email = email.trim();
      if (password) settings.password = password.trim();
    }

    // --- Credential Validation logic ---
    if (email || password) {
      try {
        console.log(`[Shiprocket] Starting credential validation for: ${settings.email}`);
        const testToken = await shiprocketService.getTokenWithCredentials(
          settings.email,
          settings.password
        );

        if (!testToken) {
          throw new Error('Shiprocket API did not return an authentication token.');
        }

        // Success! Reset any cached token to ensure next request uses new credentials
        shiprocketService.token = null;
        shiprocketService.tokenExpiresAt = null;
        settings.token = testToken;
        settings.tokenExpiresAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);

      } catch (authError) {
        console.error(`[Shiprocket] Validation failed for ${settings.email}:`, authError.message);

        let advice = "Please double-check your email and password.";
        if (authError.message.toLowerCase().includes('401') || authError.message.toLowerCase().includes('forbidden')) {
          advice = "Invalid credentials. If you are certain they are correct, please ensure Two-Factor Authentication (2FA) is turned OFF on your Shiprocket account.";
        }

        return next(new AppError(
          `Shiprocket authentication failed: ${authError.message}. ${advice}`,
          400
        ));
      }
    }
    // ------------------------------------

    if (channelId) settings.channelId = channelId.trim();
    if (defaultPickupName !== undefined) settings.defaultPickupName = defaultPickupName.trim();
    if (autoCreateShipment !== undefined) settings.autoCreateShipment = autoCreateShipment;
    if (autoFetchTracking !== undefined) settings.autoFetchTracking = autoFetchTracking;
    if (trackingUpdateInterval) settings.trackingUpdateInterval = trackingUpdateInterval;
    if (defaultWeight) settings.defaultWeight = defaultWeight;
    if (defaultLength) settings.defaultLength = defaultLength;
    if (defaultBreadth) settings.defaultBreadth = defaultBreadth;
    if (defaultHeight) settings.defaultHeight = defaultHeight;

    await settings.save();

    // Don't send password back
    const settingsObj = settings.toObject();
    delete settingsObj.password;

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: { settings: settingsObj }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Test Shiprocket connection
 * @route   POST /api/shiprocket/test-connection
 * @access  Private (Admin)
 */
export const testConnection = async (req, res, next) => {
  try {
    const token = await shiprocketService.getToken();

    if (token) {
      res.json({
        success: true,
        message: 'Successfully connected to Shiprocket'
      });
    } else {
      throw new AppError('Failed to connect to Shiprocket', 500);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get pickup locations
 * @route   GET /api/shiprocket/pickup-locations
 * @access  Private (Admin)
 */
export const getPickupLocations = async (req, res, next) => {
  try {
    const locations = await shiprocketService.getPickupLocations();

    // Save locations to settings
    const settings = await ShiprocketSettings.findOne({ isActive: true });
    if (settings) {
      const existingDefaultId = settings.pickupLocations.find(l => l.isDefault)?.id;

      settings.pickupLocations = locations.map((loc, index) => ({
        id: loc.id,
        name: loc.pickup_location,
        phone: loc.phone,
        email: loc.email,
        address: loc.address,
        city: loc.city,
        state: loc.state,
        pincode: loc.pin_code,
        // Preserve existing default or set first one as default if none exists
        isDefault: existingDefaultId ? (loc.id === existingDefaultId) : (index === 0)
      }));
      await settings.save();
    }

    res.json({
      success: true,
      data: { locations }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create shipment for order
 * @route   POST /api/shiprocket/shipment/:orderId
 * @access  Private (Admin/Vendor)
 */
export const createShipment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('user')
      .populate('items.product');

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (order.shiprocket && order.shiprocket.shipmentId) {
      return next(new AppError('Shipment already created for this order', 400));
    }

    // Auto-sync pickup locations if empty
    const settings = await ShiprocketSettings.findOne({ isActive: true });
    if (settings && (!settings.pickupLocations || settings.pickupLocations.length === 0)) {
      try {
        const locations = await shiprocketService.getPickupLocations();
        if (locations && locations.length > 0) {
          settings.pickupLocations = locations.map((loc, index) => ({
            id: loc.id,
            name: loc.pickup_location,
            phone: loc.phone,
            email: loc.email,
            address: loc.address,
            city: loc.city,
            state: loc.state,
            pincode: loc.pin_code,
            isDefault: index === 0
          }));
          await settings.save();
        }
      } catch (syncError) {
        console.error('Failed to auto-sync pickup locations:', syncError.message);
        // Continue anyway, createOrder will throw the appropriate error if still missing
      }
    }

    // 1. Create order in Shiprocket
    const result = await shiprocketService.createOrder(order);

    // 2. SAVE IMMEDIATELY - Even if AWB fails, we MUST have the reference
    order.shiprocket = {
      orderId: result.orderId,
      shipmentId: result.shipmentId
    };

    // If Shiprocket accepted the order but didn't assign a shipment ID,
    // it means it's stuck in "NEW" status on their platform (often due to missing dimensions, categories, or channel settings)
    if (!result.shipmentId) {
      await order.save();
      return res.status(200).json({
        success: true,
        message: 'Order created in Shiprocket (Status: NEW), but no Shipment ID was generated. Please log into Shiprocket to move it to "Ready to Ship".',
        data: { order }
      });
    }

    // Attempt subsequent automated steps, but catch locally to ensure order still saves
    try {
      // 3. Generate AWB
      console.log(`[Shiprocket] Generating AWB for shipment: ${result.shipmentId}`);
      const awbResult = await shiprocketService.generateAWB(result.shipmentId);
      
      order.shiprocket.awb = awbResult.awb;
      order.shiprocket.courierName = awbResult.courierName;
      order.trackingNumber = awbResult.awb;
      order.courierName = awbResult.courierName;

      // 4. Schedule pickup
      console.log(`[Shiprocket] Scheduling pickup for shipment: ${result.shipmentId}`);
      const pickupResult = await shiprocketService.schedulePickup(result.shipmentId);
      order.shiprocket.pickupScheduledDate = pickupResult.pickupScheduledDate;

      // 5. Update Status
      order.orderStatus = 'shipped';
      order.shippedAt = new Date();
      
      console.log(`✅ [Shiprocket] Fully processed order ${order.orderNo}`);

    } catch (subError) {
      console.error(`⚠️ [Shiprocket] Partial success for ${order.orderNo}:`, subError.message);
      // We don't re-throw here because the order IS created in Shiprocket.
      // We want to return the saved shipment ID so the user can see it in admin.
    }

    await order.save();

    res.json({
      success: true,
      message: order.orderStatus === 'shipped' 
        ? 'Shipment created and scheduled successfully' 
        : 'Order created in Shiprocket, but AWB/Pickup failed. You can retry from the Shiprocket dashboard.',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate shipping label
 * @route   GET /api/shiprocket/label/:orderId
 * @access  Private (Admin/Vendor)
 */
export const generateLabel = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (!order.shiprocket || !order.shiprocket.shipmentId) {
      return next(new AppError('No shipment found for this order', 400));
    }

    const result = await shiprocketService.generateLabel(order.shiprocket.shipmentId);

    order.shiprocket.labelUrl = result.labelUrl;
    await order.save();

    const hostUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    const proxyUrl = `${hostUrl}/api/shiprocket/proxy-pdf?url=${encodeURIComponent(result.labelUrl)}`;

    res.json({
      success: true,
      data: { labelUrl: proxyUrl }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate order invoice
 * @route   GET /api/shiprocket/invoice/:orderId
 * @access  Private (Admin/Vendor)
 */
export const getInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return next(new AppError('Order not found', 404));

    // Shiprocket needs their internal Order ID, but we can try with orderNo too if configured
    // Usually they need the ID from their system which we store in shiprocket.orderId
    const targetId = order.shiprocket?.orderId || order.orderNo;
    
    const result = await shiprocketService.generateInvoice(targetId);

    const hostUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    const proxyUrl = `${hostUrl}/api/shiprocket/proxy-pdf?url=${encodeURIComponent(result.invoiceUrl)}`;

    res.json({
      success: true,
      data: { invoiceUrl: proxyUrl }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate packing slip
 * @route   GET /api/shiprocket/packing-slip/:orderId
 * @access  Private (Admin/Vendor)
 */
export const getPackingSlip = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return next(new AppError('Order not found', 404));

    // Instead of calling the Shiprocket API which is returning a 404, we will send
    // the user directly to our brand-new "Premium Pick List" HTML generator.
    // This provides a much more readable document and completely bypasses Shiprocket errors.
    const hostUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    const pickListUrl = `${hostUrl}/api/shiprocket/pick-list/${order._id}`;

    res.json({
      success: true,
      data: { packingSlipUrl: pickListUrl }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate manifest
 * @route   GET /api/shiprocket/manifest/:orderId
 * @access  Private (Admin/Vendor)
 */
export const generateManifest = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (!order.shiprocket || !order.shiprocket.shipmentId) {
      return next(new AppError('No shipment found for this order', 400));
    }

    const result = await shiprocketService.generateManifest(order.shiprocket.shipmentId);

    order.shiprocket.manifestUrl = result.manifestUrl;
    await order.save();

    res.json({
      success: true,
      data: { manifestUrl: result.manifestUrl }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Track shipment
 * @route   GET /api/shiprocket/track/:orderId
 * @access  Private (Admin/Vendor)
 */
export const trackShipment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (!order.shiprocket || !order.shiprocket.shipmentId) {
      return next(new AppError('No shipment found for this order', 400));
    }

    const tracking = await shiprocketService.trackShipment(order.shiprocket.shipmentId);

    res.json({
      success: true,
      data: { tracking }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel shipment
 * @route   DELETE /api/shiprocket/shipment/:orderId
 * @access  Private (Admin/Vendor)
 */
export const cancelShipment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (!order.shiprocket || !order.shiprocket.awb) {
      return next(new AppError('No AWB found for this order', 400));
    }

    await shiprocketService.cancelShipment(order.shiprocket.awb);

    // Clear shipment details
    order.shiprocket = undefined;
    order.trackingNumber = undefined;
    order.courierName = undefined;
    await order.save();

    res.json({
      success: true,
      message: 'Shipment cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Schedule pickup
 * @route   POST /api/shiprocket/schedule-pickup/:orderId
 * @access  Private (Admin/Vendor)
 */
export const schedulePickup = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (!order.shiprocket || !order.shiprocket.shipmentId) {
      return next(new AppError('No shipment found for this order', 400));
    }

    const result = await shiprocketService.schedulePickup(order.shiprocket.shipmentId);

    order.shiprocket.pickupScheduledDate = result.pickupScheduledDate;
    await order.save();

    res.json({
      success: true,
      message: 'Pickup scheduled successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Set default pickup location
 * @route   PATCH /api/shiprocket/pickup-locations/:locationId/default
 * @access  Private (Admin)
 */
export const setDefaultPickupLocation = async (req, res, next) => {
  try {
    const { locationId } = req.params;
    const settings = await ShiprocketSettings.findOne({ isActive: true });

    if (!settings) {
      return next(new AppError('Shiprocket settings not found', 404));
    }

    settings.pickupLocations = settings.pickupLocations.map(loc => ({
      ...loc.toObject(),
      isDefault: loc.id === locationId
    }));

    await settings.save();

    res.json({
      success: true,
      message: 'Default pickup location updated',
      data: { settings }
    });
  } catch (error) {
    next(error);
  }
};