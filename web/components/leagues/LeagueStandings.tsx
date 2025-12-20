"use client";
import { useEffect, useState } from "react";
import { useTranslations } from 'next-intl';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';

type Standing = {
  team_id: number;
  team_name: string;
  tournament_name: string;
  games_played: number;
  wins: number;
  losses: number;
  ties: number;
  runs_for: number;
  runs_against: number;
  run_differential: number;
  win_percentage: number;
};

export default function LeagueStandings({ tournamentId }: { tournamentId?: number }) {
  const t = useTranslations('leagues');
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStandings() {
      try {
        const url = tournamentId
          ? `/api/leagues/standings?tournamentId=${tournamentId}`
          : '/api/leagues/standings';

        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Error cargando clasificaciones');
          return;
        }

        setStandings(data.standings || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadStandings();
  }, [tournamentId]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tb-navy mx-auto"></div>
        <p className="mt-4 text-tb-shadow font-sans">{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-tb-stitch/10 rounded-lg">
        <p className="text-tb-stitch font-sans">{error}</p>
      </div>
    );
  }

  if (standings.length === 0) {
    return (
      <div className="p-8 text-center bg-tb-beige rounded-lg">
        <p className="text-tb-shadow font-sans">{t('noData')}</p>
        <p className="text-sm text-tb-shadow/70 mt-2 font-sans">{t('noDataHint')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table className="font-sans">
        <TableHeader>
          <TableRow>
            <TableHead className="font-display font-semibold text-tb-navy w-16">Pos</TableHead>
            <TableHead className="font-display font-semibold text-tb-navy">Equipo</TableHead>
            <TableHead className="font-display font-semibold text-tb-navy text-center">PJ</TableHead>
            <TableHead className="font-display font-semibold text-tb-navy text-center">G</TableHead>
            <TableHead className="font-display font-semibold text-tb-navy text-center">P</TableHead>
            <TableHead className="font-display font-semibold text-tb-navy text-center">E</TableHead>
            <TableHead className="font-display font-semibold text-tb-navy text-center">RF</TableHead>
            <TableHead className="font-display font-semibold text-tb-navy text-center">RC</TableHead>
            <TableHead className="font-display font-semibold text-tb-navy text-center">Dif</TableHead>
            <TableHead className="font-display font-semibold text-tb-navy text-center">%</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {standings.map((s, idx) => (
            <TableRow key={s.team_id}>
              <TableCell className="font-display font-bold text-tb-navy text-center">
                {idx + 1}
              </TableCell>
              <TableCell className="font-sans font-medium text-tb-ink">
                {s.team_name}
              </TableCell>
              <TableCell className="text-center font-sans text-tb-ink">{s.games_played}</TableCell>
              <TableCell className="text-center font-sans text-green-600 font-semibold">{s.wins}</TableCell>
              <TableCell className="text-center font-sans text-red-600 font-semibold">{s.losses}</TableCell>
              <TableCell className="text-center font-sans text-tb-shadow">{s.ties}</TableCell>
              <TableCell className="text-center font-sans text-tb-ink">{s.runs_for}</TableCell>
              <TableCell className="text-center font-sans text-tb-ink">{s.runs_against}</TableCell>
              <TableCell className={`text-center font-sans font-semibold ${
                s.run_differential > 0 ? 'text-green-600' : s.run_differential < 0 ? 'text-red-600' : 'text-tb-shadow'
              }`}>
                {s.run_differential > 0 ? '+' : ''}{s.run_differential}
              </TableCell>
              <TableCell className="text-center font-display font-bold text-tb-navy">
                {s.win_percentage.toFixed(1)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
