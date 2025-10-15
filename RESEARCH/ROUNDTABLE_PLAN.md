# Expert Roundtable Plan - TouchBase Sprint 2

## Objective
Gather insights from 8-10 domain experts to validate Sprint 2 design decisions and identify future improvements for production readiness.

## Format
- **Duration**: 60-90 minutes
- **Method**: Semi-structured interviews + short written feedback
- **Consent**: All participants sign consent form (below)
- **Deliverable**: Consolidated notes in `ROUNDTABLE_NOTES.md`

---

## Target Experts

### 1. Youth Baseball Coach
**Focus**: Day-to-day operational needs, parent communication, practice planning

**Key Questions**:
- How often do you currently notify parents about schedule changes?
- What's the biggest pain point in managing team availability?
- Would you use an AI assistant for drill suggestions? What concerns do you have?

---

### 2. Sports Data Analyst
**Focus**: Stats tracking, performance metrics, injury prevention

**Key Questions**:
- What key metrics should we track beyond batting/fielding stats?
- How do you handle workload management to prevent injuries?
- What analytics would be most valuable for youth coaches?

---

### 3. SaaS Architect
**Focus**: API design, webhooks, third-party integrations, scalability

**Key Questions**:
- What REST API endpoints are must-haves for external integrations?
- How should we handle webhook delivery failures?
- What's the ideal authentication flow for team management apps?

---

### 4. UX Designer
**Focus**: Mobile-first design, accessibility, navigation patterns

**Key Questions**:
- How many navigation levels are too many for sports team management?
- What's the ideal placement for primary CTAs on mobile?
- How should we handle table density on small screens?

---

### 5. AI Safety Engineer
**Focus**: PII protection, guardrails, audit trails, consent

**Key Questions**:
- What PII should NEVER be sent to LLM providers?
- How do we handle minors' data in AI context?
- What audit logs are essential for compliance?

---

### 6. Club Admin (Payments)
**Focus**: Fee collection, reconciliation, reporting

**Key Questions**:
- What payment workflows do clubs typically use?
- How do you handle partial payments or payment plans?
- What reconciliation reports are needed monthly/quarterly?

---

### 7. Privacy Counsel
**Focus**: GDPR/CCPA compliance, minors' consent, data retention

**Key Questions**:
- What's the minimum age for consent in sports management systems?
- How long should we retain player data after they leave?
- What privacy controls should parents have?

---

### 8. Mobile Engineer
**Focus**: PWA, offline capabilities, sync, performance

**Key Questions**:
- What features MUST work offline (attendance, roster)?
- How do we handle sync conflicts when multiple coaches edit?
- What's the acceptable load time for mobile dashboards?

---

### 9. Strength & Conditioning Coach
**Focus**: Training plans, drill libraries, progression tracking

**Key Questions**:
- What drill tagging system makes sense (age, skill level, equipment)?
- How do you assign individual vs team drills?
- What progression metrics matter most?

---

### 10. Parent Representative
**Focus**: Read-only access, simplicity, trust

**Key Questions**:
- What information do parents most want to see?
- How often should they receive notifications?
- What concerns do you have about data privacy?

---

## Consent Template

```
EXPERT ROUNDTABLE CONSENT FORM
TouchBase Research - Sprint 2

I, [NAME], consent to participate in the TouchBase expert roundtable.

I understand that:
- My feedback will be used to improve the product
- Notes may be shared internally and in documentation
- My identity may be anonymized in public-facing materials
- I can withdraw consent at any time

Signature: ________________  Date: __________
```

---

## Session Agenda

### Pre-Session (5 min)
- Welcome and introductions
- Review consent form
- Explain TouchBase Sprint 2 goals

### Interview (40-60 min)
- Domain-specific questions (see above)
- Live demo of Sprint 2 features
- Open feedback and concerns

### Wrap-Up (10 min)
- Prioritization exercise: "What matters most?"
- Next steps and timeline

---

## Documentation

All feedback will be consolidated into `ROUNDTABLE_NOTES.md` with:
- Key insights per expert
- Common themes across domains
- Prioritized action items
- Quotes (with permission)

---

## Success Criteria

✅ At least 8/10 experts participate
✅ Actionable feedback on Sprint 2 features
✅ Validation of AI guardrails and privacy approach
✅ Mobile/accessibility improvements identified
✅ Integration requirements clarified
