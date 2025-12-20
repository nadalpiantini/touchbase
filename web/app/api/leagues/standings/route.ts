import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(req.url);
    const tournamentId = searchParams.get('tournamentId');

    // Intentar usar la vista de standings
    let query = supabase.from('touchbase_standings').select('*');

    if (tournamentId) {
      query = query.eq('tournament_id', parseInt(tournamentId));
    }

    query = query.order('win_percentage', { ascending: false });

    const { data, error } = await query;

    if (error) {
      // Si la vista no existe, devolver error explicativo
      if (error.message.includes('does not exist')) {
        return NextResponse.json({
          error: 'Vista de clasificaciones no disponible',
          hint: 'Aplica la migración 004a_fix_standings.sql en Supabase',
          standings: []
        }, { status: 503 });
      }

      return NextResponse.json({
        error: error.message,
        standings: []
      }, { status: 500 });
    }

    return NextResponse.json({
      standings: data || []
    });

  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      standings: []
    }, { status: 500 });
  }
}
