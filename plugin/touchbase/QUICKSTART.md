# TouchBase Quick Start Guide

Get TouchBase running in 2 minutes.

## Prerequisites

- Docker and Docker Compose installed
- Port 80 available (or edit `docker-compose.yml`)

## One-Command Deploy

```bash
cd plugin/touchbase
./deploy.sh
```

That's it! Visit `http://localhost/touchbase`

## What You Get

- **3 demo teams**: Tigers U12, Lions U10, Bears U8
- **1 season**: 2025-2026
- **Sample schedule**: 9 events (practices & games)
- **Full API**: 25+ endpoints ready to use
- **3 embeddable widgets**: Schedule, Roster, Attendance
- **EN/ES i18n**: Auto-detection + manual switcher

## Quick Commands

```bash
# View logs
docker-compose logs -f app

# Access database
docker exec -it pelota_db mysql -uchamilo -pchamilo chamilo

# Stop everything
docker-compose down

# Restart
docker-compose restart
```

## Quick Tests

**Test API:**
```bash
curl http://localhost/touchbase/api/teams | jq
```

**Test widget:**
```bash
open "http://localhost/touchbase/widgets/schedule?team_id=1&lang=en"
```

**Test CSV export:**
```bash
curl "http://localhost/touchbase/api/export/roster?team_id=1" -o roster.csv
cat roster.csv
```

## Common Issues

**Port 80 in use:**
```bash
# Edit docker-compose.yml, change "80:80" to "8080:80"
# Then access at http://localhost:8080/touchbase
```

**Database not ready:**
```bash
# Wait 10 seconds, then retry migrations
sleep 10
docker exec -i pelota_db mysql -uchamilo -pchamilo chamilo < migrations/001_init.sql
```

**Permission denied on deploy.sh:**
```bash
chmod +x deploy.sh
./deploy.sh
```

## Next Steps

1. Complete Chamilo installation (if needed)
2. Create users in Chamilo admin
3. Add players to roster via API or CSV
4. Embed widgets in courses
5. Customize theme colors in `main/css/themes/clubball/`

## Need Help?

- Full docs: `INSTALL.md`
- API reference: `README.md#api-reference`
- GitHub: https://github.com/yourusername/touchbase/issues
