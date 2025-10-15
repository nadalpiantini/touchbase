<?php
/**
 * TouchBase Spanish Translations
 */

return [
    // App
    'app.name' => 'TouchBase',
    'app.tagline' => 'Sistema de Gestión de Clubes de Béisbol',
    'app.welcome' => 'Bienvenido a TouchBase',
    'app.description' => 'Sistema completo de gestión de clubes de béisbol para equipos, calendarios y estadísticas',

    // Navigation
    'nav.main' => 'Navegación principal',
    'nav.dashboard' => 'Panel de Control',
    'nav.home' => 'Inicio',
    'nav.teams' => 'Equipos',
    'nav.roster' => 'Roster',
    'nav.schedule' => 'Calendario',
    'nav.attendance' => 'Asistencia',
    'nav.stats' => 'Estadísticas',
    'nav.tournaments' => 'Torneos',
    'nav.standings' => 'Posiciones',
    'nav.ai_assistant' => 'Asistente IA',
    'nav.settings' => 'Configuración',
    'nav.logout' => 'Cerrar Sesión',

    // Teams
    'team.title' => 'Equipos',
    'team.create' => 'Crear Equipo',
    'team.edit' => 'Editar Equipo',
    'team.delete' => 'Eliminar Equipo',
    'team.name' => 'Nombre del Equipo',
    'team.category' => 'Categoría',
    'team.club' => 'Club',
    'team.season' => 'Temporada',
    'team.no_teams' => 'No se encontraron equipos',
    'team.view_roster' => 'Ver Roster',
    'team.view_schedule' => 'Ver Calendario',

    // Roster
    'roster.title' => 'Roster',
    'roster.add_player' => 'Agregar Jugador',
    'roster.remove_player' => 'Remover Jugador',
    'roster.player_name' => 'Nombre del Jugador',
    'roster.number' => 'Número',
    'roster.position' => 'Posición',
    'roster.notes' => 'Notas',
    'roster.no_players' => 'No hay jugadores en este roster',

    // Schedule
    'schedule.title' => 'Calendario',
    'schedule.create_event' => 'Crear Evento',
    'schedule.edit_event' => 'Editar Evento',
    'schedule.practice' => 'Práctica',
    'schedule.game' => 'Juego',
    'schedule.opponent' => 'Oponente',
    'schedule.venue' => 'Sede',
    'schedule.start_time' => 'Hora de Inicio',
    'schedule.end_time' => 'Hora de Fin',
    'schedule.notes' => 'Notas',
    'schedule.no_events' => 'No hay eventos programados',
    'schedule.upcoming' => 'Próximos Eventos',
    'schedule.past' => 'Eventos Pasados',

    // Attendance
    'attendance.title' => 'Asistencia',
    'attendance.record' => 'Registrar Asistencia',
    'attendance.date' => 'Fecha',
    'attendance.status' => 'Estado',
    'attendance.present' => 'Presente',
    'attendance.late' => 'Tardío',
    'attendance.absent' => 'Ausente',
    'attendance.excused' => 'Justificado',
    'attendance.comment' => 'Comentario',
    'attendance.rate' => 'Tasa de Asistencia',
    'attendance.stats' => 'Estadísticas de Asistencia',

    // Statistics
    'stats.title' => 'Estadísticas',
    'stats.record' => 'Registrar Estadística',
    'stats.metric' => 'Métrica',
    'stats.value' => 'Valor',
    'stats.player' => 'Jugador',
    'stats.summary' => 'Resumen del Jugador',
    'stats.avg' => 'Promedio',
    'stats.max' => 'Máximo',
    'stats.min' => 'Mínimo',
    'stats.total' => 'Total',

    // Common Actions
    'action.create' => 'Crear',
    'action.edit' => 'Editar',
    'action.delete' => 'Eliminar',
    'action.save' => 'Guardar',
    'action.cancel' => 'Cancelar',
    'action.submit' => 'Enviar',
    'action.search' => 'Buscar',
    'action.filter' => 'Filtrar',
    'action.export' => 'Exportar',
    'action.import' => 'Importar',
    'action.back' => 'Volver',
    'action.view' => 'Ver',

    // Success Messages
    'success.team_created' => 'Equipo creado exitosamente',
    'success.team_updated' => 'Equipo actualizado exitosamente',
    'success.team_deleted' => 'Equipo eliminado exitosamente',
    'success.player_added_to_roster' => 'Jugador agregado al roster',
    'success.roster_entry_updated' => 'Entrada del roster actualizada',
    'success.player_removed_from_roster' => 'Jugador removido del roster',
    'success.event_created' => 'Evento creado exitosamente',
    'success.event_updated' => 'Evento actualizado exitosamente',
    'success.event_deleted' => 'Evento eliminado exitosamente',
    'success.attendance_recorded' => 'Asistencia registrada exitosamente',
    'success.stat_recorded' => 'Estadística registrada exitosamente',
    'success.roster_imported' => 'Roster importado exitosamente',
    'success.schedule_imported' => 'Calendario importado exitosamente',

    // Error Messages
    'error.route_not_found' => 'Ruta no encontrada',
    'error.team_not_found' => 'Equipo no encontrado',
    'error.team_name_required' => 'El nombre del equipo es requerido',
    'error.team_category_required' => 'La categoría del equipo es requerida',
    'error.player_already_on_roster' => 'El jugador ya está en este roster',
    'error.invalid_event_type' => 'Tipo de evento inválido (debe ser práctica o juego)',
    'error.start_time_required' => 'La hora de inicio es requerida',
    'error.invalid_attendance_status' => 'Estado de asistencia inválido',
    'error.date_required' => 'La fecha es requerida',
    'error.team_id_required' => 'El ID del equipo es requerido',
    'error.metric_required' => 'El nombre de la métrica es requerido',
    'error.team_and_user_required' => 'El ID del equipo y del usuario son requeridos',
    'error.unauthorized' => 'No autorizado - Por favor inicia sesión',
    'error.forbidden' => 'Prohibido - No tienes permiso',
    'error.file_upload_failed' => 'Falló la subida del archivo',
    'error.internal_server_error' => 'Error interno del servidor',

    // Forms
    'form.required' => 'Campo requerido',
    'form.optional' => 'Opcional',
    'form.select_option' => 'Seleccione una opción',

    // Language
    'lang.english' => 'Inglés',
    'lang.spanish' => 'Español',
    'lang.change' => 'Cambiar Idioma',

    // Footer
    'footer.powered_by' => 'Desarrollado con',
    'footer.copyright' => 'Todos los derechos reservados',

    // AI Assistant
    'ai.assistant_title' => 'Asistente de Entrenador (IA)',
    'ai.assistant_description' => 'Obtenga información de entrenamiento con IA basada en los datos de su equipo',
    'ai.ask_question' => 'Hacer una Pregunta',
    'ai.team_context' => 'Contexto del Equipo',
    'ai.no_team_context' => 'Sin equipo específico',
    'ai.your_question' => 'Tu Pregunta',
    'ai.question_placeholder' => 'ej., ¿En qué ejercicios deberíamos enfocarnos según nuestras estadísticas?',
    'ai.ask_button' => 'Preguntar al Asistente',
    'ai.answer_title' => 'Respuesta del Asistente',
    'ai.disclaimer' => 'Nota: Las sugerencias de IA son solo de referencia. Siempre use su juicio profesional.',
    'ai.status_online' => 'En línea',
    'ai.status_offline' => 'Fuera de línea',
    'ai.suggested_questions' => 'Preguntas Sugeridas',
    'ai.category_practice' => 'Práctica y Ejercicios',
    'ai.category_strategy' => 'Estrategia y Táctica',
    'ai.category_performance' => 'Análisis de Rendimiento',
    'ai.suggest_drills' => '¿En qué ejercicios deberíamos enfocarnos esta semana?',
    'ai.suggest_batting' => '¿Cómo podemos mejorar nuestra práctica de bateo?',
    'ai.suggest_conditioning' => '¿Qué ejercicios de acondicionamiento se recomiendan?',
    'ai.suggest_lineup' => '¿Qué orden de bateo sugieres?',
    'ai.suggest_opponent' => '¿Cómo debemos prepararnos para el próximo oponente?',
    'ai.suggest_players' => '¿Qué jugadores necesitan atención extra?',
    'ai.suggest_attendance' => '¿Cómo podemos mejorar la asistencia del equipo?',

    // Notifications
    'notify.event_notification' => 'Notificación de Evento del Equipo',
    'notify.event_reminder_subject' => 'Recordatorio de Evento',
    'notify.event_reminder_message' => 'Recordatorio: %s el %s en %s',

    // Billing
    'billing.title' => 'Facturación y Pagos',
    'billing.create_checkout' => 'Crear Pago',
    'billing.history' => 'Historial de Pagos',

    // Common
    'common.tbd' => 'Por Determinar',

    // Errors (additional)
    'error.question_required' => 'La pregunta es requerida',
    'error.amount_required' => 'El monto es requerido',
    'error.team_id_and_message_required' => 'El ID del equipo y el mensaje son requeridos',
    'error.no_active_players_in_roster' => 'No hay jugadores activos en el roster',
    'error.event_id_required' => 'El ID del evento es requerido',
    'error.event_not_found' => 'Evento no encontrado',
];
