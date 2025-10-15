-- ============================================================
-- PelotaPack Sample Data
-- Demo club, season, and team for testing
-- ============================================================

-- Insert demo club (if not exists)
INSERT IGNORE INTO touchbase_clubs (id, name, city, country)
VALUES (1, 'Demo Baseball Club', 'Santo Domingo', 'Dominican Republic');

-- Insert demo season
INSERT IGNORE INTO touchbase_seasons (id, club_id, name, start_date, end_date, is_active)
VALUES (1, 1, '2025-2026 Season', '2025-09-01', '2026-06-30', TRUE);

-- Insert demo teams
INSERT IGNORE INTO touchbase_teams (id, club_id, season_id, name, category)
VALUES
    (1, 1, 1, 'Tigers U12', 'U12'),
    (2, 1, 1, 'Lions U10', 'U10'),
    (3, 1, 1, 'Bears U8', 'U8');

-- Note: Player roster will be added manually or via CSV import
-- after Chamilo users are created

-- Insert sample schedule for U12 team
INSERT IGNORE INTO touchbase_schedule (team_id, type, opponent, venue, start_at, end_at, notes)
VALUES
    -- Practices
    (1, 'practice', NULL, 'Main Field', '2025-10-20 16:00:00', '2025-10-20 18:00:00', 'Focus on batting drills'),
    (1, 'practice', NULL, 'Main Field', '2025-10-22 16:00:00', '2025-10-22 18:00:00', 'Pitching and fielding'),
    (1, 'practice', NULL, 'Main Field', '2025-10-24 16:00:00', '2025-10-24 18:00:00', 'Team scrimmage'),

    -- Games
    (1, 'game', 'Eagles Academy', 'Stadium Norte', '2025-10-26 10:00:00', '2025-10-26 12:00:00', 'League Week 1'),
    (1, 'game', 'Sharks United', 'Home Field', '2025-11-02 14:00:00', '2025-11-02 16:00:00', 'League Week 2'),
    (1, 'game', 'Panthers FC', 'Stadium Este', '2025-11-09 10:00:00', '2025-11-09 12:00:00', 'League Week 3');

-- Insert sample schedule for U10 team
INSERT IGNORE INTO touchbase_schedule (team_id, type, opponent, venue, start_at, end_at, notes)
VALUES
    (2, 'practice', NULL, 'Practice Field', '2025-10-21 15:00:00', '2025-10-21 16:30:00', 'Basic skills'),
    (2, 'practice', NULL, 'Practice Field', '2025-10-23 15:00:00', '2025-10-23 16:30:00', 'Team coordination'),
    (2, 'game', 'Cubs Academy', 'Home Field', '2025-10-27 11:00:00', '2025-10-27 12:30:00', 'Friendly match');

-- Success message
SELECT 'Sample data loaded successfully! 🎉' AS status;
SELECT 'Created:' AS info, '1 club, 1 season, 3 teams, 9 scheduled events' AS details;
