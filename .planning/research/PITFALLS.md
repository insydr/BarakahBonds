# Barakah Bonds: Critical Pitfalls Research

> **Purpose:** Prevent common mistakes in mental health/relationship platforms serving Muslim families. Each pitfall includes warning signs, prevention strategies, and phase mapping.

---

## 1. Cultural/Religious Pitfalls

### 1.1 The "Cultural Tourist" Trap

**The Pitfall:** Building features based on assumptions about Muslim families rather than lived experience. Treating "Muslim" as a monolith when the community spans vastly different cultures (South Asian, Arab, African, Southeast Asian, Western converts).

**Warning Signs:**
- Content uses only Arab-centric Islamic terminology (ignoring Urdu/Farsi terms common in South Asian communities)
- Examples assume patriarchal family structures when many Muslim families are matriarchal or egalitarian
- All test users share the same cultural background as founders
- Content references feel "translated" rather than native

**Prevention Strategy:**
- Establish diverse advisory board with representatives from South Asian, Arab, African, and convert communities
- Conduct user research in multiple regions/cultures before feature finalization
- Use culturally adaptive content (e.g., South Asian users see "Rishta" references; Arab users see "Nikah")
- Partner with culturally-specific mosques for testing

**Phase to Address:** Foundation (Phase 1), ongoing validation in subsequent phases

---

### 1.2 The "Imam vs. Therapist" False Binary

**The Pitfall:** Positioning the platform as either religious guidance OR clinical psychology, when the core value is bridging both. This alienates users who want integration, not substitution.

**Warning Signs:**
- Marketing emphasizes only one domain (purely clinical or purely religious)
- Religious scholars dismiss the platform as "Western psychology"
- Mental health professionals dismiss it as "religious preaching"
- Users ask "Is this Islamic or psychological?"

**Prevention Strategy:**
- Dual endorsement strategy: Secure approvals from both Islamic scholars AND licensed therapists
- Every intervention cites both an evidence base AND Islamic principle
- "Barakah Framework" explicitly maps therapeutic techniques to Islamic concepts
- Hire product team members with credentials in both domains (e.g., Muslim psychologists, chaplains with counseling training)

**Phase to Address:** Foundation (Phase 1) - core to product identity

---

### 1.3 Misalignment with Mainstream Islamic Scholarship

**The Pitfall:** Content that contradicts or deviates from mainstream Islamic positions, or controversial interpretations presented as authoritative. This destroys community trust and can cause real harm.

**Warning Signs:**
- Content uses weak or fabricated Hadith
- Quranic verses taken out of context
- Recommendations that contradict established scholarly consensus (ijma)
- Muslim users flag content as "problematic" or "bid'ah"
- Competing platforms criticize religious accuracy

**Prevention Strategy:**
- Establish a "Fiqh Review Board" with qualified scholars before content publication
- Use only authenticated (Sahih/Hasan) hadith from established collections
- When fiqh differences exist, present multiple mainstream views without taking sides
- Avoid fiqh-of-minorities controversial topics unless necessary
- Implement user flagging system for content concerns
- "Scholarly Endorsement" feature requires real scholar verification, not just citation

**Phase to Address:** Every phase - continuous review process

---

### 1.4 Ignoring the Spectrum of Religious Engagement

**The Pitfall:** Building for "practicing Muslims" only, ignoring "cultural Muslims" who may have weaker religious literacy but still identify strongly as Muslim. This limits market size and feels exclusionary.

**Warning Signs:**
- Onboarding assumes users know Arabic terminology
- Content uses complex fiqh concepts without explanation
- "Cultural Muslim" users drop off early in onboarding
- User feedback says content is "too religious" or "preachy"

**Prevention Strategy:**
- Progressive disclosure: Basic content accessible, advanced religious content optional
- "Glossary hover" for Arabic/Islamic terms with simple English explanations
- Multiple "paths" through content based on self-identified religiosity
- User testing across the spectrum (cultural, practicing, convert, born Muslim)
- Language testing: Does it resonate with someone who doesn't pray 5 times?

**Phase to Address:** Foundation (Phase 1) onboarding design

---

### 1.5 Stigmatizing Help-Seeking Through Tone

**The Pitfall:** Even well-intentioned content can reinforce stigma by treating relationship struggles as shameful failures rather than normal challenges requiring support.

**Warning Signs:**
- Content frames problems as "your fault" or "your spouse's fault"
- Language implies "good Muslims don't have these problems"
- Users feel judged rather than supported
- Fear-based messaging ("If you don't fix this, your marriage will fail")

