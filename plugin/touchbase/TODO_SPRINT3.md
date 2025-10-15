# TODO - Sprint 3 Priorities

## 🔴 Critical (Before Production Deployment)

### 1. AI Audit Logging
**Why**: Compliance, debugging, analytics
**What**:
- Create `pelota_ai_requests` table
- Log: user_id, team_id, question, answer, timestamp, tokens_used
- Retention policy: 90 days minimum for compliance

**Files to create**:
- `migrations/007_ai_audit.sql`
- Update `src/AI/CoachAssistant.php` to log all requests

---

### 2. Run Database Migrations
**What**:
```bash
# Run in order:
php bin/console pelota:migrate 002  # Branding
php bin/console pelota:migrate 005  # Email queue
php bin/console pelota:migrate 006  # Billing
php bin/console pelota:migrate 007  # AI audit (when created)
```

---

### 3. Environment Configuration
**What**: Set production environment variables

**Required ENV vars**:
```bash
# AWS Bedrock (for DeepSeek)
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
DEEPSEEK_MODEL=deepseek.r1

# Stripe
STRIPE_KEY=pk_live_...
STRIPE_SECRET=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SMTP (for notifications)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG....

# Base URL
BASE_URL=https://touchbase.sujeto10.com
```

---

## 🟡 High Priority (Sprint 3)

### 4. Mobile PWA
**Why**: Top user request from community research
**What**:
- Service worker for offline
- manifest.json for installability
- Offline-first attendance recording
- Background sync for queued operations

**Estimated effort**: 3-5 days

---

### 5. SMS Notifications
**Why**: "Half the parents don't check email" (Reddit feedback)
**What**:
- Integrate Twilio
- Add phone number to roster
- SMS opt-in/opt-out per player
- Cost tracking per message

**Estimated effort**: 2 days

---

### 6. Auto-Calculated Stats
**Why**: Manual calculation is error-prone and time-consuming
**What**:
- Batting: AVG, OBP, SLG, OPS
- Pitching: ERA, WHIP, K/9, BB/9
- Real-time updates on stat entry
- Leaderboards (team-wide, league-wide)

**Estimated effort**: 3 days

---

### 7. Payment Plans
**Why**: Not all parents can pay full fee upfront
**What**:
- Monthly installments
- Partial payment tracking
- Auto-reminders for overdue payments
- Per-player invoicing

**Estimated effort**: 2-3 days

---

## 🟢 Medium Priority (Sprint 3-4)

### 8. Photo/Video Gallery
**Why**: 3rd most requested feature after payments and SMS
**What**:
- Team photo gallery (upload via coach)
- Video upload (practice highlights, game footage)
- Per-player tagging
- Parental consent for sharing

**Estimated effort**: 4-5 days

---

### 9. Advanced Availability
**Why**: Binary yes/no is too limiting
**What**:
- Options: yes, no, maybe, late
- Arrival time estimation
- Automatic lineup adjustment based on availability
- Conflict detection (player on 2 teams)

**Estimated effort**: 2 days

---

### 10. Multi-Language Expansion
**Why**: Growing Hispanic baseball market + international users
**What**:
- French (Canada)
- Portuguese (Brazil)
- Japanese (NPB interest)
- Translation management UI for admins

**Estimated effort**: 3 days (per language)

---

## 🔵 Low Priority (Sprint 4+)

### 11. Native Mobile Apps
**Why**: Better performance than PWA, but PWA covers 80% of use cases
**What**:
- React Native or Flutter
- iOS + Android
- Push notifications (native)
- Camera integration for stats entry (OCR scorecards)

**Estimated effort**: 4-6 weeks

---

### 12. Live Game Tracking
**Why**: Enables real-time stats, parent following from home
**What**:
- Pitch-by-pitch tracking
- Play-by-play entry
- Live scoreboard widget
- Integration with popular scorekeeping apps

**Estimated effort**: 3-4 weeks

---

### 13. Public Team Websites
**Why**: Teams want public presence without managing separate site
**What**:
- Auto-generated from roster/schedule
- Custom subdomain (team-name.touchbase.sujeto10.com)
- SEO optimization
- Social media sharing

**Estimated effort**: 2 weeks

---

## 📊 Sprint 3 Recommended Scope

**Total capacity**: 10-15 days (2-3 week sprint)

**Recommended inclusions**:
1. ✅ AI Audit Logging (1 day) - Critical
2. ✅ Database Migrations (0.5 day) - Critical
3. ✅ Environment Setup (0.5 day) - Critical
4. ✅ Mobile PWA (4 days) - High ROI
5. ✅ SMS Notifications (2 days) - Top user request
6. ✅ Auto-Calculated Stats (3 days) - High value
7. ✅ Payment Plans (3 days) - Competitive parity

**Total**: ~14 days = Sprint 3 complete

**Deferred to Sprint 4**:
- Photo/Video Gallery
- Advanced Availability
- Multi-Language Expansion

---

## 🧪 Testing Checklist (Before Sprint 3 Launch)

- [ ] Accessibility audit (WAVE, axe DevTools)
- [ ] Performance (Lighthouse ≥90 score)
- [ ] Security scan (OWASP ZAP)
- [ ] Browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive testing (iOS Safari, Android Chrome)
- [ ] Load testing (100 concurrent users)
- [ ] Backup/restore procedures
- [ ] Monitoring setup (Sentry, New Relic, or similar)

---

**Last Updated**: 2025-10-15
**Owner**: Development Team
**Review Cadence**: Weekly during Sprint 3
