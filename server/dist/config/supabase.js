"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const supabase_js_1 = require("@supabase/supabase-js");
const { SUPABASE_API_URL = "", SUPABASE_API_KEY = "" } = process.env;
const supabase = (0, supabase_js_1.createClient)(SUPABASE_API_URL, SUPABASE_API_KEY);
exports.default = supabase;
//# sourceMappingURL=supabase.js.map