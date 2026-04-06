const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("WARNING: SUPABASE_URL or SUPABASE_SERVICE_KEY is missing. Check your Vercel Environment Variables.");
}

const supabase = createClient(
    supabaseUrl || "https://placeholder.supabase.co",
    supabaseKey || "placeholder"
);

module.exports = supabase;
