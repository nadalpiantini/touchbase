#!/usr/bin/env node

/**
 * Script para ejecutar la migración SQL directamente usando Supabase REST API
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const MIGRATION_FILE = path.join(__dirname, '../supabase/migrations/20251203205054_expand_players_teachers.sql');
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nqzhxukuvmdlpewqytpv.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE || '';

console.log('🚀 Ejecutando migración: expand_players_teachers\n');

// Leer el archivo de migración
if (!fs.existsSync(MIGRATION_FILE)) {
  console.error('❌ Error: No se encontró el archivo de migración:', MIGRATION_FILE);
  process.exit(1);
}

const sql = fs.readFileSync(MIGRATION_FILE, 'utf8');

console.log('📄 Archivo de migración cargado');
console.log('📊 Tamaño:', sql.length, 'caracteres\n');

if (!SUPABASE_SERVICE_KEY) {
  console.log('⚠️  SUPABASE_SERVICE_ROLE no encontrado en variables de entorno');
  console.log('\n📋 INSTRUCCIONES MANUALES:');
  console.log('\n1. Ve a: https://supabase.com/dashboard/project/nqzhxukuvmdlpewqytpv');
  console.log('2. Navega a SQL Editor');
  console.log('3. Copia y pega el contenido de:', MIGRATION_FILE);
  console.log('4. Haz clic en "Run"\n');
  process.exit(0);
}

// Ejecutar usando Supabase REST API (rpc)
console.log('🔗 Conectando a Supabase...\n');

// Nota: La API REST de Supabase no permite ejecutar SQL arbitrario por seguridad
// Por lo tanto, debemos usar el dashboard o psql directamente
console.log('ℹ️  La API REST de Supabase no permite ejecutar SQL arbitrario por seguridad.');
console.log('\n📋 OPCIONES PARA EJECUTAR LA MIGRACIÓN:\n');
console.log('OPCIÓN 1 - Dashboard (Recomendado):');
console.log('  1. Ve a: https://supabase.com/dashboard/project/nqzhxukuvmdlpewqytpv');
console.log('  2. Navega a SQL Editor');
console.log('  3. Copia y pega el contenido de:', MIGRATION_FILE);
console.log('  4. Haz clic en "Run"\n');
console.log('OPCIÓN 2 - psql (si tienes la contraseña):');
console.log('  psql "postgresql://postgres:[PASSWORD]@db.nqzhxukuvmdlpewqytpv.supabase.co:5432/postgres" -f', MIGRATION_FILE);
console.log('\n');

// Mostrar un preview del SQL
console.log('📝 Preview del SQL (primeras 500 caracteres):');
console.log('─'.repeat(60));
console.log(sql.substring(0, 500) + '...\n');
console.log('─'.repeat(60));
console.log('\n✅ Script completado. Usa una de las opciones arriba para ejecutar la migración.\n');

