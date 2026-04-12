import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function check() {
    const { error } = await supabase.rpc('run_sql', { sql: `
        ALTER TABLE contact_requests ADD COLUMN IF NOT EXISTS email TEXT;
        ALTER TABLE contact_requests ADD COLUMN IF NOT EXISTS telegram_username TEXT;
    `});
    console.log("RPC Error:", error);
}
check();
