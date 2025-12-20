import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTournaments() {
  console.log('\n🔍 Verificando datos de torneos y partidos...\n');

  // Verificar torneos
  const { data: tournaments, error: tournamentsError } = await supabase
    .from('touchbase_tournaments')
    .select('*');

  if (tournamentsError) {
    console.log('❌ Error al leer torneos:', tournamentsError.message);
  } else {
    console.log(`📊 Torneos encontrados: ${tournaments?.length || 0}`);
    if (tournaments && tournaments.length > 0) {
      tournaments.forEach(t => {
        console.log(`  - ID: ${t.id}, Nombre: ${t.name}, Formato: ${t.format}, Estado: ${t.status}`);
      });
    }
  }

  // Verificar teams en torneos
  const { data: tournamentTeams, error: ttError } = await supabase
    .from('touchbase_tournament_teams')
    .select('*');

  if (ttError) {
    console.log('❌ Error al leer equipos de torneos:', ttError.message);
  } else {
    console.log(`\n🏆 Equipos en torneos: ${tournamentTeams?.length || 0}`);
    if (tournamentTeams && tournamentTeams.length > 0) {
      tournamentTeams.forEach(tt => {
        console.log(`  - Torneo: ${tt.tournament_id}, Equipo: ${tt.team_id}, Grupo: ${tt.group_name || 'N/A'}, Seed: ${tt.seed || 'N/A'}`);
      });
    }
  }

  // Verificar matches
  const { data: matches, error: matchesError } = await supabase
    .from('touchbase_matches')
    .select('*');

  if (matchesError) {
    console.log('❌ Error al leer matches:', matchesError.message);
  } else {
    console.log(`\n⚾ Matches encontrados: ${matches?.length || 0}`);
    if (matches && matches.length > 0) {
      matches.forEach(m => {
        console.log(`  - ID: ${m.id}, Torneo: ${m.tournament_id}, Round: ${m.round || 'N/A'}, Status: ${m.status}`);
        console.log(`    Home: ${m.team_home} (${m.score_home}) vs Away: ${m.team_away} (${m.score_away})`);
      });
    }
  }

  // Verificar games (tabla regular de partidos)
  const { data: games, error: gamesError } = await supabase
    .from('touchbase_games')
    .select('*');

  if (gamesError) {
    console.log('❌ Error al leer games:', gamesError.message);
  } else {
    console.log(`\n🎮 Games (partidos regulares) encontrados: ${games?.length || 0}`);
    if (games && games.length > 0) {
      games.slice(0, 5).forEach(g => {
        console.log(`  - ID: ${g.id}, Home: ${g.home_team_id} (${g.home_score}) vs Away: ${g.away_team_id} (${g.away_score}), Status: ${g.status}`);
      });
      if (games.length > 5) {
        console.log(`  ... y ${games.length - 5} más`);
      }
    }
  }

  // Verificar vista de standings
  const { data: standings, error: standingsError } = await supabase
    .from('touchbase_standings')
    .select('*');

  if (standingsError) {
    console.log('❌ Error al leer standings:', standingsError.message);
  } else {
    console.log(`\n📈 Standings (clasificaciones) encontrados: ${standings?.length || 0}`);
    if (standings && standings.length > 0) {
      standings.slice(0, 5).forEach(s => {
        console.log(`  - Team: ${s.team_name}, Torneo: ${s.tournament_name || 'N/A'}, W-L: ${s.wins}-${s.losses}, Win%: ${s.win_percentage}`);
      });
    }
  }

  console.log('\n✅ Verificación completada\n');
}

checkTournaments().catch(console.error);
