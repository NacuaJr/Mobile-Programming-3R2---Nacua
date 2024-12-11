
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xxssurkonmanzadomwxm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4c3N1cmtvbm1hbnphZG9td3htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5MTA0NTQsImV4cCI6MjA0OTQ4NjQ1NH0.VsGXcC3HvA-sy0h-Vle3FSeoJSqj-sTktLhT-cXEfcM'
export const supabase = createClient(supabaseUrl, supabaseKey)