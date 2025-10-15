<?php
declare(strict_types=1);

namespace TouchBase\Controllers;

use TouchBase\Database;
use TouchBase\Http\Request;
use TouchBase\Http\Response;

use function TouchBase\__;

/**
 * Roster management controller
 * Links players (users) to teams
 */
final class RosterController
{
    /**
     * List roster entries with player details
     *
     * @param Request $request
     * @return Response
     */
    public function index(Request $request): Response
    {
        $teamId = (int) $request->input('team_id', 0);

        $sql = 'SELECT r.*, u.username, u.firstname, u.lastname
                FROM pelota_roster r
                JOIN user u ON u.user_id = r.user_id';

        $params = [];

        if ($teamId) {
            $sql .= ' WHERE r.team_id = ?';
            $params[] = $teamId;
        }

        $sql .= ' ORDER BY r.id DESC LIMIT 500';

        $roster = Database::fetchAll($sql, $params);

        return Response::json([
            'success' => true,
            'data' => $roster,
            'count' => count($roster),
        ]);
    }

    /**
     * Add player to team roster
     *
     * @param Request $request
     * @return Response
     */
    public function store(Request $request): Response
    {
        $teamId = (int) $request->input('team_id');
        $userId = (int) $request->input('user_id');
        $number = $request->input('number');
        $position = $request->input('position');
        $notes = $request->input('notes');

        // Check if player already on roster
        $exists = Database::fetchOne(
            'SELECT id FROM pelota_roster WHERE team_id = ? AND user_id = ?',
            [$teamId, $userId]
        );

        if ($exists) {
            return Response::error(__('error.player_already_on_roster'), 400);
        }

        Database::execute(
            'INSERT INTO pelota_roster (team_id, user_id, number, position, notes)
             VALUES (?, ?, ?, ?, ?)',
            [$teamId, $userId, $number, $position, $notes]
        );

        return Response::json([
            'success' => true,
            'message' => __('success.player_added_to_roster'),
            'id' => Database::lastInsertId(),
        ], 201);
    }

    /**
     * Update roster entry
     *
     * @param Request $request
     * @param array<string, string> $params
     * @return Response
     */
    public function update(Request $request, array $params): Response
    {
        $id = (int) $params['id'];
        $number = $request->input('number');
        $position = $request->input('position');
        $notes = $request->input('notes');

        Database::execute(
            'UPDATE pelota_roster SET number = ?, position = ?, notes = ? WHERE id = ?',
            [$number, $position, $notes, $id]
        );

        return Response::json([
            'success' => true,
            'message' => __('success.roster_entry_updated'),
        ]);
    }

    /**
     * Remove player from roster
     *
     * @param Request $request
     * @param array<string, string> $params
     * @return Response
     */
    public function destroy(Request $request, array $params): Response
    {
        $id = (int) $params['id'];

        Database::execute('DELETE FROM pelota_roster WHERE id = ?', [$id]);

        return Response::json([
            'success' => true,
            'message' => __('success.player_removed_from_roster'),
        ]);
    }
}
