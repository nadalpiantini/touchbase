#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedSimple() {
  console.log('\n🎭 Seed simplificado - usando API de games existente...\n');

  try {
    // 1. Obtener torneo existente
    const { data: tournament } = await supabase
      .from('touchbase_tournaments')
      .select('*')
      .eq('name', 'Spring Championship 2025')
      .single();

    if (!tournament) {
      console.error('❌ No se encontró el torneo');
      return;
    }

    console.log(`✅ Torneo: ${tournament.name} (ID: ${tournament.id})`);

    // 2. Obtener equipos existentes usando la API de /api/teams/list
    console.log('\n🏆 Obteniendo equipos existentes...');
    const teamsRes = await fetch('http://localhost:3000/api/teams/list');
    const teamsData = await teamsRes.json();

    if (!teamsData.teams || teamsData.teams.length < 4) {
      console.log('⚠️  Necesitas al menos 4 equipos. Creando equipos de ejemplo via API...');

      const teamNames = ['Tigres', 'Águilas', 'Leones', 'Tiburones', 'Panthers', 'Halcones'];
      const createdTeams = [];

      for (const name of teamNames) {
        const response = await fetch('http://localhost:3000/api/teams/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, category: 'U14' })
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`  ✅ ${name} creado`);
          createdTeams.push(data.team);
        } else {
          console.log(`  ⚠️  ${name} - error:`, await response.text());
        }
      }

      teamsData.teams = createdTeams;
    }

    const teams = teamsData.teams.slice(0, 6);
    console.log(`✅ ${teams.length} equipos disponibles`);

    // 3. Asignar equipos al torneo
    console.log('\n🎯 Asignando equipos al torneo...');
    for (let i = 0; i < teams.length; i++) {
      const { error } = await supabase
        .from('touchbase_tournament_teams')
        .upsert({
          tournament_id: tournament.id,
          team_id: teams[i].id,
          seed: i + 1
        }, {
          onConflict: 'tournament_id,team_id'
        });

      if (error) {
        console.log(`  ⚠️  ${teams[i].name}:`, error.message);
      } else {
        console.log(`  ✅ ${teams[i].name} (seed ${i + 1})`);
      }
    }

    // 4. Generar partidos round-robin
    console.log('\n⚾ Generando partidos...');
    const matches = [];
    let matchNumber = 1;

    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        // Simular algunos partidos ya jugados
        const isPlayed = matchNumber <= 8;
        const homeScore = isPlayed ? Math.floor(Math.random() * 8) + 2 : 0;
        const awayScore = isPlayed ? Math.floor(Math.random() * 8) + 2 : 0;

        matches.push({
          tournament_id: tournament.id,
          round: 1,
          match_number: matchNumber++,
          team_home: teams[i].id,
          team_away: teams[j].id,
          scheduled_at: new Date(2025, 2, 1 + Math.floor((matchNumber - 1) / 3)).toISOString(),
          venue: `Campo ${((matchNumber - 1) % 3) + 1}`,
          status: isPlayed ? 'completed' : 'scheduled',
          score_home: homeScore,
          score_away: awayScore,
          winner_team_id: isPlayed && homeScore !== awayScore
            ? (homeScore > awayScore ? teams[i].id : teams[j].id)
            : null,
          played_at: isPlayed ? new Date(2025, 2, 1 + Math.floor((matchNumber - 1) / 3)).toISOString() : null,
          completed_at: isPlayed ? new Date(2025, 2, 1 + Math.floor((matchNumber - 1) / 3), 14, 0).toISOString() : null
        });
      }
    }

    const { error: matchError } = await supabase
      .from('touchbase_matches')
      .upsert(matches, {
        onConflict: 'tournament_id,match_number'
      });

    if (matchError) {
      console.error('❌ Error creando partidos:', matchError.message);
    } else {
      console.log(`  ✅ ${matches.length} partidos generados`);
      console.log(`  ✅ ${matches.filter(m => m.status === 'completed').length} partidos completados`);
    }

    // 5. Intentar leer standings
    console.log('\n📊 Intentando leer clasificaciones...');
    const { data: standings, error: standingsError } = await supabase
      .from('touchbase_standings')
      .select('*')
      .eq('tournament_id', tournament.id)
      .order('win_percentage', { ascending: false });

    if (standingsError) {
      console.log('⚠️  Vista de standings no disponible:', standingsError.message);
      console.log('💡 Aplica la migración 004a_fix_standings.sql en Supabase SQL Editor');
    } else if (standings && standings.length > 0) {
      console.log('\n🏆 CLASIFICACIÓN:\n');
      console.log('Pos | Equipo            | PJ | G | P | Win%');
      console.log('----+-------------------+----+---+---+------');
      standings.forEach((s: any, idx: number) => {
        console.log(
          `${(idx + 1).toString().padStart(3)} | ${s.team_name.padEnd(17)} | ${s.games_played.toString().padStart(2)} | ${s.wins.toString().padStart(1)} | ${s.losses.toString().padStart(1)} | ${s.win_percentage.toFixed(1).padStart(4)}%`
        );
      });
    }

    console.log('\n✅ ¡Seed completado!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Verificar que el servidor esté corriendo
console.log('🔍 Verificando servidor local...');
fetch('http://localhost:3000')
  .then(() => {
    console.log('✅ Servidor local activo\n');
    seedSimple();
  })
  .catch(() => {
    console.error('❌ Servidor local no está corriendo. Ejecuta: npm run dev');
    process.exit(1);
  });
