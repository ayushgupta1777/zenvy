import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
    getAllUsersMaster, getUserActivityHistory, forceResetPassword,
    getServerHealth, getFinancials, getGeoPresence,
    getErrorLogs, getDeviceIntel, getSecurityAlerts,
    suspendUser, unsuspendUser, toggleMaintenanceMode, getMaintenanceStatus,
    getLiveOrders
} from '../controllers/developerController.js';

const router = express.Router();

// ALL ROUTES — DEVELOPER ONLY
router.use(protect, authorize('developer'));

// Existing
router.get('/users', getAllUsersMaster);
router.post('/users/:userId/reset-password', forceResetPassword);
router.post('/users/:userId/suspend', suspendUser);
router.post('/users/:userId/unsuspend', unsuspendUser);
router.get('/activity/:userId', getUserActivityHistory);

// Module 1: Server Health
router.get('/health', getServerHealth);

// Module 2: Financials
router.get('/financials', getFinancials);

// Module 3: Geo Presence
router.get('/geo', getGeoPresence);

// Module 4: Error Logs
router.get('/errors', getErrorLogs);

// Module 5: Device Intel
router.get('/devices', getDeviceIntel);

// Module 6: Security Alerts
router.get('/security', getSecurityAlerts);

// Module 7: Remote Control
router.post('/maintenance/toggle', toggleMaintenanceMode);
router.get('/maintenance/status', getMaintenanceStatus);

// Module 8: Live Orders
router.get('/orders/live', getLiveOrders);

export default router;