**Prevention Strategy:**
- Reframe: "Every marriage faces challenges; seeking tools to strengthen it is sunnah"
- Highlight that even the Prophet (saw) mediated marital disputes
- Normalize struggle through case studies and testimonials
- "Prophetic model" language: The best of you are those who best treat their families
- User test tone and copy extensively before launch

**Phase to Address:** Content development (Phase 1-2)

---

### 1.6 Underestimating Extended Family Dynamics

**The Pitfall:** Designing for the nuclear couple while ignoring that Muslim marriages operate within extended family systems. Decisions, conflicts, and solutions often involve parents, in-laws, and siblings.

**Warning Signs:**
- Assessment asks only about couple, not family dynamics
- Communication tools assume couple acts independently
- No content on in-law boundaries or joint family systems
- User feedback: "This doesn't address my real problem (my mother-in-law)"

**Prevention Strategy:**
- Dedicated "Family Dynamics" module with boundary scripts
- Assessment includes "Aila" (Family) section explicitly
- Communication tools account for multi-party mediation
- Consider "family mode" features (later phase) where selected family can participate in Shura
- Content addresses: caring for aging parents, sibling rivalries affecting marriage, dowry (mahr) disputes

**Phase to Address:** Phase 2 (Family Dynamics Module) but must be in assessment from Phase 1

---

### 1.7 Cultural Insensitivity in Gender Dynamics

**The Pitfall:** Imposing Western feminist or traditionalist frameworks without acknowledging the diversity of what "healthy" looks like across Muslim cultures. This alienates users across the spectrum.

**Warning Signs:**
- Content assumes egalitarian marriage as the ideal
- Or, content assumes patriarchal structure as "Islamic"
- Users from different cultural backgrounds have opposite complaints
- "Gender roles" content triggers backlash from multiple directions

**Prevention Strategy:**
- Present multiple models of healthy Muslim marriages without prescribing one
- Focus on "consultation" (Shura) and "mutual rights and responsibilities"
- Acknowledge cultural variation explicitly: "Families differ in how they divide responsibilities..."
- Avoid telling users what their marriage "should" look like
- Let couples define their own agreements through assessment tools
- Content focuses on abuse prevention (clear red lines) rather than role prescription

**Phase to Address:** Content development (Phase 1-2), ongoing

---

## 2. Privacy & Security Pitfalls

### 2.1 The "Community Breach" Scenario

**The Pitfall:** Standard privacy protections fail to account for the specific threat model of Muslim communities: small, interconnected networks where leaked information spreads rapidly through mosques, family networks, and community gossip.

**Warning Signs:**
- Privacy features designed for "general population" threat models
- No consideration of physical community overlap (same mosque, same events)
- Data can be subpoenaed in divorce/custody proceedings
- Users fear their Imam or community members could access their data

**Prevention Strategy:**
- "Burn after reading" options for sensitive chat logs and journal entries
- Zero-knowledge encryption for the most sensitive content
- Clear data retention policies with automatic deletion
- Explicit policy on subpoena response and user notification
- Anonymous/pseudonymous account options (no real name required)
- Feature to lock app with biometric/PIN separate from phone unlock
- Consider: What happens if a user's spouse works in tech and tries to access their data?

**Phase to Address:** Foundation (Phase 1) - core architecture decision

---

### 2.2 Discrete Branding Failure

**The Pitfall:** App is recognizable as a "marriage help" or "mental health" app, creating risk when family members see it on a user's phone. This barrier prevents adoption entirely.

**Warning Signs:**
- App name or icon contains "marriage," "counseling," "therapy," or mental health terms
- Push notifications reveal sensitive content ("Your marriage tip for today")
- Opening animation is clearly about relationships
- App name shows up in app store search results for "marriage problems"

**Prevention Strategy:**
- Generic app name and icon (research what Muslim users find acceptable)
- "Stealth mode" option with generic icon and name
- Push notifications are intentionally vague ("Your daily reflection is ready")
- No visible text or images on opening screen that reveal app purpose
- User testing: "Would you be comfortable if your mother/in-law saw this on your phone?"

**Phase to Address:** Foundation (Phase 1) design

---

### 2.3 Spouse Data Asymmetry

**The Pitfall:** The platform connects couples but creates privacy issues when one partner can see the other's private reflections, assessment responses, or journal entries.

