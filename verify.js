import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

async function checkRestInterface() {
  try {
    const res = await axios.get(`${supabaseUrl}/rest/v1/?apikey=${supabaseAnonKey}`, {
      headers: {
        'apikey': supabaseAnonKey
      }
    });
    const openapi = res.data;
    const productsProps = openapi.definitions.products?.properties;
    
    if (!productsProps) {
      console.log('No properties for products table found in OpenAPI spec.');
      return;
    }
    
    if (productsProps.images) {
      console.log('SUCCESS: PostgREST cache knows about the "images" column!');
      console.log('Column details:', productsProps.images);
    } else {
      console.log('FAIL: PostgREST cache DOES NOT know about the "images" column yet.');
      console.log('Available columns:', Object.keys(productsProps));
    }
  } catch (err) {
    console.error('Error fetching swagger:', err.message);
  }
}

checkRestInterface();
