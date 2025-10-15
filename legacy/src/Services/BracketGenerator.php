<?php
declare(strict_types=1);

namespace TouchBase\Services;

use TouchBase\Database;

/**
 * Tournament Bracket Generator
 * Generates match fixtures for various tournament formats
 */
final class BracketGenerator
{
    /**
     * Generate brackets for a tournament
     *
     * @param int $tournamentId Tournament ID
     * @return array<string, mixed> Generation results
     */
    public function generate(int $tournamentId): array
    {
        // Get tournament details
        $tournament = Database::fetchOne(
            'SELECT * FROM pelota_tournaments WHERE id = ?',
            [$tournamentId]
        );

        if (!$tournament) {
            return ['error' => 'Tournament not found', 'success' => false];
        }

        // Get participating teams
        $teams = Database::fetchAll(
            'SELECT team_id, group_name, seed 
             FROM pelota_tournament_teams 
             WHERE tournament_id = ? 
             ORDER BY seed ASC, team_id ASC',
            [$tournamentId]
        );

        if (count($teams) < 2) {
            return ['error' => 'At least 2 teams required', 'success' => false];
        }

        // Generate based on format
        $matches = match($tournament['format']) {
            'round_robin' => $this->generateRoundRobin($tournamentId, $teams),
            'knockout' => $this->generateKnockout($tournamentId, $teams),
            'groups_knockout' => $this->generateGroupsKnockout($tournamentId, $teams, (int)($tournament['num_groups'] ?? 2)),
            'double_elimination' => $this->generateDoubleElimination($tournamentId, $teams),
            default => [],
        };

        if (empty($matches)) {
            return ['error' => 'Failed to generate brackets', 'success' => false];
        }

        // Insert matches into database
        $inserted = 0;
        foreach ($matches as $match) {
            Database::execute(
                'INSERT INTO pelota_matches 
                 (tournament_id, round, match_number, team_home, team_away, scheduled_at, venue, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    $tournamentId,
                    $match['round'] ?? null,
                    $match['match_number'] ?? null,
                    $match['team_home'],
                    $match['team_away'],
                    $match['scheduled_at'] ?? null,
                    $match['venue'] ?? null,
                    'scheduled'
                ]
            );
            $inserted++;
        }

        return [
            'success' => true,
            'format' => $tournament['format'],
            'teams_count' => count($teams),
            'matches_created' => $inserted,
            'matches' => $matches,
        ];
    }

    /**
     * Generate round-robin fixtures (every team plays every other team)
     *
     * @param int $tournamentId
     * @param array<array<string, mixed>> $teams
     * @return array<array<string, mixed>>
     */
    private function generateRoundRobin(int $tournamentId, array $teams): array
    {
        $matches = [];
        $matchNumber = 1;
        $teamCount = count($teams);

        // Every team plays every other team once
        for ($i = 0; $i < $teamCount; $i++) {
            for ($j = $i + 1; $j < $teamCount; $j++) {
                $matches[] = [
                    'round' => 1, // Round-robin is considered a single "round"
                    'match_number' => $matchNumber++,
                    'team_home' => (int) $teams[$i]['team_id'],
                    'team_away' => (int) $teams[$j]['team_id'],
                ];
            }
        }

        return $matches;
    }

    /**
     * Generate single-elimination knockout bracket
     *
     * @param int $tournamentId
     * @param array<array<string, mixed>> $teams
     * @return array<array<string, mixed>>
     */
    private function generateKnockout(int $tournamentId, array $teams): array
    {
        $matches = [];
        $teamCount = count($teams);
        
        // Find next power of 2
        $bracketSize = $this->nextPowerOfTwo($teamCount);
        $byeCount = $bracketSize - $teamCount;

        // Round 1 matches
        $round = 1;
        $matchNumber = 1;
        $activeTeams = $teams;

        // Pair teams for first round (considering byes)
        for ($i = 0; $i < $teamCount; $i += 2) {
            if ($i + 1 < $teamCount) {
                // Normal match
                $matches[] = [
                    'round' => $round,
                    'match_number' => $matchNumber++,
                    'team_home' => (int) $activeTeams[$i]['team_id'],
                    'team_away' => (int) $activeTeams[$i + 1]['team_id'],
                ];
            }
            // If odd number of teams, last team gets a bye (no match created)
        }

        // Calculate total rounds needed
        $totalRounds = (int) log($bracketSize, 2);

        // Placeholder matches for future rounds (to be filled after previous round completes)
        $remainingMatches = (int) floor($teamCount / 2);
        for ($r = 2; $r <= $totalRounds; $r++) {
            $remainingMatches = (int) floor($remainingMatches / 2);
            for ($m = 1; $m <= $remainingMatches; $m++) {
                // These will be TBD matches (winner of previous round)
                // Not creating them now - they'll be created when previous round completes
            }
        }

        return $matches;
    }

