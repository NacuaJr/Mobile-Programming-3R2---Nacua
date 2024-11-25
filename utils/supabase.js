import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://coutzrbhhvufbzkjflqu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvdXR6cmJoaHZ1ZmJ6a2pmbHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUyNzgyMTMsImV4cCI6MjA0MDg1NDIxM30.nf8LOq6xlHPTYgEO8zMwkJPRQxhXeD2tdRP4wrex4kc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);