import User from '../models/User.js';
import UserActivity from '../models/UserActivity.js';
import { AppError } from '../middleware/errorHandler.js';
import os from 'os';
import mongoose from 'mongoose';

// ─── EXISTING ────────────────────────────────────────────────────────────────

export const getAllUsersMaster = async (req, res, next) => {
    try {
        const users = await User.find({}).select('+password').sort('-createdAt').lean();

        // Enrich with reseller data
        try {
            const Reseller = (await import('../models/Reseller.js')).default;
            const resellers = await Reseller.find({}).select('user totalEarnings pendingAmount referralCode').lean();
            const resellerMap = {};
            resellers.forEach(r => { resellerMap[r.user?.toString()] = r; });
            const enriched = users.map(u => ({ ...u, resellerData: resellerMap[u._id?.toString()] || null }));
            return res.json({ success: true, count: enriched.length, data: { users: enriched } });
        } catch (_) {
            // Reseller model may not exist — return users without it
        }

        res.json({ success: true, count: users.length, data: { users } });
    } catch (error) { next(error); }
};

export const getUserActivityHistory = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const activities = await UserActivity.find({ user: userId })
            .populate('productId', 'title price').sort('-timestamp').limit(50);
        res.json({ success: true, data: { activities } });
    } catch (error) { next(error); }
};

export const forceResetPassword = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { newPassword } = req.body;
        if (!newPassword) return next(new AppError('Please provide a new password', 400));
        const user = await User.findById(userId);
        if (!user) return next(new AppError('User not found', 404));
        user.password = newPassword;
        await user.save();
        res.json({ success: true, message: `Password for ${user.name} has been reset.` });
    } catch (error) { next(error); }
};

// ─── MODULE 1: SERVER HEALTH ─────────────────────────────────────────────────

export const getServerHealth = async (req, res, next) => {
    try {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memPercent = Math.round((usedMem / totalMem) * 100);
        const uptimeSeconds = os.uptime();
        const dbState = mongoose.connection.readyState;
        const dbStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] || 'unknown';
        const cpuLoad = os.loadavg(); // [1min, 5min, 15min]

        res.json({
            success: true,
            data: {
                cpu: { load1: cpuLoad[0].toFixed(2), load5: cpuLoad[1].toFixed(2), load15: cpuLoad[2].toFixed(2) },
                memory: {
                    totalMB: Math.round(totalMem / 1024 / 1024),
                    usedMB: Math.round(usedMem / 1024 / 1024),
                    freeMB: Math.round(freeMem / 1024 / 1024),
                    percent: memPercent
                },
                uptime: uptimeSeconds,
                database: { status: dbStatus, connected: dbState === 1 },
                platform: os.platform(),
                nodeVersion: process.version
            }
        });
    } catch (error) { next(error); }
};

// ─── MODULE 2: FINANCIAL INTELLIGENCE ────────────────────────────────────────

