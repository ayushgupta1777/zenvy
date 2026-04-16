import mongoose from 'mongoose';

const appSettingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    description: String
}, { timestamps: true });

const AppSetting = mongoose.model('AppSetting', appSettingSchema);

export default AppSetting;
