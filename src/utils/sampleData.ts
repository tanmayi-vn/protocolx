// Realistic sample conversation for demonstration
export const SAMPLE_CONVERSATION = `[10/7/25, 9:02:13 AM] Sarah Chen: Good morning team! Quick sync before standup
[10/7/25, 9:02:45 AM] Mike Torres: Morning! Just got in, give me 5
[10/7/25, 9:03:10 AM] Priya Patel: Hey all 👋 I've been waiting to share some important updates
[10/7/25, 9:03:55 AM] Sarah Chen: Go ahead Priya!
[10/7/25, 9:04:20 AM] Priya Patel: So the client (Nexus Corp) called yesterday evening. They've moved the product demo date up to FRIDAY October 10th. That's 3 days from now
[10/7/25, 9:04:35 AM] Priya Patel: Previously it was scheduled for October 17th
[10/7/25, 9:05:01 AM] Mike Torres: Wait what?? That's a huge change
[10/7/25, 9:05:15 AM] Sarah Chen: That changes everything. We need to reprioritize immediately
[10/7/25, 9:05:45 AM] Priya Patel: Yes. They specifically want to see the dashboard analytics feature and the export functionality
[10/7/25, 9:06:10 AM] Alex Johnson: Just catching up - that's really tight. Are we even close?
[10/7/25, 9:06:40 AM] Sarah Chen: The dashboard is about 80% done. Export is still being worked on by... actually who owns that?
[10/7/25, 9:07:05 AM] Mike Torres: That's on me. I started it last week but got pulled into the auth bug
[10/7/25, 9:07:22 AM] Alex Johnson: @Mike Torres can you give us an honest estimate on the export feature?
[10/7/25, 9:07:50 AM] Mike Torres: If I focus exclusively on it today and tomorrow I can have a working version by Thursday EOD. No promises on polish
[10/7/25, 9:08:15 AM] Sarah Chen: That works. Mike, please make export your ONLY priority starting now. Drop everything else
[10/7/25, 9:08:30 AM] Mike Torres: Got it. Will do
[10/7/25, 9:08:55 AM] Priya Patel: Also - the client asked about SSO integration. We need to tell them by today whether that's in scope for the demo
[10/7/25, 9:09:20 AM] Alex Johnson: SSO is definitely not ready. We should be honest about that
[10/7/25, 9:09:45 AM] Sarah Chen: Agreed. We decided as a team - SSO will NOT be in the demo. We'll position it as coming in Q1
[10/7/25, 9:10:05 AM] Priya Patel: Perfect. I'll communicate that to the client by noon today
[10/7/25, 9:10:30 AM] Sarah Chen: Alex can you finish the dashboard charts? The real-time graph is still showing wrong data
[10/7/25, 9:10:55 AM] Alex Johnson: Yes I'm on it. The data issue is a timezone problem in the aggregation. Should be fixed by today 3pm
[10/7/25, 9:11:20 AM] Mike Torres: While we're at it - the login page on mobile is still broken. Should we fix that before the demo?
[10/7/25, 9:11:45 AM] Sarah Chen: Yes definitely. @Alex Johnson can you take a look at the mobile login after the charts?
[10/7/25, 9:12:00 AM] Alex Johnson: Sure, I'll do it after 3pm once the charts are sorted
[10/7/25, 9:12:25 AM] Priya Patel: One more thing - we need to prepare demo data. The current test data looks terrible
[10/7/25, 9:12:50 AM] Sarah Chen: Good point. Who can handle that?
[10/7/25, 9:13:10 AM] Mike Torres: I can set up realistic-looking seed data tonight. Maybe 8-9pm?
[10/7/25, 9:13:35 AM] Sarah Chen: Perfect. Mike - export feature first, demo data tonight. Alex - charts now, mobile login after 3. Priya - client communication by noon. We're all aligned?
[10/7/25, 9:13:55 AM] Priya Patel: ✅ on my end
[10/7/25, 9:14:05 AM] Alex Johnson: ✅ 
[10/7/25, 9:14:12 AM] Mike Torres: ✅ starting on export right now
[10/7/25, 9:14:30 AM] Sarah Chen: Great. Let's do a quick check-in at 4pm today. Mandatory for everyone
[10/7/25, 9:14:50 AM] Priya Patel: Actually I have a conflict at 4 - client call. Can we do 4:30?
[10/7/25, 9:15:05 AM] Sarah Chen: Sure, 4:30pm check-in then. Everyone please block your calendar
[10/7/25, 9:15:20 AM] Alex Johnson: Done
[10/7/25, 9:15:35 AM] Mike Torres: Blocked
[10/7/25, 9:16:00 AM] Sarah Chen: Also reminder - sprint retrospective is still happening Wednesday at 2pm. That's separate from demo prep
[10/7/25, 9:16:20 AM] Alex Johnson: Is that still necessary given the crunch?
[10/7/25, 9:16:45 AM] Sarah Chen: Yes, we decided to keep it. Retros are important for the team. It'll be 30 min max
[10/7/25, 9:17:05 AM] Priya Patel: @Alex Johnson - also separately, the client wants the API documentation updated before the demo. Can you update the Notion page?
[10/7/25, 9:17:30 AM] Alex Johnson: Ugh, ok. I'll squeeze that in Wednesday morning before retro
[10/7/25, 9:17:55 AM] Mike Torres: Anyone know the login credentials for the staging environment? I need them to test export
[10/7/25, 9:18:20 AM] Sarah Chen: I'll DM you those Mike, don't share in group
[10/7/25, 9:18:35 AM] Mike Torres: Thanks!
[10/7/25, 9:19:00 AM] Priya Patel: Team - one concern. If the export isn't fully polished by Friday, how should we handle it in the demo?
[10/7/25, 9:19:25 AM] Sarah Chen: Good question. Decision: if export isn't 100% by Thursday night, we'll demo it with a controlled flow and not show the rough edges
[10/7/25, 9:19:50 AM] Alex Johnson: Makes sense. We should also have a backup slide deck just in case
[10/7/25, 9:20:10 AM] Sarah Chen: Yes! Priya can you prepare a backup slide deck by Thursday morning?
[10/7/25, 9:20:30 AM] Priya Patel: I can do that. I'll base it on the Q3 deck we already have
[10/7/25, 9:20:55 AM] Mike Torres: What's the exact time of the demo on Friday?
[10/7/25, 9:21:15 AM] Priya Patel: 2pm PST. So 5pm EST for those of us on the east coast
[10/7/25, 9:21:35 AM] Alex Johnson: Got it. I'll be available from 1:30pm EST to help with any last minute issues
[10/7/25, 9:22:00 AM] Sarah Chen: Perfect. Summary: Demo is Friday Oct 10 at 2pm PST. Mike owns export (due Thursday EOD). Alex owns charts (today 3pm) and mobile login fix (today after 3pm) and API docs (Wednesday morning). Priya owns client communication (today noon) and backup slide deck (Thursday morning). Check-in today at 4:30pm
[10/7/25, 9:22:25 AM] Sarah Chen: Oh and @Alex Johnson - I need you to review the security audit findings from last week before Wednesday's retro. The DevOps team flagged some issues
[10/7/25, 9:22:50 AM] Alex Johnson: Will do. I haven't seen those yet - can you share the report?
[10/7/25, 9:23:10 AM] Sarah Chen: Sharing now in the dev channel
[10/7/25, 9:23:30 AM] Mike Torres: Quick question - should the export support both CSV and PDF?
[10/7/25, 9:23:55 AM] Sarah Chen: Client specifically asked for PDF. CSV is a nice-to-have if time permits
[10/7/25, 9:24:15 AM] Mike Torres: Ok, PDF first, CSV if time. Got it
[10/7/25, 9:24:40 AM] Priya Patel: One last thing - the client will have about 8 people on the call. We should have a strong opening. Sarah will you present?
[10/7/25, 9:25:00 AM] Sarah Chen: Yes I'll present with Priya handling Q&A
[10/7/25, 9:25:20 AM] Priya Patel: Sounds like a plan. Let's crush it team! 💪
[10/7/25, 9:25:35 AM] Alex Johnson: 💪 Let's go
[10/7/25, 9:25:50 AM] Mike Torres: Already coding 🚀
[10/7/25, 9:26:10 AM] Sarah Chen: One more - if anyone hits blockers, ping me immediately. Don't wait for check-in
[10/7/25, 9:26:30 AM] Alex Johnson: Will do
[10/7/25, 9:45:00 AM] Priya Patel: Update: just sent the SSO and demo date confirmation to the Nexus Corp contact
[10/7/25, 9:45:30 AM] Sarah Chen: 👍 Thanks Priya
[10/7/25, 10:15:20 AM] Alex Johnson: The timezone bug was actually in the database query not the frontend. Fixed. Charts look correct now on staging
[10/7/25, 10:15:45 AM] Sarah Chen: Excellent! That was faster than expected
[10/7/25, 10:16:00 AM] Mike Torres: Nice one Alex
[10/7/25, 11:30:00 AM] Mike Torres: Export feature is progressing well. PDF generation working for basic reports. Still need pagination and formatting for larger datasets
[10/7/25, 11:30:25 AM] Sarah Chen: Good progress! Any concerns about Thursday deadline?
[10/7/25, 11:31:00 AM] Mike Torres: I think I'll make it. The core logic is done. It's mainly styling now
[10/7/25, 12:05:00 AM] Priya Patel: Client call done. Nexus Corp confirmed they're happy with Friday date and SSO roadmap for Q1. They're very excited
[10/7/25, 12:05:30 AM] Sarah Chen: Amazing! Great work Priya
[10/7/25, 12:06:00 AM] Alex Johnson: Wonderful news!
[10/7/25, 3:05:00 PM] Alex Johnson: Mobile login issue on iOS is more complex than I thought. The keyboard pushes the form off screen. Working on a CSS fix
[10/7/25, 3:05:30 PM] Sarah Chen: @Alex Johnson keep me posted. This needs to be sorted before Friday
[10/7/25, 3:45:00 PM] Alex Johnson: Mobile login fixed. Tested on iPhone 13 and 14 simulators
[10/7/25, 3:45:20 PM] Sarah Chen: 
[10/7/25, 4:35:00 PM] Sarah Chen: Check-in time! Quick status round
[10/7/25, 4:35:15 PM] Mike Torres: Export: PDF works for up to 50 rows. Working on pagination now
[10/7/25, 4:35:30 PM] Alex Johnson: Charts ✅ Mobile login ✅ API docs - will start tomorrow morning
[10/7/25, 4:35:45 PM] Priya Patel: Client comms ✅ Slide deck in progress, will have draft by tomorrow EOD
[10/7/25, 4:36:00 PM] Sarah Chen: Great progress everyone. Mike - how confident are you about Thursday?
[10/7/25, 4:36:20 PM] Mike Torres: 80% confident. The pagination is the last big piece
[10/7/25, 4:36:40 PM] Sarah Chen: Ok. Let me know by tomorrow noon if you think you'll miss the Thursday deadline - we need to plan for contingency
[10/7/25, 4:37:00 PM] Mike Torres: Will do
[10/7/25, 4:37:20 PM] Sarah Chen: Good work everyone. See you at retro Wednesday 2pm!`;

