import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testInsert() {
  const { data, error } = await supabase.from('products').insert([
    { name: 'test insert', description: 'test', price: 100, stock_quantity: 1 }
  ]).select('*');
  console.log("Error:", error);
  console.log("Inserted data:", data);
}

testInsert()
