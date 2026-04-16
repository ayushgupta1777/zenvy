import AppSetting from '../models/AppSetting.js';
import User from '../models/User.js';
import NotificationService from '../services/notificationService.js';
import { AppError } from '../middleware/errorHandler.js';

// ... existing methods ...

export const releaseUpdate = async (req, res, next) => {
    try {
        const { version, updateUrl, releaseNotes } = req.body;

        if (!version || !updateUrl) {
            return next(new AppError('Version and Update URL are required', 400));
        }

        // 1. Update settings in Database
        await AppSetting.findOneAndUpdate(
            { key: 'latest_app_version' },
            { value: version },
            { upsert: true }
        );
        await AppSetting.findOneAndUpdate(
            { key: 'app_update_url' },
            { value: updateUrl },
            { upsert: true }
        );

        // 2. Fetch users with FCM tokens
        const usersWithToken = await User.find({ fcmToken: { $exists: true, $ne: '' } }).select('_id');
        const userIds = usersWithToken.map(u => u._id);

        // 3. Broadcast notification
        if (userIds.length > 0) {
            await NotificationService.sendBulkNotifications(userIds, {
                type: 'app_update',
                title: '🚀 New Update Available!',
                message: `Version ${version} is now available. ${releaseNotes || 'Update now for a better experience.'}`,
                data: {
                    version,
                    updateUrl,
                    type: 'app_update'
                }
            });
        }

        res.json({
            success: true,
            message: `App version ${version} published and ${userIds.length} users notified.`
        });
    } catch (error) {
        next(error);
    }
};

export const getSettings = async (req, res, next) => {
    try {
        const settings = await AppSetting.find({});
        // Convert to a simple object for easier frontend consumption
        const settingsObj = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});

        res.json({
            success: true,
            data: { settings: settingsObj }
        });
    } catch (error) {
        next(error);
    }
};

export const getSettingByKey = async (req, res, next) => {
    try {
        const { key } = req.params;
        let setting = await AppSetting.findOne({ key });

        // Default values for common settings if they don't exist
        if (!setting) {
            if (key === 'isCodEnabled') {
                return res.json({
                    success: true,
                    data: { key, value: true }
                });
            }
        }

        res.json({
            success: true,
            data: {
                key: setting?.key || key,
                value: setting?.value ?? null
            }
        });
    } catch (error) {
        next(error);
    }
};

export const updateSetting = async (req, res, next) => {
    try {
        const { key, value, description } = req.body;

        if (!key) {
            return next(new AppError('Setting key is required', 400));
        }

        const setting = await AppSetting.findOneAndUpdate(
            { key },
            { value, description },
            { new: true, upsert: true, runValidators: true }
        );

        res.json({
            success: true,
            message: `Setting ${key} updated successfully`,
            data: { setting }
        });
    } catch (error) {
        next(error);
    }
};
