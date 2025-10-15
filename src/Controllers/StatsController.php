<?php
declare(strict_types=1);

namespace TouchBase\Controllers;

use TouchBase\Database;
use TouchBase\Http\Request;
use TouchBase\Http\Response;

use function TouchBase\__;

/**
 * Player statistics controller
 * Tracks baseball performance metrics (AVG, OBP, HR, RBI, etc.)
 */
final class StatsController
{
    /**
     * List player statistics
     *
     * @param Request $request
     * @return Response
     */
    public function index(Request $request): Response
    {
        $teamId = (int) $request->input('team_id', 0);
        $userId = (int) $request->input('user_id', 0);
        $metric = $request->input('metric');

        $sql = 'SELECT s.*, u.firstname, u.lastname
                FROM pelota_stats s
                JOIN user u ON u.user_id = s.user_id';

        $params = [];
        $where = [];

        if ($teamId) {
            $where[] = 's.team_id = ?';
            $params[] = $teamId;
        }

        if ($userId) {
            $where[] = 's.user_id = ?';
            $params[] = $userId;
        }

        if ($metric) {
            $where[] = 's.metric = ?';
            $params[] = $metric;
        }

        if ($where) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }

        $sql .= ' ORDER BY s.id DESC LIMIT 500';

        $stats = Database::fetchAll($sql, $params);

        return Response::json([
            'success' => true,
            'data' => $stats,
            'count' => count($stats),
        ]);
    }

    /**
     * Record player statistic
     *
     * @param Request $request
     * @return Response
     */
    public function store(Request $request): Response
    {
        $teamId = (int) $request->input('team_id');
        $userId = (int) $request->input('user_id');
        $matchId = $request->input('match_id') ? (int) $request->input('match_id') : null;
        $metric = trim((string) $request->input('metric'));
        $value = (float) $request->input('value');

        if (!$metric) {
            return Response::error(__('error.metric_required'), 400);
        }

        Database::execute(
            'INSERT INTO pelota_stats (team_id, user_id, match_id, metric, value)
             VALUES (?, ?, ?, ?, ?)',
            [$teamId, $userId, $matchId, $metric, $value]
        );

        return Response::json([
            'success' => true,
            'message' => __('success.stat_recorded'),
            'id' => Database::lastInsertId(),
        ], 201);
    }

    /**
     * Get aggregated stats for a player
     *
     * @param Request $request
     * @return Response
     */
    public function playerSummary(Request $request): Response
    {
        $teamId = (int) $request->input('team_id');
        $userId = (int) $request->input('user_id');

        if (!$teamId || !$userId) {
            return Response::error(__('error.team_and_user_required'), 400);
        }

        $summary = Database::fetchAll(
            'SELECT
                metric,
                COUNT(*) AS entries,
                AVG(value) AS avg_value,
                MAX(value) AS max_value,
                MIN(value) AS min_value,
                SUM(value) AS total_value
             FROM pelota_stats
             WHERE team_id = ? AND user_id = ?
             GROUP BY metric
             ORDER BY metric',
            [$teamId, $userId]
        );

        return Response::json([
            'success' => true,
            'data' => $summary,
        ]);
    }
}
