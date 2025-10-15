<?php
declare(strict_types=1);

namespace TouchBase\Controllers;

use TouchBase\Database;
use TouchBase\Http\Request;
use TouchBase\Http\Response;
use TouchBase\Middleware\Auth;
use function TouchBase\__;

/**
 * Billing Controller
 * Handles payments and billing (MVP: Stripe stub)
 */
final class BillingController
{
    /**
     * Create Stripe checkout session
     * POST /api/billing/checkout
     */
    public function createCheckout(Request $request): Response
    {
        Auth::requireRole(['admin']);

        $amount = (int) ($request->input('amount') ?? 0);
        $description = $request->input('description', 'TouchBase Fee');
        $teamId = (int) ($request->input('team_id') ?? 0);
        $userId = (int) ($request->input('user_id') ?? 0);

        if ($amount <= 0) {
            return Response::error(__('error.amount_required'), 400);
        }

        // MVP: Stub implementation
        // TODO: Integrate with Stripe API
        $checkoutId = 'cs_stub_' . uniqid();

        // Store checkout intent
        Database::execute(
            'INSERT INTO pelota_billing_transactions
             (checkout_id, team_id, user_id, amount, description, status)
             VALUES (?, ?, ?, ?, ?, ?)',
            [$checkoutId, $teamId, $userId, $amount, $description, 'pending']
        );

        return Response::json([
            'ok' => true,
            'checkout_id' => $checkoutId,
            'checkout_url' => getenv('BASE_URL') . '/billing/checkout/' . $checkoutId,
            'amount' => $amount,
            'currency' => 'USD',
        ], 201);
    }

    /**
     * Handle Stripe webhook
     * POST /api/billing/webhook
     */
    public function webhook(Request $request): Response
    {
        // MVP: Stub implementation
        // TODO: Verify Stripe signature and process events
        $payload = $request->body;
        $event = $payload['type'] ?? null;

        if ($event === 'checkout.session.completed') {
            $checkoutId = $payload['data']['object']['id'] ?? null;

            if ($checkoutId) {
                Database::execute(
                    'UPDATE pelota_billing_transactions
                     SET status = ?, completed_at = NOW()
                     WHERE checkout_id = ?',
                    ['completed', $checkoutId]
                );
            }
        }

        return Response::json(['received' => true]);
    }

    /**
     * Get billing history
     * GET /api/billing/history
     */
    public function history(Request $request): Response
    {
        Auth::requireRole(['admin']);

        $teamId = (int) ($request->get['team_id'] ?? 0);
        $userId = (int) ($request->get['user_id'] ?? 0);

        $where = [];
        $params = [];

        if ($teamId > 0) {
            $where[] = 'team_id = ?';
            $params[] = $teamId;
        }

        if ($userId > 0) {
            $where[] = 'user_id = ?';
            $params[] = $userId;
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

        $transactions = Database::fetchAll(
            "SELECT * FROM pelota_billing_transactions
             {$whereClause}
             ORDER BY created_at DESC
             LIMIT 100",
            $params
        );

        return Response::json([
            'ok' => true,
            'transactions' => $transactions,
        ]);
    }

    /**
     * Generate CSV reconciliation report
     * GET /api/billing/export
     */
    public function export(Request $request): Response
    {
        Auth::requireRole(['admin']);

        $startDate = $request->get['start_date'] ?? date('Y-m-01');
        $endDate = $request->get['end_date'] ?? date('Y-m-t');

        $transactions = Database::fetchAll(
            'SELECT
                t.checkout_id,
                t.amount,
                t.description,
                t.status,
                t.created_at,
                t.completed_at,
                tm.name as team_name,
                u.firstname,
                u.lastname
             FROM pelota_billing_transactions t
             LEFT JOIN pelota_teams tm ON t.team_id = tm.id
             LEFT JOIN user u ON t.user_id = u.user_id
             WHERE DATE(t.created_at) BETWEEN ? AND ?
             ORDER BY t.created_at DESC',
            [$startDate, $endDate]
        );

        // Generate CSV
        $csv = "ID,Amount,Description,Status,Created,Completed,Team,User\n";
        foreach ($transactions as $txn) {
            $csv .= sprintf(
                "%s,%s,%s,%s,%s,%s,%s,%s %s\n",
                $txn['checkout_id'],
                $txn['amount'],
                '"' . str_replace('"', '""', $txn['description']) . '"',
                $txn['status'],
                $txn['created_at'],
                $txn['completed_at'] ?? '',
                $txn['team_name'] ?? '',
                $txn['firstname'] ?? '',
                $txn['lastname'] ?? ''
            );
        }

        return new Response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="billing_' . $startDate . '_' . $endDate . '.csv"',
        ]);
    }
}
