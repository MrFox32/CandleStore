import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function runSQL() {
    const sql = `
        ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT;
        ALTER TABLE products ADD COLUMN IF NOT EXISTS last_purchased_at TIMESTAMPTZ;

        CREATE OR REPLACE FUNCTION update_last_purchased_at()
        RETURNS TRIGGER AS $$
        BEGIN
          UPDATE products
          SET last_purchased_at = NOW()
          WHERE id = NEW.product_id;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS trigger_update_last_purchased_at ON order_items;

        CREATE TRIGGER trigger_update_last_purchased_at
        AFTER INSERT ON order_items
        FOR EACH ROW
        EXECUTE FUNCTION update_last_purchased_at();
    `;

    const { error } = await supabase.rpc('run_sql', { sql });
    if (error) {
        console.error("RPC Error:", error);
    } else {
        console.log("Database updated successfully!");
    }
}
runSQL();
