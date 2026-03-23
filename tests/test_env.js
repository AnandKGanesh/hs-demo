require('dotenv').config();
console.log('Server URL:', process.env.HYPERSWITCH_SERVER_URL);
console.log('Profile ID:', process.env.PROFILE_ID);
console.log('Secret Key exists:', !!process.env.HYPERSWITCH_SECRET_KEY);