**Warning Signs:**
- Couple account shares all data between partners
- No concept of "private" vs. "shared" content
- Assessment reveals individual responses to partner without consent
- Journal entries visible to spouse

**Prevention Strategy:**
- Clear data model: Individual accounts + couple connection (not shared account)
- "Share with spouse" explicit opt-in for assessment results
- Private journal that never syncs to partner
- Assessment allows "private note" field that isn't shared
- Partner sees aggregated/combined results, not individual responses unless both consent
- "Secret" feature for domestic violence scenarios (fake "normal" content visible if coerced)

**Phase to Address:** Foundation (Phase 1) data model

---

### 2.4 Multi-Language Privacy Gaps

**The Pitfall:** Privacy policies, consent forms, and data handling explanations are only available in English, leaving non-English speakers without true informed consent.

**Warning Signs:**
- Legal documents only in English
- Technical terms not translated
- Users from target language groups (Urdu, Arabic, French) skip consent without understanding
- Privacy settings not localized

**Prevention Strategy:**
- Full localization of all privacy-related content
- Legal review of translated consent documents
- Simple, non-technical language in all languages
- Visual explanations of data handling for low-literacy users
- Audio versions of privacy explanations

**Phase to Address:** Phase 2 (Language expansion), but English version must be accessible from Phase 1

---

### 2.5 HIPAA Compliance Theater

**The Pitfall:** Claiming HIPAA compliance without implementing actual required safeguards, or implementing technical safeguards without administrative and physical safeguards.

**Warning Signs:**
- "HIPAA compliant" marketing without detailed compliance documentation
- No Business Associate Agreements with third-party vendors
- No audit logging of data access
- No incident response plan
- Encryption only in transit, not at rest
- Developer access to production data without controls

**Prevention Strategy:**
- Engage HIPAA compliance consultant early
- Full gap assessment before launch
- Implement all three safeguard types: Technical, Administrative, Physical
- Document all policies and procedures
- Train all team members on HIPAA requirements
- Regular compliance audits
- Business Associate Agreements with all third parties handling PHI
- Clear breach notification procedures

**Phase to Address:** Foundation (Phase 1) - non-negotiable for launch

---

## 3. Technical Pitfalls

### 3.1 Offline Access Failure

**The Pitfall:** App requires constant internet connection, excluding users with unreliable connectivity (common for international users, travel, or those in areas with poor coverage).

**Warning Signs:**
- App is unusable without internet
- Content cannot be downloaded for offline use
- User data not cached locally
- "Low bandwidth mode" is an afterthought

**Prevention Strategy:**
- Progressive Web App (PWA) capabilities for offline access
- Downloadable content packs for courses
- Local-first architecture with sync when online
- Audio files downloadable, not just streaming
- Text-based alternatives for all video content
- Test on 2G/3G connections and airplane mode

**Phase to Address:** Foundation (Phase 1) architecture

---

### 3.2 Notification Timing Insensitivity

**The Pitfall:** Sending notifications during prayer times, inappropriate hours, or at times that create marital tension rather than prevent it.

**Warning Signs:**
- Notifications sent at random times
- No consideration of user's prayer schedule
- "Daily tip" arrives during work hours, prayers, or late night
- Notification content could embarrass user if seen by others

**Prevention Strategy:**
- Integrate with prayer time APIs to avoid Salah times
- User-configurable quiet hours
- Timezone-aware scheduling
- "Best time to engage" machine learning based on user patterns
- Test notification timing with real users

**Phase to Address:** Phase 1 (Core notification system)

---

### 3.3 Multi-Language Content Drift

**The Pitfall:** English content updates but translations lag, creating inconsistent or outdated content in other languages. This is especially harmful when religious content differs.

**Warning Signs:**
- English content updated frequently, translations updated rarely
- Translated content contains errors or inappropriate cultural references
- No process for translation quality assurance
- Machine translation used without human review

**Prevention Strategy:**
- Translation management system with version tracking
- Native speaker review for all content before publication
- "Last updated" dates visible for each language
- User reporting mechanism for translation issues
- Prioritize key content for translation, not everything
- Religious content requires scholar review in each language

**Phase to Address:** Phase 2 (Language expansion), ongoing maintenance

---

### 3.4 Assessment Algorithm Overreach

**The Pitfall:** Assessment algorithm makes deterministic predictions about relationship success or labels users as "high risk" in ways that feel judgmental or become self-fulfilling prophecies.

