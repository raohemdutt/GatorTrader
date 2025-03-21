import { createClient } from "@supabase/supabase-js";

const supabaseUrl: string = "https://asyqyhkknenywzvvpkcr.supabase.co";
const supabaseAnonKey: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzeXF5aGtrbmVueXd6dnZwa2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0OTMyODAsImV4cCI6MjA1ODA2OTI4MH0.7mO5PgSyq4n0NNAPnvwqWyG5xs1YTLDIkmJEntpBdg8";

// Define the Supabase client with TypeScript support
export const supabaseNew = createClient(supabaseUrl, supabaseAnonKey);
