import axios from 'axios';

const test = async () => {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/send-otp', {
            phone: '9876543210',
            type: 'signup'
        });
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
};

test();