**Warning Signs:**
- Algorithm outputs "probability of divorce" or similar
- Users labeled as "incompatible" or "high risk"
- Content suggests some marriages "shouldn't happen"
- Algorithm not validated on Muslim population

**Prevention Strategy:**
- Frame as "areas for discussion" not "predictions"
- No compatibility "score" - focus on understanding, not judgment
- Algorithm trained and validated on relevant populations
- Clear disclaimer: "This assessment surfaces topics for conversation, not predictions about your relationship"
- User testing: Does output feel empowering or discouraging?
- Clinical review of all algorithm outputs

**Phase to Address:** Phase 1 (Assessment launch), continuous validation

---

### 3.5 Scalability Under Community Load

**The Pitfall:** Marketing to Muslim communities creates traffic spikes around key times (Ramadan, wedding seasons) that the infrastructure cannot handle.

**Warning Signs:**
- Infrastructure sized for average load, not peaks
- No auto-scaling configured
- Single points of failure
- Performance degradation during traffic spikes
- Downtime during marketing campaigns

**Prevention Strategy:**
- Cloud infrastructure with auto-scaling
- Load testing before major marketing pushes
- Identify peak periods: Ramadan, Eid, wedding seasons, university semesters
- Graceful degradation under load
- Monitoring and alerting for performance issues
- CDN for static content delivery globally

**Phase to Address:** Phase 1 (Infrastructure foundation), ongoing

---

## 4. Content Pitfalls

### 4.1 Over-Medicalizing Normal Challenges

**The Pitfall:** Treating normal relationship adjustments as pathology requiring clinical intervention, medicalizing the normal struggles of married life.

**Warning Signs:**
- Normal disagreements labeled as "toxic patterns"
- Universal challenges framed as requiring professional help
- Content pathologizes cultural differences in conflict styles
- Users feel their relationship is "broken" after using the app

**Prevention Strategy:**
- Normalize struggle: "Every couple faces challenges; here's how to navigate them"
- Distinguish between "normal challenge," "growth area," and "clinical concern"
- Clear criteria for when professional help is appropriate
- Avoid diagnostic language in content
- User testing: Does content feel supportive or alarmist?

**Phase to Address:** Content development (Phase 1-2)

---

### 4.2 Under-Medicalizing Serious Issues

**The Pitfall:** Conversely, failing to identify genuine clinical concerns (abuse, severe depression, personality disorders) that require professional intervention.

**Warning Signs:**
- No screening for domestic violence
- No escalation path for mental health crises
- Content suggests self-help for issues requiring therapy
- Users in crisis cannot find help

**Prevention Strategy:**
- Embedded screening tools (PHQ-9, GAD-7, domestic violence indicators)
- Clear escalation path: "This seems like something that would benefit from professional support"
- Crisis resources prominently available
- Red flag detection for high-risk responses
- "Get help now" button always accessible
- Partnerships with crisis lines and Muslim therapist networks
- Training for content team on recognizing serious issues

**Phase to Address:** Phase 1 (Safety features), Phase 4 (Telehealth)

---

### 4.3 Cultural Content Irrelevance

**The Pitfall:** Content addresses generic relationship issues but ignores the specific cultural pain points of Muslim families (dowry disputes, cousin marriage dynamics, green card marriages, etc.).

**Warning Signs:**
- Content could apply to any couple (not Muslim-specific)
- No mention of common Muslim marriage challenges
- User feedback: "This doesn't address my situation"
- Examples don't reflect Muslim lived experience

**Prevention Strategy:**
- User research specifically on Muslim family pain points
- Content library includes: mahr disputes, polygamy questions, secret marriages, green card marriages, cousin marriages, forced marriage recovery, convert spouse integration
- Community-sourced content ideas
- Continuous feedback loop on content relevance

**Phase to Address:** Content development (Phase 1-2), ongoing

---

### 4.4 One-Size-Fits-All Interfaith Content

**The Pitfall:** Either ignoring interfaith marriages entirely OR taking a prescriptive stance (either "all interfaith marriages are problematic" or "all interfaith marriages are fine").

**Warning Signs:**
- No content for Muslim married to non-Muslim
- Content assumes both spouses are Muslim
- Interfaith users feel excluded or judged
- Content is preachy about "marrying within the faith"

**Prevention Strategy:**
- Acknowledge interfaith marriages exist and need support
- Focus on practical challenges (religious education of children, holiday practices, dietary restrictions)
- Present framework for navigating differences without prescribing outcomes
- Scholar guidance on various fiqh positions
- User testing with interfaith couples

