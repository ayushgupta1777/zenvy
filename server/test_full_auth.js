import axios from 'axios';

const testAuth = async () => {
  const baseURL = 'http://localhost:5000/api/auth';
  
  try {
    console.log('--- Testing /register ---');
    const registerData = {
      name: 'Test Google User',
      email: 'testgoogle123@google.com',
      googleId: '1234567890abcdef',
      profileImage: 'http://example.com/avatar.jpg',
      phoneNumber: '9999999999',
      password: 'password123',
      role: 'customer'
    };
    const regRes = await axios.post(`${baseURL}/register`, registerData);
    console.log('Register Response:', regRes.data);

    console.log('\n--- Testing /login with Google ID ---');
    const loginGoogleData = {
      email: 'testgoogle123@google.com',
      googleId: '1234567890abcdef'
    };
    const loginRes = await axios.post(`${baseURL}/login`, loginGoogleData);
    console.log('Login (Google) Response:', loginRes.data);

    console.log('\n--- Testing /login with Password ---');
    const loginPassData = {
      email: 'testgoogle123@google.com',
      password: 'password123'
    };
    const loginPassRes = await axios.post(`${baseURL}/login`, loginPassData);
    console.log('Login (Password) Response:', loginPassRes.data);

  } catch (err) {
    if (err.response) {
      console.error('Error:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
};

testAuth();
