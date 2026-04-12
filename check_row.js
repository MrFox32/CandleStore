import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testStorage() {
  const { data, error } = await supabase.from('products').select('*').eq('id', '3e9fbba7-340f-43ef-849f-902534cb72fe');
  console.log("Record:", data);
}

testStorage()
