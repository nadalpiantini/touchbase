import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('\n🔍 Verificando esquema real de Supabase...\n');

  // Verificar qué tablas existen
  const tables = [
    'touchbase_teams',
    'touchbase_clubs',
    'touchbase_organizations',
    'touchbase_seasons',
    'touchbase_tournaments',
    'touchbase_tournament_teams',
    'touchbase_matches'
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: existe (${data?.length || 0} filas de muestra)`);
        if (data && data.length > 0) {
          console.log(`   Campos:`, Object.keys(data[0]).join(', '));
        }
      }
    } catch (e: any) {
      console.log(`❌ ${table}: Error - ${e.message}`);
    }
  }
}

checkSchema();
