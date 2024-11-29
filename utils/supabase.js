
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vbugnnbwgihnfsjygsgl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZidWdubmJ3Z2lobmZzanlnc2dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4ODA0NjYsImV4cCI6MjA0ODQ1NjQ2Nn0.vFGCGdHc8fva0I1yCmZkZ6UisuLIcxtso9O369_Z8QU'
export const supabase = createClient(supabaseUrl, supabaseKey)