**Phase to Address:** Phase 2 (Content expansion)

---

### 4.5 Outdated Scholarly References

**The Pitfall:** Using old or superseded scholarly opinions without noting that contemporary scholars may have different views, especially on fiqh-of-minorities issues.

**Warning Signs:**
- All scholarly references are classical (no contemporary scholars)
- Content doesn't acknowledge evolving scholarly discourse
- Users note that "my scholar says something different"
- Western context ignored in favor of traditional fatwas

**Prevention Strategy:**
- Include contemporary scholars (Western fiqh councils, minority fiqh experts)
- Note when scholarly opinions differ or evolve
- "Current scholarly discourse" section on controversial topics
- Regular content review cycle to update references
- Advisory board includes contemporary scholars

**Phase to Address:** Ongoing content maintenance

---

## 5. User Experience Pitfalls

### 5.1 Onboarding Friction and Drop-off

**The Pitfall:** Lengthy onboarding or assessment creates drop-off before users experience value. Pre-marital assessment in particular is at risk of being "too long" and abandoned.

**Warning Signs:**
- Assessment takes >30 minutes to complete
- No save-and-resume functionality
- Onboarding asks for too much personal information upfront
- Users abandon before completing first valuable action

**Prevention Strategy:**
- "Value first" onboarding: deliver something useful quickly
- Assessment broken into sections that can be saved
- Progress indicators and estimated time remaining
- Skip functionality for non-essential questions
- Gamification elements to encourage completion
- A/B test onboarding length and structure

**Phase to Address:** Phase 1 (MVP launch)

---

### 5.2 Spouse Non-Participation Design

**The Pitfall:** Platform designed for both spouses but in reality, often only one spouse engages. Features that require partner participation become useless if partner doesn't join.

**Warning Signs:**
- Core features require both partners to have accounts
- No value proposition for solo user
- User feedback: "My husband/wife won't use this"
- Features locked until partner joins

**Prevention Strategy:**
- "Solo mode" value proposition from Day 1
- Features that benefit individual even without partner
- "Invite partner" is enhancement, not requirement
- Communication tools work for individual reflection
- Content designed for solo consumption (courses, articles)
- Gamified partner invitation that doesn't nag

**Phase to Address:** Phase 1 (Core features)

---

### 5.3 Religious Literacy Barriers

**The Pitfall:** Content assumes religious knowledge that users may not have, creating frustration and feelings of inadequacy for users with weaker Islamic education.

**Warning Signs:**
- Arabic terms used without translation
- Hadith references without explanation of what they mean
- Users don't understand religious context
- Content feels "above my level"

**Prevention Strategy:**
- Every Arabic term has hover/click definition
- Hadith and Quranic references include full translation and explanation
- "Learn more" links for deeper religious context
- Progressive disclosure: Basic explanation first, deeper context optional
- User testing across religiosity spectrum

**Phase to Address:** Phase 1 (Content development)

---

### 5.4 Mobile-First Neglect

**The Pitfall:** Building for web and treating mobile as afterthought, when the target demographic (young Muslims, busy parents) primarily uses phones.

**Warning Signs:**
- Web features don't translate to mobile
- Small text, hard-to-tap buttons on mobile
- Features require typing long responses (hard on mobile)
- No offline mobile capability

**Prevention Strategy:**
- Mobile-first design principle
- Voice input options for long responses
- Swipe gestures for quick interactions
- Test on actual mobile devices, not just browser mobile view
- Progressive Web App for app-like experience without app store

**Phase to Address:** Foundation (Phase 1)

---

### 5.5 Accessibility Failure

**The Pitfall:** Platform is unusable for users with disabilities, low literacy, or older users, excluding significant portions of the target demographic.

**Warning Signs:**
- No screen reader support
- Small text that can't be resized
- Color contrast issues
- No audio alternatives for text content
- Complex navigation

**Prevention Strategy:**
- WCAG 2.1 AA compliance minimum
- Audio versions of key content
- Adjustable text size and contrast
- Simple navigation with clear labels
- Test with users who have disabilities
- Consider older immigrant parents as accessibility use case

**Phase to Address:** Phase 1 (Foundation), Phase 2 (Expanded content)

---

## 6. Business Model Pitfalls

### 6.1 Monetization That Erodes Trust

**The Pitfall:** Aggressive monetization (ads, premium popups, dark patterns) that feels exploitative for a mental health/relationship platform serving a religious community.

