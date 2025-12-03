#!/usr/bin/env node

/**
 * Ejecuta la migración usando Supabase REST API
 * Usa la función RPC o ejecuta SQL directamente
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const MIGRATION_FILE = path.join(__dirname, '../supabase/migrations/20251203205054_expand_players_teachers.sql');
const SUPABASE_URL = 'https://nqzhxukuvmdlpewqytpv.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE || '';

console.log('🚀 Ejecutando migración directamente...\n');

// Leer SQL
const sql = fs.readFileSync(MIGRATION_FILE, 'utf8');

// Dividir en statements individuales (aproximado)
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log(`📊 Encontrados ${statements.length} statements SQL\n`);

// Nota: Supabase REST API no permite ejecutar SQL arbitrario por seguridad
// Necesitamos usar el dashboard o psql

console.log('⚠️  La API REST de Supabase no permite ejecutar SQL arbitrario.\n');
console.log('📋 Ejecutando vía Dashboard (método recomendado):\n');
console.log('1. Abre: https://supabase.com/dashboard/project/nqzhxukuvmdlpewqytpv/sql/new\n');
console.log('2. Pega este SQL:\n');
console.log('─'.repeat(60));
console.log(sql);
console.log('─'.repeat(60));
console.log('\n3. Haz clic en "Run"\n');

// Intentar abrir el dashboard automáticamente si estamos en macOS
if (process.platform === 'darwin') {
  const { exec } = require('child_process');
  exec('open "https://supabase.com/dashboard/project/nqzhxukuvmdlpewqytpv/sql/new"', (error) => {
    if (!error) {
      console.log('✅ Dashboard abierto en el navegador\n');
    }
  });
}

