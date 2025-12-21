
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lqqvmaxlufmhzyiawalq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxcXZtYXhsdWZtaHp5aWF3YWxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwODc1MzcsImV4cCI6MjA4MTY2MzUzN30.smXceeHiAna9N3wepRDdRDLWZdxq2h9ifqKIaG0NeOs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