    /**
     * Generate groups stage followed by knockout
     *
     * @param int $tournamentId
     * @param array<array<string, mixed>> $teams
     * @param int $numGroups
     * @return array<array<string, mixed>>
     */
    private function generateGroupsKnockout(int $tournamentId, array $teams, int $numGroups): array
    {
        $matches = [];
        $teamCount = count($teams);
        $teamsPerGroup = (int) ceil($teamCount / $numGroups);

        // Organize teams into groups
        $groups = [];
        $groupNames = range('A', chr(65 + $numGroups - 1)); // A, B, C, ...

        foreach ($teams as $index => $team) {
            $groupIndex = (int) floor($index / $teamsPerGroup);
            if ($groupIndex >= $numGroups) {
                $groupIndex = $numGroups - 1; // Put extras in last group
            }
            $groups[$groupNames[$groupIndex]][] = $team;
        }

        // Generate round-robin within each group
        $matchNumber = 1;
        foreach ($groups as $groupName => $groupTeams) {
            $groupTeamCount = count($groupTeams);
            for ($i = 0; $i < $groupTeamCount; $i++) {
                for ($j = $i + 1; $j < $groupTeamCount; $j++) {
                    $matches[] = [
                        'round' => 1, // Group stage
                        'match_number' => $matchNumber++,
                        'team_home' => (int) $groupTeams[$i]['team_id'],
                        'team_away' => (int) $groupTeams[$j]['team_id'],
                        'notes' => "Group {$groupName}",
                    ];
                }
            }
        }

        // Knockout phase will be generated after group stage completes
        // (Top N teams from each group advance)

        return $matches;
    }

    /**
     * Generate double-elimination bracket
     *
     * @param int $tournamentId
     * @param array<array<string, mixed>> $teams
     * @return array<array<string, mixed>>
     */
    private function generateDoubleElimination(int $tournamentId, array $teams): array
    {
        // Similar to single elimination but with a "loser's bracket"
        // For MVP, we'll use single elimination
        // TODO: Implement full double-elimination logic
        return $this->generateKnockout($tournamentId, $teams);
    }

    /**
     * Schedule matches across dates
     *
     * @param int $tournamentId
     * @param string $startDate Starting date (Y-m-d)
     * @param int $matchesPerDay How many matches per day
     * @param array<string> $playDays Days of week (e.g., ['Saturday', 'Sunday'])
     * @return array<string, mixed>
     */
    public function scheduleMatches(
        int $tournamentId, 
        string $startDate, 
        int $matchesPerDay = 4,
        array $playDays = ['Saturday', 'Sunday']
    ): array {
        // Get unscheduled matches
        $matches = Database::fetchAll(
            'SELECT id FROM pelota_matches 
             WHERE tournament_id = ? AND scheduled_at IS NULL 
             ORDER BY round ASC, match_number ASC',
            [$tournamentId]
        );

        if (empty($matches)) {
            return ['success' => false, 'message' => 'No unscheduled matches'];
        }

        $currentDate = new \DateTime($startDate);
        $scheduled = 0;
        $matchesOnCurrentDay = 0;

        foreach ($matches as $match) {
            // Skip to next play day if needed
            while (!in_array($currentDate->format('l'), $playDays)) {
                $currentDate->modify('+1 day');
            }

            // Schedule time (e.g., 9 AM, 11 AM, 1 PM, 3 PM)
            $hour = 9 + ($matchesOnCurrentDay * 2);
            $scheduledAt = $currentDate->format('Y-m-d') . ' ' . str_pad((string)$hour, 2, '0', STR_PAD_LEFT) . ':00:00';

            Database::execute(
                'UPDATE pelota_matches SET scheduled_at = ? WHERE id = ?',
                [$scheduledAt, $match['id']]
            );

            $scheduled++;
            $matchesOnCurrentDay++;

            // Move to next day if we've reached limit
            if ($matchesOnCurrentDay >= $matchesPerDay) {
                $matchesOnCurrentDay = 0;
                $currentDate->modify('+1 day');
            }
        }

        return [
            'success' => true,
            'scheduled' => $scheduled,
            'start_date' => $startDate,
            'end_date' => $currentDate->format('Y-m-d'),
        ];
    }

    /**
     * Find next power of 2 (for bracket sizing)
     *
     * @param int $n Number
     * @return int Next power of 2
     */
    private function nextPowerOfTwo(int $n): int
    {
        $power = 1;
        while ($power < $n) {
            $power *= 2;
        }
        return $power;
    }

    /**
     * Update match result and determine winner
     *
     * @param int $matchId Match ID
     * @param int $scoreHome Home team score
     * @param int $scoreAway Away team score
     * @return array<string, mixed>
     */
    public function updateMatchResult(int $matchId, int $scoreHome, int $scoreAway): array
    {
        $match = Database::fetchOne(
            'SELECT * FROM pelota_matches WHERE id = ?',
            [$matchId]
        );

        if (!$match) {
            return ['success' => false, 'error' => 'Match not found'];
        }

        // Determine winner
        $winnerId = null;
        if ($scoreHome > $scoreAway) {
            $winnerId = $match['team_home'];
        } elseif ($scoreAway > $scoreHome) {
            $winnerId = $match['team_away'];
        }
        // If tied, winnerId stays null

        Database::execute(
            'UPDATE pelota_matches 
             SET score_home = ?, score_away = ?, winner_team_id = ?, status = ?, completed_at = NOW()
             WHERE id = ?',
            [$scoreHome, $scoreAway, $winnerId, 'completed', $matchId]
        );

        return [
            'success' => true,
            'match_id' => $matchId,
            'winner_team_id' => $winnerId,
            'score' => "{$scoreHome}-{$scoreAway}",
        ];
    }
}
