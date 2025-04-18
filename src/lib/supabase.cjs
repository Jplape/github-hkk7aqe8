"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = exports.getSupabaseClient = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
// Type-safe configuration check
const getSupabaseConfig = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
        throw new Error(`
      Missing Supabase configuration.
      Please ensure your .env file contains:
      VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
    `);
    }
    return { supabaseUrl, supabaseKey };
};
// Singleton pattern with enhanced checks
let supabaseInstance = null;
const getSupabaseClient = () => {
    if (supabaseInstance) {
        // Check session validity using getSession() which returns a Promise
        supabaseInstance.auth.getSession()
            .then(({ data: { session } }) => {
            if (!session) {
                supabaseInstance = null;
            }
        })
            .catch(() => {
            supabaseInstance = null;
        });
    }
    if (!supabaseInstance) {
        const { supabaseUrl, supabaseKey } = getSupabaseConfig();
        supabaseInstance = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true,
                storageKey: 'supabase.auth.token',
                flowType: 'pkce' // More secure auth flow
            },
            global: {
                headers: {
                    'X-Client-Info': 'my-app/1.0'
                }
            }
        });
    }
    return supabaseInstance;
};
exports.getSupabaseClient = getSupabaseClient;
// Default exported client instance with memoization
exports.supabase = (0, exports.getSupabaseClient)();
