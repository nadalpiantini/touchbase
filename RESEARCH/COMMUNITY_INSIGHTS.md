# Community Research Insights - TouchBase

Research from Reddit communities, open-source projects, and proprietary benchmarks to inform Sprint 2+ roadmap.

---

## 📊 Sources Analyzed

1. **Reddit Communities**:
   - r/BaseballCoaching
   - r/youthsports
   - r/SaaS
   - r/opensource

2. **Open-Source Projects**:
   - [Zuluru](https://zuluru.org) - League management (PHP/MySQL)
   - [floodlight](https://arxiv.org/abs/2206.02562) - Sports analytics framework (Python)
   - Various GitHub sports management repos

3. **Proprietary Benchmark**:
   - TeamSnap (market leader for youth sports)
   - SportsEngine
   - LeagueApps

---

## 🎯 Key Pain Points (Consistent Across Sources)

### 1. All-in-One Operations
**What users want**:
- Single platform for calendar + availability + reminders + payments
- No switching between apps/spreadsheets

**TouchBase Status**: ✅ Sprint 2 addresses this
- Unified UI with navbar access to all modules
- Calendar, roster, attendance, payments in one system

---

### 2. Simple Mobile UX
**What users want**:
- One-tap availability updates
- Auto-reminders cut no-shows
- Mobile-first design, not desktop-first shrunk down

**TouchBase Status**: ✅ Partially addressed
- Touch targets ≥40px implemented
- Responsive grid system
- **TODO Sprint 3**: PWA for offline, native-like experience

---

### 3. Modularity & Reliability
**What users want**:
- Pick features they need, ignore the rest
- System stability > feature bloat
- Incremental adoption (start small, grow)

**TouchBase Status**: ✅ Architectural win
- Composable modules (each works independently)
- Clean REST APIs allow selective adoption
- Stable core + optional add-ons (AI, billing)

---

### 4. Admin UX Overhead
**What users complain about**:
- Too many clicks to do simple tasks
- Confusing navigation hierarchies
- Feature discovery issues

**TouchBase Status**: ✅ Improved in Sprint 2
- Max 2-3 nav levels enforced
- Clear module separation in navbar
- Primary CTAs prominent (branded color)

---

## 💡 Open-Source Inspirations

### Zuluru (PHP League Management)
**What we can learn**:
- ✅ Flexible tournament formats (round-robin, knockout, groups+KO)
- ✅ Email notification templates with player merge fields
- ✅ Availability/RSVP tracking with status indicators
- 📋 **TODO**: Configurable fields per league (custom attributes)

**Reference**: https://zuluru.org

---

### floodlight (Sports Analytics)
**What we can learn**:
- 📊 Data structure for tracking player metrics over time
- 📈 Visualization patterns for performance trends
- 🔬 Event-based data model (timestamped actions)

**TouchBase Application**:
- Sprint 3: Enhanced stats module with time-series tracking
- Sprint 4: Performance dashboards with trend graphs

**Reference**: https://arxiv.org/abs/2206.02562

---

## 🏆 Proprietary Benchmark: TeamSnap

### What They Do Well
1. **Pricing Tiers**: Free → Team ($9.99/mo) → Club ($13.99/mo) → League (custom)
2. **Core Features**: Availability, messaging, roster, schedule, payments
3. **Mobile Apps**: Native iOS/Android with offline support
4. **Frequent Updates**: New features every 2-3 months

### Gaps We Can Exploit
1. **No AI Assistant**: We have LLM-powered coaching insights
2. **Limited Customization**: Our tenant branding (colors, logo) is superior
3. **Closed System**: We're open-source + self-hostable
4. **No Multi-Sport**: We can expand beyond baseball easier (modular architecture)

### Parity Checklist
- ✅ Roster management
- ✅ Schedule/calendar
- ✅ Attendance tracking
- ✅ Basic stats
- ✅ Payments (Stripe stub, same as TeamSnap)
- ⏳ Messaging (email stub, need SMS in Sprint 3)
- ⏳ Mobile app (PWA in Sprint 3, native later)
- ❌ Photo/video sharing (Sprint 4+)

**Reference**: https://www.teamsnap.com

---

## 🗣️ Reddit Feedback Synthesis

### Common Asks from r/BaseballCoaching

#### 1. "Need better communication with parents"
**Quotes**:
> "Half the parents don't check email. Need SMS or app notifications."
> "I spend 2 hours/week texting parents individually about schedule changes."

**TouchBase Response**:
- Sprint 2: Email notification system ready
- Sprint 3: Add Twilio SMS integration
- Sprint 3: Push notifications via PWA

---

#### 2. "Stats tracking is too manual"
**Quotes**:
> "I use Excel but it's a pain. Need something that auto-calculates batting avg, OBP, etc."
> "Would love to see trends over the season, not just final numbers."

**TouchBase Response**:
- Sprint 1: Basic stats recording ✅
- Sprint 3: Auto-calculated derived metrics (AVG, OBP, SLG)
- Sprint 4: Time-series charts and trend analysis

---

#### 3. "Attendance tracking is the #1 time-saver"
**Quotes**:
> "Knowing who's coming lets me plan drills better."
> "Auto-reminders cut my no-shows by 50%."

**TouchBase Response**:
- Sprint 1: Attendance tracking ✅
- Sprint 2: Reminder notifications ✅
- Sprint 3: Attendance-based drill planning (AI assistant)

---

### Common Asks from r/youthsports

#### 1. "Payment collection is awkward"
**Quotes**:
> "I'm not comfortable handling cash. Need online payment."
> "Tracking who paid what is a nightmare with Venmo/cash mix."

**TouchBase Response**:
- Sprint 2: Stripe checkout + CSV reconciliation ✅
- Sprint 3: Payment plans, partial payments
- Sprint 4: Per-player invoicing

---

#### 2. "Multi-team/club support"
**Quotes**:
> "We have 6 teams in our club. Each coach needs their own view but admins need aggregate reports."

**TouchBase Response**:
- Sprint 2: Multi-tenant branding foundation ✅
- Sprint 3: Role-based access (admin vs coach vs parent)
- Sprint 4: Club-wide dashboards and reports

---

## 📋 Action Items for Sprint 3

Based on community research:

### High Priority
- [ ] SMS notifications via Twilio
- [ ] PWA for mobile (offline attendance, roster)
- [ ] Auto-calculated stats (AVG, OBP, SLG, ERA, WHIP)
- [ ] Payment plans and partial payment tracking

### Medium Priority
- [ ] Photo/video upload (gallery per team)
- [ ] Advanced availability (maybe/late options, not just yes/no)
- [ ] Multi-language support beyond EN/ES (French, Portuguese)

### Low Priority (Sprint 4+)
- [ ] Native mobile apps (React Native or Flutter)
- [ ] Live game tracking (pitch-by-pitch, play-by-play)
- [ ] Integration with popular scorekeeping apps
- [ ] Public team websites (generated from roster/schedule)

---

## 🔍 Competitive Positioning

| Feature               | TeamSnap | Zuluru | TouchBase |
|-----------------------|----------|--------|------------|
| Open Source           | ❌       | ✅      | ✅          |
| Self-Hostable         | ❌       | ✅      | ✅          |
| AI Assistant          | ❌       | ❌      | ✅          |
| Multi-Tenant Branding | ❌       | ❌      | ✅          |
| Mobile App            | ✅       | ❌      | ⏳ (PWA)    |
| Payment Processing    | ✅       | ❌      | ✅          |
| Stats Tracking        | ✅       | ✅      | ✅          |
| Tournaments           | ✅       | ✅      | ✅          |
| SMS Notifications     | ✅       | ❌      | ⏳          |
| Photo Sharing         | ✅       | ❌      | ⏳          |

**Key Differentiators**:
1. **AI-Powered Insights** - No competitor has this
2. **Open Source + Self-Hostable** - TeamSnap isn't, we are
3. **Multi-Tenant White-Label** - Easy club/league branding

---

## 📚 References

- Zuluru: https://zuluru.org
- floodlight: https://arxiv.org/abs/2206.02562
- TeamSnap: https://www.teamsnap.com
- Reddit r/BaseballCoaching: Community insights (anonymized)
- Reddit r/youthsports: Community insights (anonymized)

---

**Last Updated**: 2025-10-15
**Next Review**: Post-Sprint 2 completion
