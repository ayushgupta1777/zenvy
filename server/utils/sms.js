import axios from 'axios';

/**
 * Send OTP via 2Factor API
 * @param {string} phone - Target phone number
 * @param {string} otp - The OTP to send
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const sendOTP_2Factor = async (phone, otp) => {
    try {
        const apiKey = process.env.TWO_FACTOR_API_KEY;
        if (!apiKey || apiKey === 'YOUR_2FACTOR_API_KEY') {
            return { success: false, message: '2Factor API key is missing or not configured' };
        }

        // Clean phone number: Strictly 10 digits as per your working example
        // (Removing any country code if present to see if it helps)
        let cleanPhone = String(phone).replace(/\D/g, '');
        if (cleanPhone.length > 10) {
            cleanPhone = cleanPhone.slice(-10);
            console.log(`[sms.js] Sliced to 10 digits: ${cleanPhone}`);
        }

        // 2Factor API Format with Template: https://2factor.in/API/V1/{APIKEY}/SMS/{PHONE}/{OTP}/{TEMPLATE}
        const templateName = process.env.TWO_FACTOR_TEMPLATE_NAME;
        let url = `https://2factor.in/API/V1/${apiKey}/SMS/${cleanPhone}/${otp}/${templateName}`;

        // if (templateName && templateName !== 'YOUR_TEMPLATE_NAME' && templateName !== 'undefined') {
        //     url += `/${templateName}`;
        // }

        console.log(`[sms.js] Sending 2Factor request to: ${url.replace(apiKey, 'HIDDEN_KEY')}`);

        const response = await axios.get(url);

        console.log('[sms.js] 2Factor Response:', response.data);

        if (response.data && response.data.Status === 'Success') {
            return { success: true, message: 'OTP sent successfully via 2Factor', sessionId: response.data.Details };
        } else {
            console.error('[sms.js] 2Factor Error Response:', response.data);
            return { success: false, message: response.data.Details || 'Failed to send OTP via 2Factor' };
        }
    } catch (error) {
        console.error('Error sending SMS via 2Factor:', error.response?.data || error.message);
        return { success: false, message: error.message };
    }
};
