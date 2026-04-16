// ============================================
// 4. Enhanced Shiprocket Service
// backend/services/shiprocketService.js
// ============================================
import axios from 'axios';
import ShiprocketSettings from '../models/ShiprocketSettings.js';

class ShiprocketService {
  constructor() {
    this.baseURL = 'https://apiv2.shiprocket.in/v1/external';
    this.token = null;
    this.tokenExpiry = null;
  }

  async getToken() {
    try {
      // Check if token is still valid
      if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
        return this.token;
      }

      // Get credentials from database
      const settings = await ShiprocketSettings.findOne({ isActive: true });
      if (!settings) {
        throw new Error('Shiprocket not configured');
      }

      // Login to get token
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        email: settings.email,
        password: settings.password
      });

      this.token = response.data.token;
      this.tokenExpiry = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); // 10 days

      // Save token to database
      settings.token = this.token;
      settings.tokenExpiresAt = this.tokenExpiry;
      await settings.save();

      return this.token;
    } catch (error) {
      console.error('Shiprocket auth error:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Shiprocket');
    }
  }

  async makeRequest(method, endpoint, data = null) {
    try {
      const token = await this.getToken();
      
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error('Shiprocket API error:', error.response?.data || error.message);
      throw error;
    }
  }

  async createOrder(order) {
    const settings = await ShiprocketSettings.findOne({ isActive: true });
    if (!settings) {
      throw new Error('Shiprocket not configured');
    }

    const orderData = {
      order_id: order.orderNo,
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: settings.pickupLocations.find(l => l.isDefault)?.name || settings.pickupLocations[0]?.name,
      channel_id: settings.channelId || '',
      billing_customer_name: order.shippingAddress.name,
      billing_last_name: '',
      billing_address: order.shippingAddress.addressLine1,
      billing_address_2: order.shippingAddress.addressLine2 || '',
      billing_city: order.shippingAddress.city,
      billing_pincode: order.shippingAddress.pincode,
      billing_state: order.shippingAddress.state,
      billing_country: 'India',
      billing_email: order.user.email,
      billing_phone: order.shippingAddress.phone,
      shipping_is_billing: true,
      order_items: order.items.map(item => ({
        name: item.product.title,
        sku: item.product._id.toString(),
        units: item.quantity,
        selling_price: item.finalPrice,
        discount: 0
      })),
      payment_method: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
      shipping_charges: order.shipping,
      total_discount: 0,
      sub_total: order.subtotal,
      length: settings.defaultLength,
      breadth: settings.defaultBreadth,
      height: settings.defaultHeight,
      weight: settings.defaultWeight
    };

    const response = await this.makeRequest('POST', '/orders/create/adhoc', orderData);
    return {
      orderId: response.order_id,
      shipmentId: response.shipment_id
    };
  }

  async generateAWB(shipmentId) {
    const response = await this.makeRequest('POST', '/courier/assign/awb', {
      shipment_id: shipmentId
    });

    return {
      awb: response.response.data.awb_code,
      courierName: response.response.data.courier_name
    };
  }

  async schedulePickup(shipmentId) {
    const response = await this.makeRequest('POST', '/courier/generate/pickup', {
      shipment_id: [shipmentId]
    });

    return {
      pickupScheduledDate: response.pickup_scheduled_date
    };
  }

  async trackShipment(shipmentId) {
    const response = await this.makeRequest('GET', `/courier/track/shipment/${shipmentId}`);
    return response;
  }

  async generateLabel(shipmentId) {
    const response = await this.makeRequest('POST', '/courier/generate/label', {
      shipment_id: [shipmentId]
    });

    return {
      labelUrl: response.label_url
    };
  }

  async generateManifest(shipmentId) {
    const response = await this.makeRequest('POST', '/manifests/generate', {
      shipment_id: [shipmentId]
    });

    return {
      manifestUrl: response.manifest_url
    };
  }

  async cancelShipment(awb) {
    const response = await this.makeRequest('POST', '/orders/cancel/shipment/awbs', {
      awbs: [awb]
    });

    return response;
  }

  async getPickupLocations() {
    const response = await this.makeRequest('GET', '/settings/company/pickup');
    return response.data.shipping_address;
  }
}

export default new ShiprocketService();