import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testStorage() {
  console.log("Testing storage upload...");
  
  // write a dummy file
  fs.writeFileSync('dummy.jpg', 'dummy content');
  const fileBuffer = fs.readFileSync('dummy.jpg');
  
  const { data, error } = await supabase.storage
    .from('candle-images')
    .upload('test-image-' + Date.now() + '.jpg', fileBuffer, {
      contentType: 'image/jpeg'
    });
    
  console.log("Error:", error);
  console.log("Uploaded object:", data);
  
  fs.unlinkSync('dummy.jpg');
}

testStorage()
