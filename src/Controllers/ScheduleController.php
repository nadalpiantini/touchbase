<?php
declare(strict_types=1);

namespace TouchBase\Controllers;

use TouchBase\Database;
use TouchBase\Http\Request;
use TouchBase\Http\Response;

use function TouchBase\__;

/**
 * Schedule management controller
 * Manages practices and games calendar
 */
final class ScheduleController
{
    /**
     * List scheduled events
     *
     * @param Request $request
     * @return Response
     */
    public function index(Request $request): Response
    {
        $teamId = (int) $request->input('team_id', 0);
        $type = $request->input('type'); // 'practice' or 'game'
        $from = $request->input('from'); // Start date filter
        $to = $request->input('to'); // End date filter

        $sql = 'SELECT * FROM pelota_schedule';
        $params = [];
        $where = [];

        if ($teamId) {
            $where[] = 'team_id = ?';
            $params[] = $teamId;
        }

        if ($type && in_array($type, ['practice', 'game'])) {
            $where[] = 'type = ?';
            $params[] = $type;
        }

        if ($from) {
            $where[] = 'start_at >= ?';
            $params[] = $from;
        }

        if ($to) {
            $where[] = 'start_at <= ?';
            $params[] = $to;
        }

        if ($where) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }

        $sql .= ' ORDER BY start_at DESC LIMIT 500';

        $events = Database::fetchAll($sql, $params);

        return Response::json([
            'success' => true,
            'data' => $events,
            'count' => count($events),
        ]);
    }

    /**
     * Create scheduled event
     *
     * @param Request $request
     * @return Response
     */
    public function store(Request $request): Response
    {
        $teamId = (int) $request->input('team_id');
        $type = $request->input('type');
        $opponent = $request->input('opponent');
        $venue = $request->input('venue');
        $startAt = $request->input('start_at');
        $endAt = $request->input('end_at');
        $notes = $request->input('notes');

        // Validation
        if (!in_array($type, ['practice', 'game'])) {
            return Response::error(__('error.invalid_event_type'), 400);
        }

        if (!$startAt) {
            return Response::error(__('error.start_time_required'), 400);
        }

        Database::execute(
            'INSERT INTO pelota_schedule (team_id, type, opponent, venue, start_at, end_at, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?)',
            [$teamId, $type, $opponent, $venue, $startAt, $endAt, $notes]
        );

        return Response::json([
            'success' => true,
            'message' => __('success.event_created'),
            'id' => Database::lastInsertId(),
        ], 201);
    }

    /**
     * Update scheduled event
     *
     * @param Request $request
     * @param array<string, string> $params
     * @return Response
     */
    public function update(Request $request, array $params): Response
    {
        $id = (int) $params['id'];
        $type = $request->input('type');
        $opponent = $request->input('opponent');
        $venue = $request->input('venue');
        $startAt = $request->input('start_at');
        $endAt = $request->input('end_at');
        $notes = $request->input('notes');

        if (!in_array($type, ['practice', 'game'])) {
            return Response::error(__('error.invalid_event_type'), 400);
        }

        Database::execute(
            'UPDATE pelota_schedule
             SET type = ?, opponent = ?, venue = ?, start_at = ?, end_at = ?, notes = ?
             WHERE id = ?',
            [$type, $opponent, $venue, $startAt, $endAt, $notes, $id]
        );

        return Response::json([
            'success' => true,
            'message' => __('success.event_updated'),
        ]);
    }

    /**
     * Delete scheduled event
     *
     * @param Request $request
     * @param array<string, string> $params
     * @return Response
     */
    public function destroy(Request $request, array $params): Response
    {
        $id = (int) $params['id'];

        Database::execute('DELETE FROM pelota_schedule WHERE id = ?', [$id]);

        return Response::json([
            'success' => true,
            'message' => __('success.event_deleted'),
        ]);
    }
}
