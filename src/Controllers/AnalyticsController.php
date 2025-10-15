<?php
declare(strict_types=1);

namespace TouchBase\Controllers;

use TouchBase\Database;
use TouchBase\Http\Request;
use TouchBase\Http\Response;

use function TouchBase\view;

/**
 * Analytics Controller - Team and player performance analytics
 */
final class AnalyticsController
{
    /**
     * Team analytics page
     */
    public static function team(Request $request): Response
    {
        $teamId = $request->query('team_id');

        if (!$teamId) {
            return Response::error('Team ID required', 400);
        }

        $pdo = Database::pdo();

        // Get team info
        $stmt = $pdo->prepare('SELECT * FROM touchbase_teams WHERE id = ?');
        $stmt->execute([$teamId]);
        $team = $stmt->fetch();

        if (!$team) {
            return Response::error('Team not found', 404);
        }

        // Get attendance trend (last 10 events)
        $stmt = $pdo->prepare('
            SELECT
                e.date,
                COUNT(a.id) as total_members,
                SUM(CASE WHEN a.status = \'present\' THEN 1 ELSE 0 END) as present_count
            FROM touchbase_schedule e
            LEFT JOIN touchbase_attendance a ON a.event_id = e.id
            WHERE e.team_id = ?
            AND e.date <= CURRENT_DATE
            ORDER BY e.date DESC
            LIMIT 10
        ');
        $stmt->execute([$teamId]);
        $attendanceTrend = $stmt->fetchAll();

        // Calculate attendance percentage for each event
        foreach ($attendanceTrend as &$record) {
            $record['attendance_pct'] = $record['total_members'] > 0
                ? round(($record['present_count'] / $record['total_members']) * 100, 1)
                : 0;
        }

        // Get win/loss record
        $stmt = $pdo->prepare('
            SELECT
                SUM(CASE WHEN result = \'win\' THEN 1 ELSE 0 END) as wins,
                SUM(CASE WHEN result = \'loss\' THEN 1 ELSE 0 END) as losses,
                SUM(CASE WHEN result = \'tie\' THEN 1 ELSE 0 END) as ties
            FROM touchbase_schedule
            WHERE team_id = ? AND type = \'game\' AND result IS NOT NULL
        ');
        $stmt->execute([$teamId]);
        $record = $stmt->fetch();

        return new Response(view('analytics_team', [
            'team' => $team,
            'attendanceTrend' => array_reverse($attendanceTrend), // chronological order
            'record' => $record,
        ]));
    }

    /**
     * Player analytics page
     */
    public static function player(Request $request): Response
    {
        $userId = $request->query('user_id');
        $teamId = $request->query('team_id');

        if (!$userId || !$teamId) {
            return Response::error('User ID and Team ID required', 400);
        }

        $pdo = Database::pdo();

        // Get player info
        $stmt = $pdo->prepare('
            SELECT u.*, r.jersey_number, r.position
            FROM chamilo_user u
            INNER JOIN touchbase_roster r ON r.user_id = u.id
            WHERE u.id = ? AND r.team_id = ?
        ');
        $stmt->execute([$userId, $teamId]);
        $player = $stmt->fetch();

        if (!$player) {
            return Response::error('Player not found', 404);
        }

        // Get player stats summary
        $stmt = $pdo->prepare('
            SELECT
                AVG(batting_avg) as avg_ba,
                AVG(on_base_pct) as avg_obp,
                AVG(slugging_pct) as avg_slg,
                SUM(home_runs) as total_hr,
                SUM(rbis) as total_rbi,
                SUM(stolen_bases) as total_sb,
                AVG(era) as avg_era,
                SUM(strikeouts) as total_k
            FROM touchbase_stats
            WHERE user_id = ? AND team_id = ?
        ');
        $stmt->execute([$userId, $teamId]);
        $stats = $stmt->fetch();

        // Get attendance record
        $stmt = $pdo->prepare('
            SELECT
                COUNT(*) as total_events,
                SUM(CASE WHEN status = \'present\' THEN 1 ELSE 0 END) as attended
            FROM touchbase_attendance
            WHERE user_id = ?
        ');
        $stmt->execute([$userId]);
        $attendance = $stmt->fetch();

        $attendance['attendance_pct'] = $attendance['total_events'] > 0
            ? round(($attendance['attended'] / $attendance['total_events']) * 100, 1)
            : 0;

        return new Response(view('analytics_player', [
            'player' => $player,
            'stats' => $stats,
            'attendance' => $attendance,
        ]));
    }

    /**
     * API endpoint: Team analytics data (JSON)
     */
    public static function teamData(Request $request): Response
    {
        $teamId = $request->query('team_id');

        if (!$teamId) {
            return Response::json(['error' => 'Team ID required'], 400);
        }

        $pdo = Database::pdo();

        // Attendance trend
        $stmt = $pdo->prepare('
            SELECT
                e.date,
                COUNT(a.id) as total_members,
                SUM(CASE WHEN a.status = \'present\' THEN 1 ELSE 0 END) as present_count,
                ROUND((SUM(CASE WHEN a.status = \'present\' THEN 1 ELSE 0 END) * 100.0 / COUNT(a.id)), 1) as attendance_pct
            FROM touchbase_schedule e
            LEFT JOIN touchbase_attendance a ON a.event_id = e.id
            WHERE e.team_id = ?
            AND e.date <= CURRENT_DATE
            GROUP BY e.id, e.date
            ORDER BY e.date DESC
            LIMIT 10
        ');
        $stmt->execute([$teamId]);
        $attendanceTrend = $stmt->fetchAll();

        // Win/loss record
        $stmt = $pdo->prepare('
            SELECT
                SUM(CASE WHEN result = \'win\' THEN 1 ELSE 0 END) as wins,
                SUM(CASE WHEN result = \'loss\' THEN 1 ELSE 0 END) as losses,
                SUM(CASE WHEN result = \'tie\' THEN 1 ELSE 0 END) as ties
            FROM touchbase_schedule
            WHERE team_id = ? AND type = \'game\' AND result IS NOT NULL
        ');
        $stmt->execute([$teamId]);
        $record = $stmt->fetch();

        return Response::json([
            'attendance_trend' => array_reverse($attendanceTrend),
            'record' => $record,
        ]);
    }
}
