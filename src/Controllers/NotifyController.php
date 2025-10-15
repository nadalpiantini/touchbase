<?php
declare(strict_types=1);

namespace TouchBase\Controllers;

use TouchBase\Database;
use TouchBase\Http\Request;
use TouchBase\Http\Response;
use TouchBase\Middleware\Auth;
use function TouchBase\__;

/**
 * Notification Controller
 * Handles email/SMS notifications (MVP: email stub via Chamilo mailer)
 */
final class NotifyController
{
    /**
     * Send event notification to team roster
     * POST /api/notify/event
     */
    public function event(Request $request): Response
    {
        Auth::requireRole(['coach', 'admin']);

        $teamId = (int) ($request->input('team_id') ?? 0);
        $message = $request->input('message', '');
        $subject = $request->input('subject', __('notify.event_notification'));

        if ($teamId === 0 || empty($message)) {
            return Response::error(__('error.team_id_and_message_required'), 400);
        }

        // Get team roster emails
        $roster = Database::fetchAll(
            'SELECT DISTINCT u.user_id, u.firstname, u.lastname, u.email
             FROM pelota_roster r
             JOIN user u ON r.user_id = u.user_id
             WHERE r.team_id = ? AND u.active = 1',
            [$teamId]
        );

        if (empty($roster)) {
            return Response::error(__('error.no_active_players_in_roster'), 404);
        }

        $queued = 0;
        $failed = 0;

        foreach ($roster as $player) {
            if (empty($player['email'])) {
                continue;
            }

            // TODO: Integrate with Chamilo MessageManager or SMTP
            // For MVP: log to database queue
            $queued += $this->queueEmail(
                $player['email'],
                $player['firstname'] . ' ' . $player['lastname'],
                $subject,
                $message
            );
        }

        return Response::json([
            'ok' => true,
            'queued' => $queued,
            'failed' => $failed,
            'total_recipients' => count($roster),
        ]);
    }

    /**
     * Send reminder notification
     * POST /api/notify/reminder
     */
    public function reminder(Request $request): Response
    {
        Auth::requireRole(['coach', 'admin']);

        $eventId = (int) ($request->input('event_id') ?? 0);

        if ($eventId === 0) {
            return Response::error(__('error.event_id_required'), 400);
        }

        // Get event details
        $event = Database::fetchOne(
            'SELECT * FROM pelota_schedule WHERE id = ?',
            [$eventId]
        );

        if (!$event) {
            return Response::error(__('error.event_not_found'), 404);
        }

        // Get roster for event team
        $roster = Database::fetchAll(
            'SELECT DISTINCT u.user_id, u.firstname, u.lastname, u.email
             FROM pelota_roster r
             JOIN user u ON r.user_id = u.user_id
             WHERE r.team_id = ? AND u.active = 1',
            [(int) $event['team_id']]
        );

        $subject = __('notify.event_reminder_subject');
        $message = sprintf(
            __('notify.event_reminder_message'),
            $event['event_type'],
            $event['start_time'],
            $event['venue'] ?? __('common.tbd')
        );

        $queued = 0;
        foreach ($roster as $player) {
            if (empty($player['email'])) {
                continue;
            }

            $queued += $this->queueEmail(
                $player['email'],
                $player['firstname'] . ' ' . $player['lastname'],
                $subject,
                $message
            );
        }

        return Response::json([
            'ok' => true,
            'queued' => $queued,
            'event_id' => $eventId,
        ]);
    }

    /**
     * Queue email for sending (MVP: simple database queue)
     *
     * @param string $to Recipient email
     * @param string $name Recipient name
     * @param string $subject Email subject
     * @param string $body Email body
     * @return int 1 if queued, 0 if failed
     */
    private function queueEmail(string $to, string $name, string $subject, string $body): int
    {
        try {
            Database::execute(
                'INSERT INTO pelota_email_queue (to_email, to_name, subject, body, status)
                 VALUES (?, ?, ?, ?, ?)',
                [$to, $name, $subject, $body, 'queued']
            );
            return 1;
        } catch (\Exception $e) {
            error_log('Failed to queue email: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get notification queue status (for admin)
     * GET /api/notify/queue-status
     */
    public function queueStatus(Request $request): Response
    {
        Auth::requireRole(['admin']);

        $stats = Database::fetchOne(
            'SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = "queued" THEN 1 ELSE 0 END) as queued,
                SUM(CASE WHEN status = "sent" THEN 1 ELSE 0 END) as sent,
                SUM(CASE WHEN status = "failed" THEN 1 ELSE 0 END) as failed
             FROM pelota_email_queue'
        );

        return Response::json(['ok' => true, 'stats' => $stats]);
    }
}