export interface SampleChatPreset {
  id: string;
  title: string;
  description: string;
  tag: string;
  suggestedUser: string;
  rawText: string;
}

export const SAMPLE_PRESETS: SampleChatPreset[] = [
  {
    id: 'sprint-crunch',
    title: 'Demo Sprint Crunch',
    description: '45 messages · Urgent client demo moved up to Friday with tasks & decisions',
    tag: 'Sprint Prep',
    suggestedUser: 'Alex Johnson',
    rawText: SAMPLE_CONVERSATION,
  },
  {
    id: 'incident-response',
    title: 'P0 Production Incident',
    description: 'Critical database latency surge, failover decisions, customer comms SLA',
    tag: 'Incident',
    suggestedUser: 'David Kim',
    rawText: `[10/8/25, 2:15:10 PM] Marcus Reed: 🚨 Alert: Production API latency spiked to 4.2s across all regions. Error rate at 18%.
[10/8/25, 2:16:02 PM] Elena Rostova: Acknowledged. Looking at telemetry. Looks like Postgres primary connection pool is saturated.
[10/8/25, 2:16:45 PM] David Kim: Checking recent deployments. The v2.14 checkout service went live 25 minutes ago.
[10/8/25, 2:17:30 PM] Marcus Reed: Can we rollback v2.14 immediately?
[10/8/25, 2:18:12 PM] David Kim: Decision: Yes, initiating rollback of v2.14 right now. ETA 4 minutes.
[10/8/25, 2:19:00 PM] Elena Rostova: @David Kim I see connection pool leaks in the new analytics query batcher.
[10/8/25, 2:20:15 PM] Marcus Reed: @Elena Rostova please draft the status page incident notification by 2:30 PM. SLA is 15 minutes.
[10/8/25, 2:21:40 PM] Elena Rostova: Status update drafted. Needs approval from Marcus.
[10/8/25, 2:22:10 PM] Marcus Reed: Approved. Publish it now.
[10/8/25, 2:23:45 PM] David Kim: Rollback finished. DB connections dropping back to nominal (45/500). Latency back to 62ms.
[10/8/25, 2:25:00 PM] Marcus Reed: All clear confirmed. @David Kim please lead post-mortem investigation and share initial RC report by tomorrow 10am.
[10/8/25, 2:25:35 PM] Elena Rostova: We also need to add connection pool circuit breaker before re-enabling analytics queries.
[10/8/25, 2:26:10 PM] Marcus Reed: Agreed. We decided: no analytics code re-deploy until circuit breaker test suite passes in staging.`,
  },
  {
    id: 'launch-strategy',
    title: 'Q4 Product Launch Sync',
    description: 'Go-to-market strategy, pricing tier agreement, and App Store submission deadline',
    tag: 'Strategy',
    suggestedUser: 'Sophia Vance',
    rawText: `[10/9/25, 10:00:15 AM] Jordan Lee: Morning team. Final countdown for our iOS and Android launch next Tuesday.
[10/9/25, 10:01:20 AM] Sophia Vance: Hey Jordan! The App Store submission build (v1.0.0) passed internal smoke tests.
[10/9/25, 10:02:40 AM] Liam Patel: Great news. What is our deadline for submitting the binary to Apple Review?
[10/9/25, 10:03:15 AM] Sophia Vance: Apple review takes 24-48 hours. Deadline is tonight by 8 PM to be safe for Tuesday launch.
[10/9/25, 10:04:00 AM] Jordan Lee: @Sophia Vance please submit binary by 7 PM today so we have buffer.
[10/9/25, 10:05:10 AM] Liam Patel: What about the pricing tier for early adopters? Are we offering \$29/mo or \$39/mo?
[10/9/25, 10:06:30 AM] Jordan Lee: We discussed this with leadership yesterday. We decided on \$29/mo for annual early-bird subscribers, locking in that rate for 12 months.
[10/9/25, 10:07:45 AM] Liam Patel: Perfect. I will update the landing page pricing table before 2 PM today.
[10/9/25, 10:08:20 AM] Sophia Vance: @Liam Patel make sure the Stripe webhook IDs match production. Don't forget to test with live mode keys.
[10/9/25, 10:09:05 AM] Liam Patel: Got it, doing test charge test run by 3 PM.
[10/9/25, 10:10:00 AM] Jordan Lee: Mandatory launch day standup will be Monday 9:00 AM. Everyone please confirm attendance.`,
  },
];
