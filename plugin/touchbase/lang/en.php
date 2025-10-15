<?php
/**
 * TouchBase English Translations
 */

return [
    // App
    'app.name' => 'TouchBase',
    'app.tagline' => 'Baseball Club Management System',
    'app.welcome' => 'Welcome to TouchBase',
    'app.description' => 'Complete baseball club management system for teams, schedules, and stats',

    // Navigation
    'nav.main' => 'Main navigation',
    'nav.dashboard' => 'Dashboard',
    'nav.home' => 'Home',
    'nav.teams' => 'Teams',
    'nav.roster' => 'Roster',
    'nav.schedule' => 'Schedule',
    'nav.attendance' => 'Attendance',
    'nav.stats' => 'Statistics',
    'nav.tournaments' => 'Tournaments',
    'nav.standings' => 'Standings',
    'nav.ai_assistant' => 'AI Assistant',
    'nav.settings' => 'Settings',
    'nav.logout' => 'Logout',

    // Teams
    'team.title' => 'Teams',
    'team.create' => 'Create Team',
    'team.edit' => 'Edit Team',
    'team.delete' => 'Delete Team',
    'team.name' => 'Team Name',
    'team.category' => 'Category',
    'team.club' => 'Club',
    'team.season' => 'Season',
    'team.no_teams' => 'No teams found',
    'team.view_roster' => 'View Roster',
    'team.view_schedule' => 'View Schedule',

    // Roster
    'roster.title' => 'Roster',
    'roster.add_player' => 'Add Player',
    'roster.remove_player' => 'Remove Player',
    'roster.player_name' => 'Player Name',
    'roster.number' => 'Number',
    'roster.position' => 'Position',
    'roster.notes' => 'Notes',
    'roster.no_players' => 'No players on this roster',

    // Schedule
    'schedule.title' => 'Schedule',
    'schedule.create_event' => 'Create Event',
    'schedule.edit_event' => 'Edit Event',
    'schedule.practice' => 'Practice',
    'schedule.game' => 'Game',
    'schedule.opponent' => 'Opponent',
    'schedule.venue' => 'Venue',
    'schedule.start_time' => 'Start Time',
    'schedule.end_time' => 'End Time',
    'schedule.notes' => 'Notes',
    'schedule.no_events' => 'No scheduled events',
    'schedule.upcoming' => 'Upcoming Events',
    'schedule.past' => 'Past Events',

    // Attendance
    'attendance.title' => 'Attendance',
    'attendance.record' => 'Record Attendance',
    'attendance.date' => 'Date',
    'attendance.status' => 'Status',
    'attendance.present' => 'Present',
    'attendance.late' => 'Late',
    'attendance.absent' => 'Absent',
    'attendance.excused' => 'Excused',
    'attendance.comment' => 'Comment',
    'attendance.rate' => 'Attendance Rate',
    'attendance.stats' => 'Attendance Statistics',

    // Statistics
    'stats.title' => 'Statistics',
    'stats.record' => 'Record Stat',
    'stats.metric' => 'Metric',
    'stats.value' => 'Value',
    'stats.player' => 'Player',
    'stats.summary' => 'Player Summary',
    'stats.avg' => 'Average',
    'stats.max' => 'Maximum',
    'stats.min' => 'Minimum',
    'stats.total' => 'Total',

    // Common Actions
    'action.create' => 'Create',
    'action.edit' => 'Edit',
    'action.delete' => 'Delete',
    'action.save' => 'Save',
    'action.cancel' => 'Cancel',
    'action.submit' => 'Submit',
    'action.search' => 'Search',
    'action.filter' => 'Filter',
    'action.export' => 'Export',
    'action.import' => 'Import',
    'action.back' => 'Back',
    'action.view' => 'View',

    // Success Messages
    'success.team_created' => 'Team created successfully',
    'success.team_updated' => 'Team updated successfully',
    'success.team_deleted' => 'Team deleted successfully',
    'success.player_added_to_roster' => 'Player added to roster',
    'success.roster_entry_updated' => 'Roster entry updated',
    'success.player_removed_from_roster' => 'Player removed from roster',
    'success.event_created' => 'Event created successfully',
    'success.event_updated' => 'Event updated successfully',
    'success.event_deleted' => 'Event deleted successfully',
    'success.attendance_recorded' => 'Attendance recorded successfully',
    'success.stat_recorded' => 'Statistic recorded successfully',
    'success.roster_imported' => 'Roster imported successfully',
    'success.schedule_imported' => 'Schedule imported successfully',

    // Tournaments
    'tournament.title' => 'Tournaments',
    'tournament.create' => 'Create Tournament',
    'tournament.name' => 'Tournament Name',
    'tournament.format' => 'Format',
    'tournament.format.round_robin' => 'Round Robin',
    'tournament.format.knockout' => 'Knockout',
    'tournament.format.groups_knockout' => 'Groups + Knockout',
    'tournament.format.double_elimination' => 'Double Elimination',
    'tournament.status' => 'Status',
    'tournament.teams_count' => 'Teams',
    'tournament.matches_count' => 'Matches',
    'tournament.generate_bracket' => 'Generate Bracket',
    'tournament.add_team' => 'Add Team',
    'tournament.no_tournaments' => 'No tournaments found',

    // Standings
    'standings.title' => 'Standings',
    'standings.rank' => 'Rank',
    'standings.team' => 'Team',
    'standings.games_played' => 'GP',
    'standings.wins' => 'W',
    'standings.losses' => 'L',
    'standings.ties' => 'T',
    'standings.win_pct' => 'WIN%',
    'standings.runs_for' => 'RF',
    'standings.runs_against' => 'RA',
    'standings.run_diff' => '+/-',

    // Error Messages
    'error.route_not_found' => 'Route not found',
    'error.team_not_found' => 'Team not found',
    'error.team_name_required' => 'Team name is required',
    'error.team_category_required' => 'Team category is required',
    'error.player_already_on_roster' => 'Player is already on this roster',
    'error.invalid_event_type' => 'Invalid event type (must be practice or game)',
    'error.start_time_required' => 'Start time is required',
    'error.invalid_attendance_status' => 'Invalid attendance status',
    'error.date_required' => 'Date is required',
    'error.team_id_required' => 'Team ID is required',
    'error.metric_required' => 'Metric name is required',
    'error.team_and_user_required' => 'Team ID and User ID are required',
    'error.unauthorized' => 'Unauthorized - Please log in',
    'error.forbidden' => 'Forbidden - You do not have permission',
    'error.file_upload_failed' => 'File upload failed',
    'error.internal_server_error' => 'Internal server error',

    // Forms
    'form.required' => 'Required field',
    'form.optional' => 'Optional',
    'form.select_option' => 'Select an option',

    // Language
    'lang.english' => 'English',
    'lang.spanish' => 'Spanish',
    'lang.change' => 'Change Language',

    // Footer
    'footer.powered_by' => 'Powered by',
    'footer.copyright' => 'All rights reserved',

    // AI Assistant
    'ai.assistant_title' => 'Coach Assistant (AI)',
    'ai.assistant_description' => 'Get AI-powered coaching insights based on your team data',
    'ai.ask_question' => 'Ask a Question',
    'ai.team_context' => 'Team Context',
    'ai.no_team_context' => 'No specific team',
    'ai.your_question' => 'Your Question',
    'ai.question_placeholder' => 'e.g., What drills should we focus on based on our stats?',
    'ai.ask_button' => 'Ask Assistant',
    'ai.answer_title' => 'Coach Assistant Answer',
    'ai.disclaimer' => 'Note: AI suggestions are for reference only. Always use professional judgment.',
    'ai.status_online' => 'Online',
    'ai.status_offline' => 'Offline',
    'ai.suggested_questions' => 'Suggested Questions',
    'ai.category_practice' => 'Practice & Drills',
    'ai.category_strategy' => 'Strategy & Tactics',
    'ai.category_performance' => 'Performance Analysis',
    'ai.suggest_drills' => 'What drills should we focus on this week?',
    'ai.suggest_batting' => 'How can we improve our batting practice?',
    'ai.suggest_conditioning' => 'What conditioning exercises are recommended?',
    'ai.suggest_lineup' => 'What batting order do you suggest?',
    'ai.suggest_opponent' => 'How should we prepare for the next opponent?',
    'ai.suggest_players' => 'Which players need extra attention?',
    'ai.suggest_attendance' => 'How can we improve team attendance?',

    // Notifications
    'notify.event_notification' => 'Team Event Notification',
    'notify.event_reminder_subject' => 'Event Reminder',
    'notify.event_reminder_message' => 'Reminder: %s on %s at %s',

    // Billing
    'billing.title' => 'Billing & Payments',
    'billing.create_checkout' => 'Create Checkout',
    'billing.history' => 'Payment History',

    // Common
    'common.tbd' => 'To Be Determined',

    // Errors (additional)
    'error.question_required' => 'Question is required',
    'error.amount_required' => 'Amount is required',
    'error.team_id_and_message_required' => 'Team ID and message are required',
    'error.no_active_players_in_roster' => 'No active players in roster',
    'error.event_id_required' => 'Event ID is required',
    'error.event_not_found' => 'Event not found',
];
