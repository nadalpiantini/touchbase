import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTypes() {
  console.log('\n🔍 Inspeccionando tipos de columnas...\n');

  // Obtener una fila de ejemplo de cada tabla
  const tables = [
    { name: 'touchbase_teams', columns: ['id', 'name', 'club_id', 'season_id'] },
    { name: 'touchbase_tournament_teams', columns: ['id', 'tournament_id', 'team_id'] },
    { name: 'touchbase_tournaments', columns: ['id', 'season_id', 'name'] },
    { name: 'touchbase_matches', columns: ['id', 'tournament_id', 'team_home', 'team_away'] }
  ];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table.name)
      .select(table.columns.join(','))
      .limit(1);

    console.log(`\n📋 ${table.name}:`);

    if (error) {
      console.log(`  ❌ Error: ${error.message}`);
      continue;
    }

    if (!data || data.length === 0) {
      console.log(`  ⚠️  Tabla vacía - no hay datos para inspeccionar`);

      // Intentar crear un registro temporal para ver el tipo
      console.log(`  💡 Intentando inferir tipos del schema...`);
      continue;
    }

    const row = data[0];
    console.log(`  Datos de ejemplo:`, row);
    console.log(`  Tipos inferidos:`);

    for (const col of table.columns) {
      const value = (row as unknown as Record<string, unknown>)[col];
      const jsType = typeof value;
      const detailedType =
        value === null ? 'null' :
        typeof value === 'string' && value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? 'uuid (string)' :
        typeof value === 'number' && Number.isInteger(value) ? 'integer' :
        typeof value === 'number' ? 'numeric' :
        jsType;

      console.log(`    ${col}: ${detailedType} (ejemplo: ${value})`);
    }
  }

  console.log('\n✅ Inspección completada\n');
}

inspectTypes();
