<?php
declare(strict_types=1);

namespace TouchBase\Controllers;

use TouchBase\Database;
use TouchBase\Http\Request;
use TouchBase\Http\Response;

use function TouchBase\view;

/**
 * Parent Controller - Read-only dashboard for parents
 * Shows upcoming events and attendance for their children
 */
final class ParentController
{
    /**
     * Parent dashboard page
     */
    public static function dashboard(Request $request): Response
    {
        $pdo = Database::pdo();

        // Get current user (parent)
        $userId = $_SESSION['user_id'] ?? null;

        if (!$userId) {
            return Response::redirect(BASE_PATH . '/');
        }

        // Get children (roster entries for this parent's email)
        // Assuming parent email matches child email pattern or linked via custom field
        $stmt = $pdo->prepare('
            SELECT DISTINCT
                u.id,
                u.firstname,
                u.lastname,
                r.team_id,
                t.name as team_name
            FROM touchbase_roster r
            INNER JOIN chamilo_user u ON u.id = r.user_id
            INNER JOIN touchbase_teams t ON t.id = r.team_id
            WHERE r.user_id IN (
                SELECT id FROM chamilo_user
                WHERE email = (SELECT email FROM chamilo_user WHERE id = ?)
                OR id = ?
            )
        ');
        $stmt->execute([$userId, $userId]);
        $children = $stmt->fetchAll();

        if (empty($children)) {
            // No children found - show empty state
            return new Response(view('parent_dashboard', [
                'children' => [],
                'upcoming_events' => [],
                'attendance_summary' => [],
            ]));
        }

        $childIds = array_column($children, 'id');
        $teamIds = array_unique(array_column($children, 'team_id'));

        // Get upcoming events for children's teams
        $placeholders = implode(',', array_fill(0, count($teamIds), '?'));
        $stmt = $pdo->prepare("
            SELECT
                e.id,
                e.team_id,
                e.title,
                e.type,
                e.date,
                e.time,
                e.location,
                t.name as team_name
            FROM touchbase_schedule e
            INNER JOIN touchbase_teams t ON t.id = e.team_id
            WHERE e.team_id IN ($placeholders)
            AND e.date >= CURRENT_DATE
            ORDER BY e.date ASC, e.time ASC
            LIMIT 10
        ");
        $stmt->execute($teamIds);
        $upcomingEvents = $stmt->fetchAll();

        // Get attendance summary for each child
        $attendanceSummary = [];
        foreach ($children as $child) {
            $stmt = $pdo->prepare('
                SELECT
                    COUNT(*) as total_events,
                    SUM(CASE WHEN status = \'present\' THEN 1 ELSE 0 END) as attended
                FROM touchbase_attendance
                WHERE user_id = ?
            ');
            $stmt->execute([$child['id']]);
            $attendance = $stmt->fetch();

            $attendance['attendance_pct'] = $attendance['total_events'] > 0
                ? round(($attendance['attended'] / $attendance['total_events']) * 100, 1)
                : 0;

            $attendanceSummary[$child['id']] = $attendance;
        }

        return new Response(view('parent_dashboard', [
            'children' => $children,
            'upcoming_events' => $upcomingEvents,
            'attendance_summary' => $attendanceSummary,
        ]));
    }

    /**
     * API endpoint: Get parent's children
     */
    public static function children(Request $request): Response
    {
        $userId = $_SESSION['user_id'] ?? null;

        if (!$userId) {
            return Response::json(['error' => 'Unauthorized'], 401);
        }

        $pdo = Database::pdo();

        $stmt = $pdo->prepare('
            SELECT DISTINCT
                u.id,
                u.firstname,
                u.lastname,
                r.team_id,
                r.jersey_number,
                r.position,
                t.name as team_name
            FROM touchbase_roster r
            INNER JOIN chamilo_user u ON u.id = r.user_id
            INNER JOIN touchbase_teams t ON t.id = r.team_id
            WHERE r.user_id IN (
                SELECT id FROM chamilo_user
                WHERE email = (SELECT email FROM chamilo_user WHERE id = ?)
                OR id = ?
            )
        ');
        $stmt->execute([$userId, $userId]);
        $children = $stmt->fetchAll();

        return Response::json(['children' => $children]);
    }

    /**
     * API endpoint: Get upcoming events for parent's children
     */
    public static function upcomingEvents(Request $request): Response
    {
        $userId = $_SESSION['user_id'] ?? null;

        if (!$userId) {
            return Response::json(['error' => 'Unauthorized'], 401);
        }

        $pdo = Database::pdo();

        // Get team IDs for parent's children
        $stmt = $pdo->prepare('
            SELECT DISTINCT r.team_id
            FROM touchbase_roster r
            WHERE r.user_id IN (
                SELECT id FROM chamilo_user
                WHERE email = (SELECT email FROM chamilo_user WHERE id = ?)
                OR id = ?
            )
        ');
        $stmt->execute([$userId, $userId]);
        $teams = $stmt->fetchAll();
        $teamIds = array_column($teams, 'team_id');

        if (empty($teamIds)) {
            return Response::json(['events' => []]);
        }

        $placeholders = implode(',', array_fill(0, count($teamIds), '?'));
        $stmt = $pdo->prepare("
            SELECT
                e.id,
                e.team_id,
                e.title,
                e.type,
                e.date,
                e.time,
                e.location,
                t.name as team_name
            FROM touchbase_schedule e
            INNER JOIN touchbase_teams t ON t.id = e.team_id
            WHERE e.team_id IN ($placeholders)
            AND e.date >= CURRENT_DATE
            ORDER BY e.date ASC, e.time ASC
            LIMIT 20
        ");
        $stmt->execute($teamIds);
        $events = $stmt->fetchAll();

        return Response::json(['events' => $events]);
    }
}
