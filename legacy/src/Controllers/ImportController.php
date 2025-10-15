<?php
declare(strict_types=1);

namespace TouchBase\Controllers;

use TouchBase\Database;
use TouchBase\Http\Request;
use TouchBase\Http\Response;
use TouchBase\Middleware\Auth;

use function TouchBase\__;

/**
 * CSV Import controller
 * Handles bulk imports for roster and schedule
 */
final class ImportController
{
    /**
     * Import roster from CSV
     * Expected format: user_id,number,position,notes
     *
     * @param Request $request
     * @return Response
     */
    public function roster(Request $request): Response
    {
        Auth::requireRole(['coach', 'admin']);

        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            return Response::error(__('error.file_upload_failed'), 400);
        }

        $teamId = (int) $request->input('team_id');
        if (!$teamId) {
            return Response::error(__('error.team_id_required'), 400);
        }

        $pdo = Database::pdo();
        $file = fopen($_FILES['file']['tmp_name'], 'r');

        // Read header row
        $header = fgetcsv($file);
        if (!$header || !in_array('user_id', $header)) {
            fclose($file);
            return Response::error('Invalid CSV format. Required columns: user_id,number,position,notes', 400);
        }

        $stmt = $pdo->prepare(
            'INSERT INTO pelota_roster (team_id, user_id, number, position, notes)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                number = VALUES(number),
                position = VALUES(position),
                notes = VALUES(notes)'
        );

        $imported = 0;
        $errors = [];

        while (($row = fgetcsv($file)) !== false) {
            $data = array_combine($header, $row);

            try {
                $stmt->execute([
                    $teamId,
                    (int) $data['user_id'],
                    $data['number'] ?? null,
                    $data['position'] ?? null,
                    $data['notes'] ?? null,
                ]);
                $imported++;
            } catch (\Exception $e) {
                $errors[] = "Row {$imported}: " . $e->getMessage();
            }
        }

        fclose($file);

        return Response::json([
            'success' => true,
            'message' => __('success.roster_imported'),
            'imported' => $imported,
            'errors' => $errors,
        ]);
    }

    /**
     * Import schedule from CSV
     * Expected format: type,opponent,venue,start_at,end_at,notes
     *
     * @param Request $request
     * @return Response
     */
    public function schedule(Request $request): Response
    {
        Auth::requireRole(['coach', 'admin']);

        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            return Response::error(__('error.file_upload_failed'), 400);
        }

        $teamId = (int) $request->input('team_id');
        if (!$teamId) {
            return Response::error(__('error.team_id_required'), 400);
        }

        $pdo = Database::pdo();
        $file = fopen($_FILES['file']['tmp_name'], 'r');

        // Read header row
        $header = fgetcsv($file);
        if (!$header || !in_array('type', $header) || !in_array('start_at', $header)) {
            fclose($file);
            return Response::error('Invalid CSV format. Required columns: type,start_at', 400);
        }

        $stmt = $pdo->prepare(
            'INSERT INTO pelota_schedule (team_id, type, opponent, venue, start_at, end_at, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );

        $imported = 0;
        $errors = [];

        while (($row = fgetcsv($file)) !== false) {
            $data = array_combine($header, $row);

            if (!in_array($data['type'], ['practice', 'game'])) {
                $errors[] = "Row {$imported}: Invalid type (must be 'practice' or 'game')";
                continue;
            }

            try {
                $stmt->execute([
                    $teamId,
                    $data['type'],
                    $data['opponent'] ?? null,
                    $data['venue'] ?? null,
                    $data['start_at'],
                    $data['end_at'] ?? null,
                    $data['notes'] ?? null,
                ]);
                $imported++;
            } catch (\Exception $e) {
                $errors[] = "Row {$imported}: " . $e->getMessage();
            }
        }

        fclose($file);

        return Response::json([
            'success' => true,
            'message' => __('success.schedule_imported'),
            'imported' => $imported,
            'errors' => $errors,
        ]);
    }
}
