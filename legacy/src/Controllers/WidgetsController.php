<?php
declare(strict_types=1);

namespace TouchBase\Controllers;

use TouchBase\Database;
use TouchBase\Http\Request;
use TouchBase\Http\Response;

use function TouchBase\__;

/**
 * Embeddable widgets controller
 * Provides minimal HTML snippets for embedding in Chamilo courses
 */
final class WidgetsController
{
    /**
     * Schedule widget - Shows upcoming practices and games
     *
     * @param Request $request
     * @return Response
     */
    public function schedule(Request $request): Response
    {
        $teamId = (int) $request->input('team_id', 0);

        if (!$teamId) {
            return new Response('<p style="color:#ef4444;">Team ID required</p>');
        }

        $events = Database::fetchAll(
            'SELECT type, opponent, venue, start_at, notes
             FROM pelota_schedule
             WHERE team_id = ?
             ORDER BY start_at ASC
             LIMIT 10',
            [$teamId]
        );

        $html = $this->widgetHeader(__('schedule.title'));
        $html .= '<div class="pp-widget">';
        $html .= '<h3>' . htmlspecialchars(__('schedule.upcoming')) . '</h3>';

        if (empty($events)) {
            $html .= '<p style="color:#9ca3af;">' . htmlspecialchars(__('schedule.no_events')) . '</p>';
        } else {
            $html .= '<ul class="pp-event-list">';
            foreach ($events as $event) {
                $type = $event['type'] === 'game' ? __('schedule.game') : __('schedule.practice');
                $date = date('M j, Y g:i A', strtotime($event['start_at']));
                $venue = $event['venue'] ?? '-';
                $opponent = $event['opponent'] ?? '';

                $html .= '<li>';
                $html .= '<span class="pp-event-type pp-type-' . htmlspecialchars($event['type']) . '">' . htmlspecialchars($type) . '</span>';
                $html .= '<strong>' . htmlspecialchars($date) . '</strong>';
                if ($opponent) {
                    $html .= '<span class="pp-event-detail">vs ' . htmlspecialchars($opponent) . '</span>';
                }
                $html .= '<span class="pp-event-detail">@ ' . htmlspecialchars($venue) . '</span>';
                $html .= '</li>';
            }
            $html .= '</ul>';
        }

        $html .= '</div>';
        return new Response($html);
    }

    /**
     * Roster widget - Shows team players
     *
     * @param Request $request
     * @return Response
     */
    public function roster(Request $request): Response
    {
        $teamId = (int) $request->input('team_id', 0);

        if (!$teamId) {
            return new Response('<p style="color:#ef4444;">Team ID required</p>');
        }

        $players = Database::fetchAll(
            'SELECT r.number, r.position, u.firstname, u.lastname
             FROM pelota_roster r
             JOIN user u ON u.user_id = r.user_id
             WHERE r.team_id = ?
             ORDER BY CAST(r.number AS UNSIGNED), u.lastname',
            [$teamId]
        );

        $html = $this->widgetHeader(__('roster.title'));
        $html .= '<div class="pp-widget">';
        $html .= '<h3>' . htmlspecialchars(__('roster.title')) . '</h3>';

        if (empty($players)) {
            $html .= '<p style="color:#9ca3af;">' . htmlspecialchars(__('roster.no_players')) . '</p>';
        } else {
            $html .= '<table class="pp-roster-table">';
            $html .= '<thead><tr>';
            $html .= '<th>#</th>';
            $html .= '<th>' . htmlspecialchars(__('roster.player_name')) . '</th>';
            $html .= '<th>' . htmlspecialchars(__('roster.position')) . '</th>';
            $html .= '</tr></thead>';
            $html .= '<tbody>';

            foreach ($players as $player) {
                $name = trim(($player['firstname'] ?? '') . ' ' . ($player['lastname'] ?? ''));
                $html .= '<tr>';
                $html .= '<td>' . htmlspecialchars($player['number'] ?? '-') . '</td>';
                $html .= '<td>' . htmlspecialchars($name) . '</td>';
                $html .= '<td>' . htmlspecialchars($player['position'] ?? '-') . '</td>';
                $html .= '</tr>';
            }

            $html .= '</tbody></table>';
        }

        $html .= '</div>';
        return new Response($html);
    }

    /**
     * Attendance widget - Shows recent attendance summary
     *
     * @param Request $request
     * @return Response
     */
    public function attendance(Request $request): Response
    {
        $teamId = (int) $request->input('team_id', 0);

        if (!$teamId) {
            return new Response('<p style="color:#ef4444;">Team ID required</p>');
        }

        // Get recent attendance summary
        $summary = Database::fetchAll(
            'SELECT
                date,
                SUM(CASE WHEN status = "present" THEN 1 ELSE 0 END) AS present_count,
                SUM(CASE WHEN status = "late" THEN 1 ELSE 0 END) AS late_count,
                SUM(CASE WHEN status = "absent" THEN 1 ELSE 0 END) AS absent_count,
                COUNT(*) AS total_count
             FROM pelota_attendance
             WHERE team_id = ?
             GROUP BY date
             ORDER BY date DESC
             LIMIT 10',
            [$teamId]
        );

        $html = $this->widgetHeader(__('attendance.title'));
        $html .= '<div class="pp-widget">';
        $html .= '<h3>' . htmlspecialchars(__('attendance.stats')) . '</h3>';

        if (empty($summary)) {
            $html .= '<p style="color:#9ca3af;">No attendance records found</p>';
        } else {
            $html .= '<ul class="pp-attendance-list">';

            foreach ($summary as $record) {
                $date = date('M j, Y', strtotime($record['date']));
                $rate = $record['total_count'] > 0
                    ? round(($record['present_count'] / $record['total_count']) * 100)
                    : 0;

                $html .= '<li>';
                $html .= '<strong>' . htmlspecialchars($date) . '</strong>';
                $html .= '<span class="pp-attendance-stat">';
                $html .= '<span style="color:#10b981;">✓ ' . $record['present_count'] . '</span>';
                if ($record['late_count'] > 0) {
                    $html .= '<span style="color:#f59e0b;">⊙ ' . $record['late_count'] . '</span>';
                }
                if ($record['absent_count'] > 0) {
                    $html .= '<span style="color:#ef4444;">✗ ' . $record['absent_count'] . '</span>';
                }
                $html .= '<span style="color:#60a5fa;">' . $rate . '%</span>';
                $html .= '</span>';
                $html .= '</li>';
            }

            $html .= '</ul>';
        }

        $html .= '</div>';
        return new Response($html);
    }

    /**
     * Generate widget HTML header with CSS
     *
     * @param string $title Widget title
     * @return string
     */
    private function widgetHeader(string $title): string
    {
        $basePath = BASE_PATH ?? '/pelota';
        return <<<HTML
        <link rel="stylesheet" href="{$basePath}/widgets.css">
        HTML;
    }
}
