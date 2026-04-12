import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testUpdate() {
  console.log("Testing supabase update...");
  // fetch one product
  const { data: products } = await supabase.from('products').select('*').limit(1);
  if (!products || products.length === 0) {
    console.log("No products found");
    return;
  }
  const id = products[0].id;
  console.log(`Updating product ${id} with mock images array...`);
  
  const { data, error } = await supabase
    .from('products')
    .update({ images: ['http://test.com/image1.jpg'] })
    .eq('id', id)
    .select();
    
  console.log("Error:", error);
  console.log("Updated data:", data);
}

testUpdate()
