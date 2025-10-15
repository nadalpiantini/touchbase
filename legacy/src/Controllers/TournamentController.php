<?php
declare(strict_types=1);

namespace TouchBase\Controllers;

use TouchBase\Database;
use TouchBase\Http\Request;
use TouchBase\Http\Response;
use TouchBase\Middleware\Auth;
use TouchBase\Services\BracketGenerator;

use function TouchBase\__;

/**
 * Tournament Management Controller
 * Handles tournament CRUD and bracket generation
 */
final class TournamentController
{
    /**
     * List all tournaments
     *
     * @param Request $request
     * @return Response
     */
    public function index(Request $request): Response
    {
        $seasonId = $request->input('season_id');
        $status = $request->input('status');

        $sql = 'SELECT t.*, s.name AS season_name,
                COUNT(DISTINCT tt.team_id) AS teams_count,
                COUNT(DISTINCT m.id) AS matches_count,
                COUNT(DISTINCT CASE WHEN m.status = "completed" THEN m.id END) AS matches_completed
                FROM touchbase_tournaments t
                JOIN touchbase_seasons s ON s.id = t.season_id
                LEFT JOIN touchbase_tournament_teams tt ON tt.tournament_id = t.id
                LEFT JOIN touchbase_matches m ON m.tournament_id = t.id';

        $params = [];
        $where = [];

        if ($seasonId) {
            $where[] = 't.season_id = ?';
            $params[] = (int) $seasonId;
        }

        if ($status) {
            $where[] = 't.status = ?';
            $params[] = (string) $status;
        }

        if ($where) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }

        $sql .= ' GROUP BY t.id, s.name ORDER BY t.start_date DESC, t.id DESC LIMIT 100';

        $tournaments = Database::fetchAll($sql, $params);