**Warning Signs:**
- Ads displayed in sensitive content areas
- Premium upsells during crisis moments
- Free tier is essentially non-functional
- Users feel "they're profiting from my problems"

**Prevention Strategy:**
- No third-party ads (erodes privacy trust)
- Freemium model with genuine free value
- Premium features are enhancement, not basic functionality
- No upsells during crisis content or conflict resolution tools
- Transparent pricing and value proposition
- Consider "pay what you can" options

**Phase to Address:** Phase 1 (Monetization design)

---

### 6.2 B2B Dependency Risk

**The Pitfall:** Relying too heavily on mosque B2B revenue, which can be unpredictable, slow to close, and subject to community politics.

**Warning Signs:**
- Revenue projections depend on mosque sales
- No B2C revenue stream as backup
- Long sales cycles with mosque boards
- Product roadmap driven by B2B customers over users

**Prevention Strategy:**
- B2C freemium as primary revenue from Day 1
- B2B as enhancement, not dependency
- Multiple mosque relationships to diversify
- Individual subscription option always available
- Don't build features solely for B2B customers

**Phase to Address:** Phase 1 (Revenue foundation), Phase 3 (B2B launch)

---

### 6.3 Community Trust Erosion

**The Pitfall:** Actions that erode trust within the Muslim community, which is highly networked and can quickly turn against products perceived as harmful or exploitative.

**Warning Signs:**
- Negative community sentiment on social media
- Scholars speaking against the platform
- "Is this halal?" questions dominating discourse
- Competitor positioning as "the trusted alternative"

**Prevention Strategy:**
- Scholarly endorsement visible and authentic
- No controversial sponsorships or partnerships
- Transparent about funding and ownership
- Active community engagement and responsiveness
- Quick response to any criticism or concerns
- "Trust as moat" - make trust a competitive advantage

**Phase to Address:** Ongoing from pre-launch

---

### 6.4 Data Monetization Temptation

**The Pitfall:** Pressure to monetize user data (analytics, research partnerships, AI training) that contradicts privacy promises and destroys trust.

**Warning Signs:**
- Internal pressure to "leverage data assets"
- Research partnership inquiries
- AI training on user data discussed
- Terms of service updated to allow data sharing

**Prevention Strategy:**
- Clear, unambiguous no-data-sale policy from Day 1
- User consent required for any research participation
- Anonymization standards beyond legal minimum
- Public transparency report on data handling
- Executive commitment to privacy as core value, not feature

**Phase to Address:** Foundation (Phase 1), ongoing governance

---

### 6.5 Feature Creep Without Validation

**The Pitfall:** Building features based on assumptions rather than validated user needs, leading to wasted development resources and product bloat.

**Warning Signs:**
- Feature backlog driven by "wouldn't it be cool"
- No user research before feature development
- Features built that users don't use
- Product complexity growing without proportional value

**Prevention Strategy:**
- User research before every feature
- Minimum Viable Feature approach
- Success metrics defined before building
- Kill underperforming features quickly
- User feedback loops integrated into development

**Phase to Address:** Every phase, ongoing

---

## Summary: Highest-Risk Pitfalls

Based on the research, these pitfalls pose the highest risk to Barakah Bonds' success:

| Priority | Pitfall | Impact | Phase to Address |
|----------|---------|--------|------------------|
| **Critical** | Privacy breach (community gossip scenario) | Platform death - users won't trust | Phase 1 |
| **Critical** | Scholarly misalignment | Community rejection, trust destruction | Phase 1, ongoing |
| **Critical** | Spouse data asymmetry | Harm to users, trust destruction | Phase 1 |
| **High** | Stigmatizing tone | Non-adoption, opposite of mission | Phase 1 |
| **High** | Over/under-medicalizing | Harm to users or missed crises | Phase 1 |
| **High** | Discrete branding failure | Non-adoption due to privacy fears | Phase 1 |
| **Medium** | Cultural insensitivity | Reduced adoption, community criticism | Phase 1-2 |
| **Medium** | Spouse non-participation design | Reduced value, churn | Phase 1 |
| **Medium** | B2B dependency | Revenue instability | Phase 3 |

---

## Usage Guide

**During Planning:** Review this document before each phase to ensure mitigation strategies are included in scope.

**During Development:** Reference warning signs section for early detection during user testing and development.

**During Review:** Use quality gate checklist to ensure pitfalls are being addressed.

---

*Last updated: 2024*
*Next review: Before Phase 1 development kickoff*
