#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Datos de equipos ficticios
const TEAMS = [
  { name: 'Tigres del Norte', short_name: 'TIG' },
  { name: 'Águilas Rojas', short_name: 'AGU' },
  { name: 'Leones Dorados', short_name: 'LEO' },
  { name: 'Tiburones Azules', short_name: 'TIB' },
  { name: 'Panthers Negros', short_name: 'PAN' },
  { name: 'Halcones Verdes', short_name: 'HAL' }
];

// Jugadores ficticios por equipo
const PLAYERS_PER_TEAM = [
  // Tigres
  ['Carlos "El Cañón" Martínez', 'Juan "Rayo" Pérez', 'Diego "Flash" Torres'],
  // Águilas
  ['Miguel "El Águila" Rodríguez', 'Pedro "Tornado" Sánchez', 'Luis "Trueno" Gómez'],
  // Leones
  ['Roberto "León" Hernández', 'Fernando "Garra" López', 'Andrés "Fiera" Díaz'],
  // Tiburones
  ['José "Tiburón" García', 'Manuel "Ola" Ramírez', 'Antonio "Mar" Cruz'],
  // Panthers
  ['Pablo "Pantera" Morales', 'Ricardo "Sombra" Ortiz', 'Javier "Negro" Ruiz'],
  // Halcones
  ['Santiago "Halcón" Vargas', 'Eduardo "Vuelo" Silva', 'Guillermo "Pico" Reyes']
];

async function seedTournament() {
  console.log('\n🎭 Iniciando creación de torneo con datos ficticios...\n');

  try {
    // 1. Obtener club y temporada
    const { data: clubs } = await supabase.from('touchbase_clubs').select('id').limit(1);
    const { data: seasons } = await supabase.from('touchbase_seasons').select('id').eq('name', '2025-2026').limit(1);

    if (!clubs?.length || !seasons?.length) {
      console.error('❌ No se encontró club o temporada');
      return;
    }

    const clubId = clubs[0].id;
    const seasonId = seasons[0].id;

    console.log(`✅ Usando club: ${clubId}, temporada: ${seasonId}`);

    // 2. Crear equipos
    console.log('\n🏆 Creando equipos...');
    const createdTeams: any[] = [];

    for (const team of TEAMS) {
      const { data, error } = await supabase
        .from('touchbase_teams')
        .insert({
          club_id: clubId,
          season_id: seasonId,
          name: team.name,
          category: 'U14' // Categoría por defecto
        })
        .select()
        .single();

      if (error) {
        console.log(`⚠️  Equipo ${team.name} ya existe o error:`, error.message);
        // Intentar obtener el existente
        const { data: existing } = await supabase
          .from('touchbase_teams')
          .select('*')
          .eq('name', team.name)
          .eq('season_id', seasonId)
          .single();
        if (existing) createdTeams.push(existing);
      } else {
        console.log(`  ✅ ${team.name}`);
        createdTeams.push(data);
      }
    }

    if (createdTeams.length < 6) {
      console.error('❌ No se pudieron crear todos los equipos');
      return;
    }

    // 3. Obtener torneo existente
    const { data: tournament } = await supabase
      .from('touchbase_tournaments')
      .select('*')
      .eq('name', 'Spring Championship 2025')
      .single();

    if (!tournament) {
      console.error('❌ No se encontró el torneo');
      return;
    }

    console.log(`\n✅ Torneo encontrado: ${tournament.name} (ID: ${tournament.id})`);

    // 4. Asignar equipos al torneo
    console.log('\n🎯 Asignando equipos al torneo...');
    for (let i = 0; i < createdTeams.length; i++) {
      const { error } = await supabase
        .from('touchbase_tournament_teams')
        .insert({
          tournament_id: tournament.id,
          team_id: createdTeams[i].id,
          seed: i + 1
        });

      if (error && !error.message.includes('duplicate')) {
        console.log(`  ⚠️  Error asignando ${createdTeams[i].name}:`, error.message);
      } else {
        console.log(`  ✅ ${createdTeams[i].name} (seed ${i + 1})`);
      }
    }

    // 5. Crear partidos round-robin (cada equipo juega con todos)
    console.log('\n⚾ Generando partidos (round-robin)...');
    const matches: any[] = [];
    let matchNumber = 1;

    for (let i = 0; i < createdTeams.length; i++) {
      for (let j = i + 1; j < createdTeams.length; j++) {
        matches.push({
          tournament_id: tournament.id,
          round: 1,
          match_number: matchNumber++,
          team_home: createdTeams[i].id,
          team_away: createdTeams[j].id,
          scheduled_at: new Date(2025, 2, 1 + Math.floor((matchNumber - 1) / 3)).toISOString(),
          venue: `Campo ${((matchNumber - 1) % 3) + 1}`,
          status: 'scheduled',
          score_home: 0,
          score_away: 0
        });
      }
    }

    // Simular algunos partidos jugados con scores aleatorios
    for (let i = 0; i < Math.min(8, matches.length); i++) {
      const homeScore = Math.floor(Math.random() * 8) + 2;
      const awayScore = Math.floor(Math.random() * 8) + 2;
      matches[i].status = 'completed';
      matches[i].score_home = homeScore;
      matches[i].score_away = awayScore;
      matches[i].winner_team_id = homeScore > awayScore ? matches[i].team_home : matches[i].team_away;
      matches[i].played_at = matches[i].scheduled_at;
      matches[i].completed_at = new Date(new Date(matches[i].scheduled_at).getTime() + 2 * 60 * 60 * 1000).toISOString();
    }

    const { error: matchError } = await supabase
      .from('touchbase_matches')
      .insert(matches);

    if (matchError) {
      console.error('❌ Error creando partidos:', matchError.message);
    } else {
      console.log(`  ✅ ${matches.length} partidos creados`);
      console.log(`  ✅ ${matches.filter(m => m.status === 'completed').length} partidos completados con scores`);
    }

    // 6. Verificar standings
    console.log('\n📊 Verificando clasificaciones...');
    const { data: standings, error: standingsError } = await supabase
      .from('touchbase_standings')
      .select('*')
      .eq('tournament_id', tournament.id)
      .order('win_percentage', { ascending: false });

    if (standingsError) {
      console.error('❌ Error leyendo standings:', standingsError.message);
    } else {
      console.log('\n🏆 CLASIFICACIÓN ACTUAL:\n');
      console.log('Pos | Equipo              | PJ | G | P | E | RF | RC | Dif | Win%');
      console.log('----+--------------------|----+---+---+---+----+----+-----+-----');
      standings?.forEach((s: any, idx: number) => {
        console.log(
          `${(idx + 1).toString().padStart(3)} | ${s.team_name.padEnd(18)} | ${s.games_played.toString().padStart(2)} | ${s.wins.toString().padStart(1)} | ${s.losses.toString().padStart(1)} | ${s.ties.toString().padStart(1)} | ${s.runs_for.toString().padStart(2)} | ${s.runs_against.toString().padStart(2)} | ${(s.run_differential >= 0 ? '+' : '') + s.run_differential.toString().padStart(3)} | ${s.win_percentage.toFixed(1)}%`
        );
      });
    }

    console.log('\n✅ ¡Torneo con datos ficticios creado exitosamente!\n');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

seedTournament();
