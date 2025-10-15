<?php
declare(strict_types=1);

namespace TouchBase\Controllers;

use TouchBase\Database;
use TouchBase\Http\Request;
use TouchBase\Http\Response;

use function TouchBase\__;

/**
 * Standings Controller
 * Provides real-time tournament and season standings
 */
final class StandingsController
{
    /**
     * Get standings for a season or tournament
     *
     * @param Request $request
     * @return Response
     */
    public function index(Request $request): Response
    {
        $seasonId = $request->input('season_id');
        $tournamentId = $request->input('tournament_id');
        $orderBy = $request->input('order_by', 'win_percentage'); // win_percentage, run_differential, wins

        if (!$seasonId && !$tournamentId) {
            return Response::error('season_id or tournament_id required', 400);
        }

        $sql = 'SELECT * FROM pelota_standings WHERE 1=1';
        $params = [];

        if ($seasonId) {
            $sql .= ' AND season_id = ?';
            $params[] = (int) $seasonId;
        }

        if ($tournamentId) {
            $sql .= ' AND tournament_id = ?';
            $params[] = (int) $tournamentId;
        }

        // Order by specified criteria
        $sql .= match($orderBy) {
            'wins' => ' ORDER BY wins DESC, run_differential DESC, team_name ASC',
            'run_differential' => ' ORDER BY run_differential DESC, wins DESC, team_name ASC',
            'win_percentage' => ' ORDER BY win_percentage DESC, wins DESC, run_differential DESC, team_name ASC',
            default => ' ORDER BY win_percentage DESC, wins DESC, run_differential DESC, team_name ASC',
        };

        $standings = Database::fetchAll($sql, $params);

        // Add rank to each team
        foreach ($standings as $index => $standing) {
            $standings[$index]['rank'] = $index + 1;
        }

        return Response::json([
            'success' => true,
            'data' => $standings,
            'count' => count($standings),
            'order_by' => $orderBy,
        ]);
    }

    /**
     * Get head-to-head record between two teams
     *
     * @param Request $request
     * @return Response
     */
    public function headToHead(Request $request): Response
    {
        $team1 = (int) $request->input('team1_id');
        $team2 = (int) $request->input('team2_id');
        $seasonId = $request->input('season_id');

        if (!$team1 || !$team2) {
            return Response::error('team1_id and team2_id required', 400);
        }

        $sql = 'SELECT m.*,
                t1.name AS team1_name,
                t2.name AS team2_name
                FROM pelota_matches m
                JOIN pelota_teams t1 ON (t1.id = ? OR t1.id = ?)
                JOIN pelota_teams t2 ON (t2.id = ? OR t2.id = ?)
                WHERE m.status = "completed"
                AND ((m.team_home = ? AND m.team_away = ?) OR (m.team_home = ? AND m.team_away = ?))';

        $params = [$team1, $team2, $team1, $team2, $team1, $team2, $team2, $team1];

        if ($seasonId) {
            $sql .= ' AND m.tournament_id IN (SELECT id FROM pelota_tournaments WHERE season_id = ?)';
            $params[] = (int) $seasonId;
        }

        $sql .= ' ORDER BY m.completed_at DESC';

        $matches = Database::fetchAll($sql, $params);

        // Calculate head-to-head stats
        $team1Wins = 0;
        $team2Wins = 0;
        $ties = 0;
        $team1RunsFor = 0;
        $team1RunsAgainst = 0;

        foreach ($matches as $match) {
            if ($match['winner_team_id'] == $team1) {
                $team1Wins++;
            } elseif ($match['winner_team_id'] == $team2) {
                $team2Wins++;
            } else {
                $ties++;
            }

            if ($match['team_home'] == $team1) {
                $team1RunsFor += $match['score_home'];
                $team1RunsAgainst += $match['score_away'];
            } else {
                $team1RunsFor += $match['score_away'];
                $team1RunsAgainst += $match['score_home'];
            }
        }

        return Response::json([
            'success' => true,
            'data' => [
                'team1_id' => $team1,
                'team2_id' => $team2,
                'team1_wins' => $team1Wins,
                'team2_wins' => $team2Wins,
                'ties' => $ties,
                'total_games' => count($matches),
                'team1_runs_for' => $team1RunsFor,
                'team1_runs_against' => $team1RunsAgainst,
                'matches' => $matches,
            ],
        ]);
    }

    /**
     * Get league leaders (top performers)
     *
     * @param Request $request
     * @return Response
     */
    public function leaders(Request $request): Response
    {
        $seasonId = $request->input('season_id');
        $tournamentId = $request->input('tournament_id');
        $limit = (int) $request->input('limit', 10);

        if (!$seasonId && !$tournamentId) {
            return Response::error('season_id or tournament_id required', 400);
        }

        $sql = 'SELECT * FROM pelota_standings WHERE 1=1';
        $params = [];

        if ($seasonId) {
            $sql .= ' AND season_id = ?';
            $params[] = (int) $seasonId;
        }

        if ($tournamentId) {
            $sql .= ' AND tournament_id = ?';
            $params[] = (int) $tournamentId;
        }

        // Get top teams by various metrics
        $leaders = [
            'most_wins' => Database::fetchAll($sql . ' ORDER BY wins DESC LIMIT ?', array_merge($params, [$limit])),
            'best_run_diff' => Database::fetchAll($sql . ' ORDER BY run_differential DESC LIMIT ?', array_merge($params, [$limit])),
            'highest_win_pct' => Database::fetchAll($sql . ' AND games_played >= 3 ORDER BY win_percentage DESC LIMIT ?', array_merge($params, [$limit])),
            'most_runs_scored' => Database::fetchAll($sql . ' ORDER BY runs_for DESC LIMIT ?', array_merge($params, [$limit])),
        ];

        return Response::json([
            'success' => true,
            'data' => $leaders,
        ]);
    }
}
