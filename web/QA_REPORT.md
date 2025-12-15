# QA Report - TouchBase Dashboard

**Fecha**: 2025-12-15
**Ambiente**: localhost:3000 (Dev Mode)
**Usuario**: dev@touchbase.local (rol: owner)

---

## Resumen Ejecutivo

| Estado | Cantidad |
|--------|----------|
| Funcionales | 4 |
| Con Error JSON | 7 |
| Error Critico | 1 |
| **Total** | **12** |

---

## Resultados por Seccion

### Funcionales (4)

| Seccion | URL | Estado | Notas |
|---------|-----|--------|-------|
| Dashboard | `/dashboard` | OK | Stats y acciones rapidas funcionan |
| Partidos | `/dashboard/games` | OK | Formulario completo, tabla vacia correcta |
| Reportes | `/dashboard/reports` | OK | Formulario con tipos, fechas, formatos |
| Papelera | `/dashboard/recycle` | OK | Tabs y tabla funcionan correctamente |

### Con Error JSON (7)

Estas secciones muestran: `"Unexpected token '<', "<!DOCTYPE "... is not valid JSON"`

**Causa raiz**: Las APIs devuelven HTML (404) en lugar de JSON porque el `org_id` mock no existe en la base de datos.

| Seccion | URL | Componentes UI |
|---------|-----|----------------|
| Jugadores | `/dashboard/players` | Formulario OK, lista con error |
| Equipos | `/dashboard/teams` | Formulario OK, lista con error |
| Horarios | `/dashboard/schedules` | Error completo |
| Vida Estudiantil | `/dashboard/student-life` | Error completo |
| Presupuesto | `/dashboard/budgeting` | Error completo |
| Pruebas | `/dashboard/placement-tests` | Error completo |
| Auditoria | `/dashboard/audit` | Filtros OK, datos con error |

### Error Critico (1)

| Seccion | URL | Error |
|---------|-----|-------|
| Profesores | `/dashboard/teachers` | `ReferenceError: LoadingSpinner is not defined` |

**Archivo afectado**: `components/teachers/TeachersTable.tsx:49`

**Fix requerido**: Importar `LoadingSpinner` en el componente.

---

## Bugs Identificados

### BUG-001: LoadingSpinner no definido (CRITICO)
- **Archivo**: `components/teachers/TeachersTable.tsx`
- **Linea**: 49
- **Error**: `ReferenceError: LoadingSpinner is not defined`
- **Impacto**: Pagina de Profesores completamente rota
- **Fix**: Agregar import de LoadingSpinner

### BUG-002: APIs devuelven 404 en Dev Mode
- **Afecta**: 7 secciones
- **Causa**: El `org_id` mock (`dev-org`) no existe en Supabase
- **Impacto**: Listas de datos no cargan
- **Fix sugerido**:
  1. Crear org mock en DB para desarrollo
  2. O modificar APIs para retornar arrays vacios en dev mode

### BUG-003: OrgDropdown error JSON
- **Componente**: `components/org/OrgDropdown.tsx`
- **Error**: Mismo error JSON en el dropdown del menu
- **Impacto**: Visual (muestra error en nav)

---

## Screenshots Capturados

Ubicacion: `/web/.playwright-mcp/`

1. `qa-01-menu-abierto.png` - Navegacion con 12 items
2. `qa-02-jugadores.png` - Formulario OK, lista error
3. `qa-03-equipos.png` - Formulario OK, lista error
4. `qa-04-partidos.png` - Funcional completo
5. `qa-05-horarios-error.png` - Error JSON
6. `qa-06-profesores-error-critico.png` - LoadingSpinner undefined
7. `qa-07-reportes.png` - Funcional completo
8. `qa-08-papelera.png` - Funcional completo
9. `qa-09-audit.png` - Filtros OK, datos error

---

## Recomendaciones

### Prioridad Alta
1. **Fix LoadingSpinner** - Importar componente en TeachersTable.tsx
2. **Crear seed data** - Org y datos mock para desarrollo

### Prioridad Media
3. **Error handling mejorado** - Mostrar mensaje amigable cuando API falla
4. **Dev mode robusto** - APIs deben manejar org_id inexistente

### Prioridad Baja
5. **Estilos** - Los componentes se ven muy basicos (sin colores de marca)
6. **Loading states** - Algunos spinners son solo texto

---

## Proximos Pasos

- [ ] Fix BUG-001 (LoadingSpinner)
- [ ] Crear org mock en Supabase para dev
- [ ] Re-testear secciones con error JSON
- [ ] Probar portales Student y Teacher (requieren bypass adicional)