export const getFinancials = async (req, res, next) => {
    try {
        const Order = (await import('../models/Order.js')).default;
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const startOfWeek = new Date(); startOfWeek.setDate(startOfWeek.getDate() - 7);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [todayRevenue, weekRevenue, monthRevenue, pendingOrders, topProducts] = await Promise.all([
            Order.aggregate([
                { $match: { createdAt: { $gte: startOfDay }, status: { $nin: ['cancelled', 'returned', 'refunded'] } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            Order.aggregate([
                { $match: { createdAt: { $gte: startOfWeek }, status: { $nin: ['cancelled', 'returned', 'refunded'] } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            Order.aggregate([
                { $match: { createdAt: { $gte: startOfMonth }, status: { $nin: ['cancelled', 'returned', 'refunded'] } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            Order.countDocuments({ status: 'pending' }),
            Order.aggregate([
                { $unwind: '$items' },
                { $group: { _id: '$items.product', title: { $first: '$items.title' }, totalSold: { $sum: '$items.quantity' }, revenue: { $sum: '$items.price' } } },
                { $sort: { totalSold: -1 } },
                { $limit: 5 }
            ])
        ]);

        res.json({
            success: true,
            data: {
                revenue: {
                    today: todayRevenue[0]?.total || 0,
                    week: weekRevenue[0]?.total || 0,
                    month: monthRevenue[0]?.total || 0,
                },
                pendingOrders,
                topProducts
            }
        });
    } catch (error) { next(error); }
};

// ─── MODULE 3: GEO PRESENCE ───────────────────────────────────────────────────

export const getGeoPresence = async (req, res, next) => {
    try {
        const Address = (await import('../models/Address.js')).default;
        const cityData = await Address.aggregate([
            { $group: { _id: '$city', count: { $sum: 1 }, state: { $first: '$state' } } },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]);
        const Order = (await import('../models/Order.js')).default;
        const ordersByState = await Order.aggregate([
            { $match: { 'shippingAddress.state': { $exists: true } } },
            { $group: { _id: '$shippingAddress.state', orders: { $sum: 1 } } },
            { $sort: { orders: -1 } },
            { $limit: 10 }
        ]);
        res.json({ success: true, data: { cities: cityData, ordersByState } });
    } catch (error) { next(error); }
};

// ─── MODULE 4: ERROR LOG ──────────────────────────────────────────────────────

// In-memory error log (populated by error middleware)
export const errorLog = [];
export const logError = (err, req) => {
    if (errorLog.length > 200) errorLog.shift(); // Keep max 200
    errorLog.push({
        timestamp: new Date(),
        status: err.statusCode || 500,
        message: err.message,
        path: req?.originalUrl,
        method: req?.method
    });
};

export const getErrorLogs = async (req, res, next) => {
    try {
        const logs = [...errorLog].reverse().slice(0, 50);
        res.json({ success: true, data: { logs } });
    } catch (error) { next(error); }
};

// ─── MODULE 5: DEVICE INTELLIGENCE ───────────────────────────────────────────
// This is powered by the socket's activeUsers map, exposed via an endpoint

export const getDeviceIntel = async (req, res, next) => {
    try {
        // Active socket data is emitted live; for history, use UserActivity
        const recentActivity = await UserActivity.find({})
            .populate('user', 'name email phone')
            .sort('-timestamp')
            .limit(50)
            .select('user screen timestamp metadata');
        res.json({ success: true, data: { activity: recentActivity } });
    } catch (error) { next(error); }
};

// ─── MODULE 6: SECURITY ALERTS ────────────────────────────────────────────────

export const getSecurityAlerts = async (req, res, next) => {
    try {
        // New users in last 24 hours
        const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const newUsers = await User.find({ createdAt: { $gte: since24h } })
            .select('name email phone createdAt role').sort('-createdAt');
        // Users with multiple failed attempts (tracked via loginAttempts if model has it)
        const suspiciousUsers = await User.find({ loginAttempts: { $gte: 3 } })
            .select('name email loginAttempts lockUntil').sort('-loginAttempts').limit(20);
        res.json({ success: true, data: { newUsers, suspiciousUsers } });
    } catch (error) { next(error); }
};

// ─── MODULE 7: REMOTE CONTROL ─────────────────────────────────────────────────

export const suspendUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true });
        if (!user) return next(new AppError('User not found', 404));
        res.json({ success: true, message: `${user.name} has been suspended.` });
    } catch (error) { next(error); }
};

export const unsuspendUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await User.findByIdAndUpdate(userId, { isActive: true }, { new: true });
        if (!user) return next(new AppError('User not found', 404));
        res.json({ success: true, message: `${user.name} has been reactivated.` });
    } catch (error) { next(error); }
};

// In-memory maintenance mode flag
let maintenanceMode = false;
export const toggleMaintenanceMode = async (req, res, next) => {
    try {
        maintenanceMode = !maintenanceMode;
        res.json({ success: true, data: { maintenanceMode, message: maintenanceMode ? 'App is now in MAINTENANCE MODE' : 'App is now LIVE' } });
    } catch (error) { next(error); }
};
export const getMaintenanceStatus = async (req, res, next) => {
    res.json({ success: true, data: { maintenanceMode } });
};

// ─── MODULE 8: LIVE ORDER PULSE ───────────────────────────────────────────────

export const getLiveOrders = async (req, res, next) => {
    try {
        const Order = (await import('../models/Order.js')).default;
        const orders = await Order.find({})
            .populate('user', 'name phone')
            .sort('-createdAt')
            .limit(20)
            .select('user totalAmount status items createdAt');
        res.json({ success: true, data: { orders } });
    } catch (error) { next(error); }
};
