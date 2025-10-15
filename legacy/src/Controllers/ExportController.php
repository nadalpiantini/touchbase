<?php
declare(strict_types=1);

namespace TouchBase\Controllers;

use TouchBase\Database;
use TouchBase\Http\Request;
use TouchBase\Http\Response;
use TouchBase\Middleware\Auth;

/**
 * CSV Export controller
 * Handles data exports for roster and schedule
 */
final class ExportController
{
    /**
     * Export roster to CSV
     *
     * @param Request $request
     * @return Response
     */
    public function roster(Request $request): Response
    {
        Auth::requireRole(['coach', 'admin']);

        $teamId = (int) $request->input('team_id');
        if (!$teamId) {
            return new Response('Team ID required', 400);
        }

        $rows = Database::fetchAll(
            'SELECT user_id, number, position, notes
             FROM pelota_roster
             WHERE team_id = ?
             ORDER BY CAST(number AS UNSIGNED), user_id',
            [$teamId]
        );

        $csv = $this->arrayToCsv([
            ['user_id', 'number', 'position', 'notes'],
            ...array_map(fn($row) => [
                $row['user_id'],
                $row['number'] ?? '',
                $row['position'] ?? '',
                $row['notes'] ?? '',
            ], $rows),
        ]);

        return new Response($csv, 200, [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="roster-team-' . $teamId . '.csv"',
        ]);
    }

    /**
     * Export schedule to CSV
     *
     * @param Request $request
     * @return Response
     */
    public function schedule(Request $request): Response
    {
        Auth::requireRole(['coach', 'admin']);

        $teamId = (int) $request->input('team_id');
        if (!$teamId) {
            return new Response('Team ID required', 400);
        }

        $rows = Database::fetchAll(
            'SELECT type, opponent, venue, start_at, end_at, notes
             FROM pelota_schedule
             WHERE team_id = ?
             ORDER BY start_at',
            [$teamId]
        );

        $csv = $this->arrayToCsv([
            ['type', 'opponent', 'venue', 'start_at', 'end_at', 'notes'],
            ...array_map(fn($row) => [
                $row['type'],
                $row['opponent'] ?? '',
                $row['venue'] ?? '',
                $row['start_at'],
                $row['end_at'] ?? '',
                $row['notes'] ?? '',
            ], $rows),
        ]);

        return new Response($csv, 200, [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="schedule-team-' . $teamId . '.csv"',
        ]);
    }

    /**
     * Convert array of rows to CSV string
     *
     * @param array<array<string>> $rows
     * @return string
     */
    private function arrayToCsv(array $rows): string
    {
        $handle = fopen('php://temp', 'r+');

        foreach ($rows as $row) {
            fputcsv($handle, $row);
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return $csv;
    }
}
