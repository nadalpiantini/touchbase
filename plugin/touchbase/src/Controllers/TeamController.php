<?php
declare(strict_types=1);

namespace TouchBase\Controllers;

use TouchBase\Database;
use TouchBase\Http\Request;
use TouchBase\Http\Response;

use function TouchBase\__;

/**
 * Team management controller
 * Handles CRUD operations for baseball teams
 */
final class TeamController
{
    /**
     * List all teams with club and season info
     *
     * @param Request $request
     * @return Response
     */
    public function index(Request $request): Response
    {
        $clubId = $request->input('club_id');
        $seasonId = $request->input('season_id');

        $sql = 'SELECT t.*, c.name AS club_name, s.name AS season_name
                FROM pelota_teams t
                JOIN pelota_clubs c ON c.id = t.club_id
                JOIN pelota_seasons s ON s.id = t.season_id';

        $params = [];
        $where = [];

        if ($clubId) {
            $where[] = 't.club_id = ?';
            $params[] = (int) $clubId;
        }

        if ($seasonId) {
            $where[] = 't.season_id = ?';
            $params[] = (int) $seasonId;
        }

        if ($where) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }

        $sql .= ' ORDER BY t.id DESC LIMIT 200';

        $teams = Database::fetchAll($sql, $params);

        return Response::json([
            'success' => true,
            'data' => $teams,
            'count' => count($teams),
        ]);
    }

    /**
     * Get single team by ID
     *
     * @param Request $request
     * @param array<string, string> $params
     * @return Response
     */
    public function show(Request $request, array $params): Response
    {
        $id = (int) $params['id'];

        $team = Database::fetchOne(
            'SELECT t.*, c.name AS club_name, s.name AS season_name
             FROM pelota_teams t
             JOIN pelota_clubs c ON c.id = t.club_id
             JOIN pelota_seasons s ON s.id = t.season_id
             WHERE t.id = ?',
            [$id]
        );

        if (!$team) {
            return Response::error(__('error.team_not_found'), 404);
        }

        return Response::json([
            'success' => true,
            'data' => $team,
        ]);
    }

    /**
     * Create new team
     *
     * @param Request $request
     * @return Response
     */
    public function store(Request $request): Response
    {
        $clubId = (int) $request->input('club_id');
        $seasonId = (int) $request->input('season_id');
        $name = trim((string) $request->input('name'));
        $category = trim((string) $request->input('category'));

        // Validation
        if (!$name) {
            return Response::error(__('error.team_name_required'), 400);
        }

        if (!$category) {
            return Response::error(__('error.team_category_required'), 400);
        }

        Database::execute(
            'INSERT INTO pelota_teams (club_id, season_id, name, category)
             VALUES (?, ?, ?, ?)',
            [$clubId, $seasonId, $name, $category]
        );

        $id = Database::lastInsertId();

        return Response::json([
            'success' => true,
            'message' => __('success.team_created'),
            'id' => $id,
        ], 201);
    }

    /**
     * Update existing team
     *
     * @param Request $request
     * @param array<string, string> $params
     * @return Response
     */
    public function update(Request $request, array $params): Response
    {
        $id = (int) $params['id'];
        $name = trim((string) $request->input('name'));
        $category = trim((string) $request->input('category'));

        if (!$name) {
            return Response::error(__('error.team_name_required'), 400);
        }

        Database::execute(
            'UPDATE pelota_teams SET name = ?, category = ? WHERE id = ?',
            [$name, $category, $id]
        );

        return Response::json([
            'success' => true,
            'message' => __('success.team_updated'),
        ]);
    }

    /**
     * Delete team
     *
     * @param Request $request
     * @param array<string, string> $params
     * @return Response
     */
    public function destroy(Request $request, array $params): Response
    {
        $id = (int) $params['id'];

        $affected = Database::execute('DELETE FROM pelota_teams WHERE id = ?', [$id]);

        if ($affected === 0) {
            return Response::error(__('error.team_not_found'), 404);
        }

        return Response::json([
            'success' => true,
            'message' => __('success.team_deleted'),
        ]);
    }
}