        return Response::json([
            'success' => true,
            'data' => $tournaments,
            'count' => count($tournaments),
        ]);
    }

    /**
     * Get single tournament with details
     *
     * @param Request $request
     * @param array<string, string> $params
     * @return Response
     */
    public function show(Request $request, array $params): Response
    {
        $id = (int) $params['id'];

        $tournament = Database::fetchOne(
            'SELECT t.*, s.name AS season_name
             FROM touchbase_tournaments t
             JOIN touchbase_seasons s ON s.id = t.season_id
             WHERE t.id = ?',
            [$id]
        );

        if (!$tournament) {
            return Response::error(__('error.tournament_not_found'), 404);
        }

        // Get participating teams
        $teams = Database::fetchAll(
            'SELECT tt.*, t.name AS team_name, t.category
             FROM touchbase_tournament_teams tt
             JOIN touchbase_teams t ON t.id = tt.team_id
             WHERE tt.tournament_id = ?
             ORDER BY tt.seed ASC, tt.group_name ASC',
            [$id]
        );

        // Get matches
        $matches = Database::fetchAll(
            'SELECT m.*,
             th.name AS home_team_name, ta.name AS away_team_name
             FROM touchbase_matches m
             JOIN touchbase_teams th ON th.id = m.team_home
             JOIN touchbase_teams ta ON ta.id = m.team_away
             WHERE m.tournament_id = ?
             ORDER BY m.round ASC, m.match_number ASC',
            [$id]
        );

        $tournament['teams'] = $teams;
        $tournament['matches'] = $matches;

        return Response::json([
            'success' => true,
            'data' => $tournament,
        ]);
    }

    /**
     * Create new tournament
     *
     * @param Request $request
     * @return Response
     */
    public function store(Request $request): Response
    {
        Auth::requireRole(['admin', 'coach']);

        $seasonId = (int) $request->input('season_id');
        $name = trim((string) $request->input('name'));
        $format = trim((string) $request->input('format', 'round_robin'));
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        if (!$name) {
            return Response::error(__('error.tournament_name_required'), 400);
        }

        if (!in_array($format, ['round_robin', 'knockout', 'groups_knockout', 'double_elimination'])) {
            return Response::error('Invalid tournament format', 400);
        }

        Database::execute(
            'INSERT INTO touchbase_tournaments (season_id, name, format, start_date, end_date, status)
             VALUES (?, ?, ?, ?, ?, ?)',
            [$seasonId, $name, $format, $startDate, $endDate, 'draft']
        );

        $id = Database::lastInsertId();

        return Response::json([
            'success' => true,
            'message' => __('success.tournament_created'),
            'id' => $id,
        ], 201);
    }

    /**
     * Update tournament
     *
     * @param Request $request
     * @param array<string, string> $params
     * @return Response
     */
    public function update(Request $request, array $params): Response
    {
        Auth::requireRole(['admin', 'coach']);

        $id = (int) $params['id'];
        $name = trim((string) $request->input('name'));
        $status = $request->input('status');

        Database::execute(
            'UPDATE touchbase_tournaments SET name = ?, status = ? WHERE id = ?',
            [$name, $status, $id]
        );

        return Response::json([
            'success' => true,
            'message' => __('success.tournament_updated'),
        ]);
    }

    /**
     * Delete tournament
     *
     * @param Request $request
     * @param array<string, string> $params
     * @return Response
     */
    public function destroy(Request $request, array $params): Response
    {
        Auth::requireRole(['admin']);

        $id = (int) $params['id'];

        Database::execute('DELETE FROM touchbase_tournaments WHERE id = ?', [$id]);

        return Response::json([
            'success' => true,
            'message' => __('success.tournament_deleted'),
        ]);
    }

    /**
     * Add team to tournament
     *
     * @param Request $request
     * @param array<string, string> $params
     * @return Response
     */
    public function addTeam(Request $request, array $params): Response
    {
        Auth::requireRole(['admin', 'coach']);

        $tournamentId = (int) $params['id'];
        $teamId = (int) $request->input('team_id');
        $seed = $request->input('seed');
        $groupName = $request->input('group_name');

        Database::execute(
            'INSERT INTO touchbase_tournament_teams (tournament_id, team_id, seed, group_name)
             VALUES (?, ?, ?, ?)',
            [$tournamentId, $teamId, $seed, $groupName]
        );

        return Response::json([
            'success' => true,
            'message' => 'Team added to tournament',
        ], 201);
    }

    /**
     * Generate tournament brackets
     *
     * @param Request $request
     * @param array<string, string> $params
     * @return Response
     */
    public function generateBracket(Request $request, array $params): Response
    {
        Auth::requireRole(['admin', 'coach']);

        $tournamentId = (int) $params['id'];
        $generator = new BracketGenerator();

        $result = $generator->generate($tournamentId);

        if (empty($result['success'])) {
            return Response::error($result['error'] ?? 'Failed to generate bracket', 400);
        }

        return Response::json($result);
    }

    /**
     * Schedule tournament matches
     *
     * @param Request $request
     * @param array<string, string> $params
     * @return Response
     */
    public function scheduleMatches(Request $request, array $params): Response
    {
        Auth::requireRole(['admin', 'coach']);

        $tournamentId = (int) $params['id'];
        $startDate = $request->input('start_date');
        $matchesPerDay = (int) $request->input('matches_per_day', 4);
        $playDays = $request->input('play_days', ['Saturday', 'Sunday']);

        if (is_string($playDays)) {
            $playDays = explode(',', $playDays);
        }

        $generator = new BracketGenerator();
        $result = $generator->scheduleMatches($tournamentId, $startDate, $matchesPerDay, $playDays);

        return Response::json($result);
    }

    /**
     * Update match result
     *
     * @param Request $request
     * @param array<string, string> $params
     * @return Response
     */
    public function updateMatchResult(Request $request, array $params): Response
    {
        Auth::requireRole(['admin', 'coach']);

        $matchId = (int) $params['match_id'];
        $scoreHome = (int) $request->input('score_home');
        $scoreAway = (int) $request->input('score_away');

        $generator = new BracketGenerator();
        $result = $generator->updateMatchResult($matchId, $scoreHome, $scoreAway);

        return Response::json($result);
    }

    /**
     * Get tournament matches
     *
     * @param Request $request
     * @param array<string, string> $params
     * @return Response
     */
    public function getMatches(Request $request, array $params): Response
    {
        $tournamentId = (int) $params['id'];
        $round = $request->input('round');
        $status = $request->input('status');

        $sql = 'SELECT m.*,
                th.name AS home_team_name, th.category AS home_category,
                ta.name AS away_team_name, ta.category AS away_category
                FROM touchbase_matches m
                JOIN touchbase_teams th ON th.id = m.team_home
                JOIN touchbase_teams ta ON ta.id = m.team_away
                WHERE m.tournament_id = ?';

        $params_sql = [$tournamentId];

        if ($round !== null) {
            $sql .= ' AND m.round = ?';
            $params_sql[] = (int) $round;
        }

        if ($status) {
            $sql .= ' AND m.status = ?';
            $params_sql[] = (string) $status;
        }

        $sql .= ' ORDER BY m.round ASC, m.match_number ASC, m.scheduled_at ASC';

        $matches = Database::fetchAll($sql, $params_sql);

        return Response::json([
            'success' => true,
            'data' => $matches,
            'count' => count($matches),
        ]);
    }
}
