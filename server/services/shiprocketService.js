// ============================================
// services/shiprocketService.js
// Complete Shiprocket Integration
// ============================================
import axios from 'axios';
import ShiprocketSettings from '../models/ShiprocketSettings.js';
import { AppError } from '../middleware/errorHandler.js';


const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';





class ShiprocketService {
  constructor() {
    this.token = null;
    this.tokenExpiresAt = null;
  }

  /**
   * Get valid token (refresh if expired)
   */
  async getToken() {
    if (this.token && this.tokenExpiresAt && new Date() < this.tokenExpiresAt) {
      return this.token;
    }

    const settings = await ShiprocketSettings.findOne({ isActive: true });
    if (!settings) {
      throw new AppError('Shiprocket settings not configured', 500);
    }

    // Check if stored token is still valid
    if (settings.token && settings.tokenExpiresAt && new Date() < settings.tokenExpiresAt) {
      this.token = settings.token;
      this.tokenExpiresAt = settings.tokenExpiresAt;
      return this.token;
    }

    // Login to get new token
    try {
      console.log(`[Shiprocket] Attempting login for email: ${settings.email}`);
      const response = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
        email: settings.email,
        password: settings.password
      });

      this.token = response.data.token;
      // Token expires in 10 days according to Shiprocket documentation
      this.tokenExpiresAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);

      // Save token to DB to avoid frequent logins
      settings.token = this.token;
      settings.tokenExpiresAt = this.tokenExpiresAt;
      await settings.save();

      console.log(`[Shiprocket] Token successfully refreshed for ${settings.email}`);
      return this.token;
    } catch (error) {
      const errorMsg = shiprocketError?.message || error.message;
      const status = error.response?.status || 500;
      
      console.error('[Shiprocket] Authentication Failure:', {
        status,
        data: shiprocketError,
        message: error.message
      });

      // Special guidance for 2FA or password issues
      let userAdvice = '';
      if (status === 401 || status === 403) {
        userAdvice = ' Please check your credentials and ensure Two-Factor Authentication (2FA) is turned OFF in your Shiprocket account settings.';
      }

      throw new AppError(`Shiprocket Login Failed: ${errorMsg}.${userAdvice}`, status);
    }
  }

  /**
   * Helper to test specific credentials (used for validation on save)
   */
  async getTokenWithCredentials(email, password) {
    try {
      console.log(`[Shiprocket] Testing login for email: "${email}" (length: ${email?.length})`);
      const response = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
        email: (email || '').trim(),
        password: (password || '').trim()
      });
      return response.data.token;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      const status = error.response?.status;

      console.error('[Shiprocket] getTokenWithCredentials Failure:', {
        status,
        message: errorMsg,
        data: error.response?.data
      });

      throw new Error(errorMsg);
    }
  }

  /**
   * Make authenticated request to Shiprocket with automatic retry on 401
   */
  async request(method, endpoint, data = null, retry = true) {
    const token = await this.getToken();

    try {
      const config = {
        method,
        url: `${SHIPROCKET_BASE_URL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      // If unauthorized (401), clear the token locally and in DB, then retry once
      if (error.response?.status === 401 && retry) {
        console.warn(`[Shiprocket] Received 401 Unauthorized for ${endpoint}. Clearing token and retrying...`);
        this.token = null;
        this.tokenExpiresAt = null;

        try {
          // Explicitly clear token in DB so other requests don't use the same stale token
          await ShiprocketSettings.updateOne({ isActive: true }, { $unset: { token: 1, tokenExpiresAt: 1 } });
        } catch (dbErr) {
          console.error('[Shiprocket] Database error while clearing token:', dbErr.message);
        }

        return this.request(method, endpoint, data, false);
      }

      const status = error.response?.status || 500;
      const shiprocketMessage = error.response?.data?.message || error.message;

      console.error(`[Shiprocket] API Error [${status}] at [${endpoint}]:`, error.response?.data || error.message);

      throw new AppError(
        `Shiprocket API Error: ${shiprocketMessage}`,
        status
      );
    }
  }

  /**
   * Create order on Shiprocket
   */
  async createOrder(order) {
    const settings = await ShiprocketSettings.findOne({ isActive: true });
    if (!settings) {
      throw new AppError('Shiprocket settings not configured', 500);
    }

    // ── Resolve pickup location name ──────────────────────────────────────
    // Priority 1: Admin-entered manual name (works even when Shiprocket API is unreachable)
    let pickupLocationName = settings.defaultPickupName?.trim();

    if (!pickupLocationName) {
      // Priority 2: Location flagged as default in the synced list
      let pickupLocation = settings.pickupLocations.find(loc => loc.isDefault);

      // Priority 3: Fall back to first available synced location
      if (!pickupLocation && settings.pickupLocations.length > 0) {
        console.warn('⚠️  No default pickup location set — using first synced location as fallback.');
        pickupLocation = settings.pickupLocations[0];
        // Auto-persist so it is remembered for next order
        settings.pickupLocations[0].isDefault = true;
        await settings.save();
      }

      if (!pickupLocation) {
        throw new AppError(
          'No pickup location configured. Open Shiprocket Settings → enter a "Default Pickup Name" (your warehouse name from Shiprocket dashboard) and save.',
          500
        );
      }

      pickupLocationName = pickupLocation.name;
    }

    console.log(`📦 Using pickup location: "${pickupLocationName}"`);

    // Prepare order items
    const orderItems = order.items.map(item => ({
      name: item.productTitle || (item.product && item.product.title) || 'Product',
      sku: item.sku || (item.product && item.product.sku) || item.product.toString(),
      units: item.quantity,
      selling_price: item.finalPrice,
      discount: 0,
      tax: 0,
      hsn: item.hsn || ''
    }));

    // Calculate total weight
    const totalWeight = settings.defaultWeight * order.items.reduce((sum, item) => sum + item.quantity, 0);

    // Validate payload
    const requiredFields = [
      { key: 'billing_customer_name', val: order.shippingAddress.name },
      { key: 'billing_address', val: order.shippingAddress.addressLine1 },
      { key: 'billing_city', val: order.shippingAddress.city },
      { key: 'billing_pincode', val: order.shippingAddress.pincode },
      { key: 'billing_state', val: order.shippingAddress.state },
      { key: 'billing_country', val: 'India' },
      { key: 'billing_email', val: order.user.email },
      { key: 'billing_phone', val: order.shippingAddress.phone }
    ];

    const missingFields = requiredFields.filter(f => !f.val).map(f => f.key);
    if (missingFields.length > 0) {
      throw new AppError(`Missing required shipping fields: ${missingFields.join(', ')}`, 400);
    }

    const shiprocketOrderData = {
      order_id: order.orderNo,
      order_date: order.createdAt.toISOString().split('T')[0],
      pickup_location: pickupLocationName,
      channel_id: settings.channelId || '',
      comment: order.notes || '',
      billing_customer_name: order.shippingAddress.name,
      billing_last_name: '',
      billing_address: order.shippingAddress.addressLine1,
      billing_address_2: order.shippingAddress.addressLine2 || '',
      billing_city: order.shippingAddress.city,
      billing_pincode: order.shippingAddress.pincode,
      billing_state: order.shippingAddress.state,
      billing_country: order.shippingAddress.country,
      billing_email: order.user.email || 'customer@example.com',
      billing_phone: order.shippingAddress.phone,
      shipping_is_billing: true,
      order_items: orderItems,
      payment_method: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
      shipping_charges: order.shippingCost,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: order.discount,
      sub_total: order.subtotal,
      length: settings.defaultLength,
      breadth: settings.defaultBreadth,
      height: settings.defaultHeight,
      weight: totalWeight
    };

    try {
      const response = await this.request('POST', '/orders/create/adhoc', shiprocketOrderData);
      console.log(`✅ [Shiprocket] Success for order ${order.orderNo}:`, JSON.stringify(response, null, 2));

      return {
        orderId: response.order_id,
        shipmentId: response.shipment_id, // Might be undefined if stuck in NEW state
        status: response.status
      };
    } catch (error) {
      const srError = error.response?.data?.message || error.message;
      const srData = error.response?.data;

      // --- AUTO-RECOVERY: Wrong Pickup Location ---
      if (srError.toLowerCase().includes('wrong pickup location') && srData?.data?.data?.length > 0) {
        const correctLocation = srData.data.data[0].pickup_location;
        console.warn(`⚠️ [Shiprocket] Auto-recovering: Changing pickup location from "${shiprocketOrderData.pickup_location}" to "${correctLocation}"`);
        
        // Update database for future orders
        await ShiprocketSettings.updateOne({ isActive: true }, { $set: { defaultPickupName: correctLocation } });
        
        // Retry with the correct location
        shiprocketOrderData.pickup_location = correctLocation;
        const retryResponse = await this.request('POST', '/orders/create/adhoc', shiprocketOrderData);
        console.log(`✅ [Shiprocket] Success after auto-recovery for ${order.orderNo}:`, JSON.stringify(retryResponse, null, 2));

        return {
          orderId: retryResponse.order_id,
          shipmentId: retryResponse.shipment_id,
          status: retryResponse.status
        };
      }

      console.error('❌ Shiprocket Create Order Error:', error.response?.data || error.message);
      // Extract specific error message from Shiprocket response if available
      const srErrors = error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : '';
      throw new AppError(`Shiprocket Error: ${srError} ${srErrors}`, error.response?.status || 500);
    }
  }

  /**
   * Generate AWB (Airway Bill Number)
   */
  async generateAWB(shipmentId, courierId = null) {
    const data = {
      shipment_id: shipmentId
    };

    if (courierId) {
      data.courier_id = courierId;
    }

    const response = await this.request('POST', '/courier/assign/awb', data);

    return {
      awb: response.response.data.awb_code,
      courierName: response.response.data.courier_name,
      courierId: response.response.data.courier_id
    };
  }

  /**
   * Get available couriers for shipment
   */
  async getAvailableCouriers(shipmentId) {
    const response = await this.request('GET', `/courier/serviceability?shipment_id=${shipmentId}`);
    return response.data.available_courier_companies;
  }

  /**
   * Schedule pickup
   */
  async schedulePickup(shipmentId) {
    const response = await this.request('POST', '/courier/generate/pickup', {
      shipment_id: [shipmentId]
    });

    return {
      pickupScheduledDate: response.pickup_scheduled_date,
      pickupTokenNumber: response.pickup_token_number
    };
  }

  /**
   * Generate shipping label
   */
  async generateLabel(shipmentIds) {
    console.log(`[Shiprocket] Generating label for shipments: ${shipmentIds}`);
    const response = await this.request('POST', '/courier/generate/label', {
      shipment_id: Array.isArray(shipmentIds) ? shipmentIds : [shipmentIds],
      // Adding config to make the label more readable/detailed if supported
      config: {
        template_name: 'default' // This usually includes item details in Shiprocket
      }
    });

    const labelUrl = response.label_url;
    
    if (!labelUrl) {
      console.error('[Shiprocket] No label URL in response:', response);
      throw new Error('Shiprocket did not return a label URL');
    }

    return {
      labelUrl: labelUrl,
      labelCreatedDate: response.label_created_date
    };
  }

  /**
   * Generate invoice
   */
  async generateInvoice(orderIds) {
    console.log(`[Shiprocket] Generating invoice for orders: ${orderIds}`);
    const response = await this.request('POST', '/orders/print/invoice', {
      ids: Array.isArray(orderIds) ? orderIds : [orderIds]
    });

    // Shiprocket returns invoice_url or label_url depending on the request type/version
    const invoiceUrl = response.is_v2 ? response.invoice_url : (response.label_url || response.invoice_url);
    
    if (!invoiceUrl) {
      console.error('[Shiprocket] No invoice URL in response:', response);
      throw new Error('Shiprocket did not return an invoice URL');
    }

    return { invoiceUrl };
  }

  /**
   * Generate packing slip
   * FIXED: Correct endpoint is /orders/print/packing_slip (not /courier/generate/packing_slip)
   */
  async generatePackingSlip(shipmentIds) {
    console.log(`[Shiprocket] Generating packing slip for shipments: ${shipmentIds}`);
    const response = await this.request('POST', '/orders/print/packing_slip', {
      shipment_id: Array.isArray(shipmentIds) ? shipmentIds : [shipmentIds]
    });

    // Extract URL similarly to invoice/label
    const packingSlipUrl = response.label_url || response.packing_slip_url || response.invoice_url;

    if (!packingSlipUrl) {
      console.error('[Shiprocket] No packing slip URL in response:', response);
      throw new Error('Shiprocket did not return a packing slip URL');
    }

    return { packingSlipUrl };
  }

  /**
   * Generate manifest
   */
  async generateManifest(shipmentIds) {
    const response = await this.request('POST', '/manifests/generate', {
      shipment_id: Array.isArray(shipmentIds) ? shipmentIds : [shipmentIds]
    });

    return {
      manifestUrl: response.manifest_url,
      manifestId: response.manifest_id
    };
  }

  /**
   * Track shipment
   */
  async trackShipment(shipmentId) {
    const response = await this.request('GET', `/courier/track/shipment/${shipmentId}`);

    return {
      trackingData: response.tracking_data,
      shipmentTrack: response.shipment_track,
      shipmentTrackActivities: response.shipment_track_activities
    };
  }

  /**
   * Cancel shipment
   */
  async cancelShipment(awbs) {
    const response = await this.request('POST', '/orders/cancel/shipment/awbs', {
      awbs: Array.isArray(awbs) ? awbs : [awbs]
    });

    return response;
  }

  /**
   * Create return order
   */
  async createReturn(returnRequest, originalOrder) {
    const settings = await ShiprocketSettings.findOne({ isActive: true });
    const pickupLocation = settings.pickupLocations.find(loc => loc.isDefault);

    const returnItems = returnRequest.items.map(item => ({
      name: item.product.title,
      sku: item.product._id.toString(),
      units: item.quantity,
      selling_price: item.price,
      discount: 0,
      tax: 0
    }));

    const returnOrderData = {
      order_id: returnRequest.returnNo,
      order_date: returnRequest.createdAt.toISOString().split('T')[0],
      channel_id: settings.channelId || '',
      pickup_customer_name: originalOrder.shippingAddress.name,
      pickup_last_name: '',
      pickup_address: originalOrder.shippingAddress.addressLine1,
      pickup_address_2: originalOrder.shippingAddress.addressLine2 || '',
      pickup_city: originalOrder.shippingAddress.city,
      pickup_state: originalOrder.shippingAddress.state,
      pickup_country: originalOrder.shippingAddress.country,
      pickup_pincode: originalOrder.shippingAddress.pincode,
      pickup_email: originalOrder.user.email,
      pickup_phone: originalOrder.shippingAddress.phone,
      pickup_isd_code: '91',
      shipping_customer_name: pickupLocation.name,
      shipping_last_name: '',
      shipping_address: pickupLocation.address,
      shipping_address_2: '',
      shipping_city: pickupLocation.city,
      shipping_country: 'India',
      shipping_pincode: pickupLocation.pincode,
      shipping_state: pickupLocation.state,
      shipping_email: pickupLocation.email,
      shipping_isd_code: '91',
      shipping_phone: pickupLocation.phone,
      order_items: returnItems,
      payment_method: 'Prepaid',
      sub_total: returnRequest.refundAmount,
      length: settings.defaultLength,
      breadth: settings.defaultBreadth,
      height: settings.defaultHeight,
      weight: settings.defaultWeight
    };

    const response = await this.request('POST', '/orders/create/return', returnOrderData);

    return {
      orderId: response.order_id,
      shipmentId: response.shipment_id
    };
  }

  /**
   * Get pickup locations
   */
  async getPickupLocations() {
    const response = await this.request('GET', '/settings/company/pickup');
    return response.data.shipping_address;
  }

  /**
   * Webhook verification
   */
  verifyWebhook(payload, signature, secret) {
    const crypto = require('crypto');
    const hash = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
    return hash === signature;
  }
}

export default new ShiprocketService();