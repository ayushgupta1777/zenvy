// 6. SHIPROCKET ROUTES
// routes/shiprocketRoutes.js
import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getSettings,
  updateSettings,
  testConnection,
  getPickupLocations,
  setDefaultPickupLocation,
  createShipment,
  generateLabel,
  getInvoice,
  getPackingSlip,
  generateManifest,
  trackShipment,
  cancelShipment,
  schedulePickup,
  proxyPdfDownload
} from '../controllers/shiprocketController.js';
import { getCustomPickList } from '../controllers/customDocController.js';

const router = express.Router();

// Document Proxy (needs auth)
router.get('/proxy-pdf', proxyPdfDownload);

router.use(protect, authorize('admin', 'vendor'));

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.post('/test-connection', testConnection);
router.get('/pickup-locations', getPickupLocations);
router.patch('/pickup-locations/:locationId/default', setDefaultPickupLocation);

// Shipment operations
router.post('/shipment/:orderId', createShipment);
router.get('/label/:orderId', generateLabel);
router.get('/invoice/:orderId', getInvoice);
router.get('/packing-slip/:orderId', getPackingSlip);
router.get('/manifest/:orderId', generateManifest);
router.get('/track/:orderId', trackShipment);
router.delete('/shipment/:orderId', cancelShipment);
router.post('/schedule-pickup/:orderId', schedulePickup);
router.get('/pick-list/:orderId', getCustomPickList);

export default router;
