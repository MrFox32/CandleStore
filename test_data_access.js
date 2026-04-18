import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

async function testData() {
  try {
    const res = await axios.get(`${supabaseUrl}/rest/v1/products?select=*`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    console.log('SUCCESS: Fetched products data!');
    console.log('Count:', res.data.length);
  } catch (err) {
    console.error('FAIL:', err.message);
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    }
  }
}

testData();
