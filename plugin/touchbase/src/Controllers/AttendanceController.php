<?php
declare(strict_types=1);

namespace TouchBase\Controllers;

use TouchBase\Database;
use TouchBase\Http\Request;
use TouchBase\Http\Response;

use function TouchBase\__;

/**
 * Attendance tracking controller
 * Records player presence at practices and games
 */
final class AttendanceController
{
    /**
     * List attendance records
     *
     * @param Request $request
     * @return Response
     */
    public function index(Request $request): Response
    {
        $teamId = (int) $request->input('team_id', 0);
        $date = $request->input('date');
        $userId = (int) $request->input('user_id', 0);

        $sql = 'SELECT a.*, u.firstname, u.lastname
                FROM pelota_attendance a
                JOIN user u ON u.user_id = a.user_id';

        $params = [];
        $where = [];

        if ($teamId) {
            $where[] = 'a.team_id = ?';
            $params[] = $teamId;
        }

        if ($date) {
            $where[] = 'a.date = ?';
            $params[] = $date;
        }

        if ($userId) {
            $where[] = 'a.user_id = ?';
            $params[] = $userId;
        }

        if ($where) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }

        $sql .= ' ORDER BY a.date DESC, a.id DESC LIMIT 500';

        $records = Database::fetchAll($sql, $params);

        return Response::json([
            'success' => true,
            'data' => $records,
            'count' => count($records),
        ]);
    }

    /**
     * Record or update attendance
     *
     * @param Request $request
     * @return Response
     */
    public function store(Request $request): Response
    {
        $teamId = (int) $request->input('team_id');
        $userId = (int) $request->input('user_id');
        $date = $request->input('date');
        $status = $request->input('status', 'present');
        $comment = $request->input('comment');

        // Validate status
        $validStatuses = ['present', 'late', 'absent', 'excused'];
        if (!in_array($status, $validStatuses)) {
            return Response::error(__('error.invalid_attendance_status'), 400);
        }

        if (!$date) {
            return Response::error(__('error.date_required'), 400);
        }

        // Upsert (insert or update if exists)
        Database::execute(
            'INSERT INTO pelota_attendance (team_id, user_id, date, status, comment)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE status = VALUES(status), comment = VALUES(comment)',
            [$teamId, $userId, $date, $status, $comment]
        );

        return Response::json([
            'success' => true,
            'message' => __('success.attendance_recorded'),
        ]);
    }

    /**
     * Get attendance statistics for a team
     *
     * @param Request $request
     * @return Response
     */
    public function stats(Request $request): Response
    {
        $teamId = (int) $request->input('team_id');

        if (!$teamId) {
            return Response::error(__('error.team_id_required'), 400);
        }

        $stats = Database::fetchAll(
            'SELECT
                u.user_id,
                u.firstname,
                u.lastname,
                COUNT(*) AS total_records,
                SUM(CASE WHEN a.status = "present" THEN 1 ELSE 0 END) AS present_count,
                SUM(CASE WHEN a.status = "late" THEN 1 ELSE 0 END) AS late_count,
                SUM(CASE WHEN a.status = "absent" THEN 1 ELSE 0 END) AS absent_count,
                SUM(CASE WHEN a.status = "excused" THEN 1 ELSE 0 END) AS excused_count,
                ROUND((SUM(CASE WHEN a.status = "present" THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) AS attendance_rate
             FROM pelota_attendance a
             JOIN user u ON u.user_id = a.user_id
             WHERE a.team_id = ?
             GROUP BY u.user_id
             ORDER BY attendance_rate DESC',
            [$teamId]
        );

        return Response::json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
