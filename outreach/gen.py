import json
rows = json.load(open('log.json'))
cols = ['#','Company','Official website','Contact-form URL','Relevant roster niches','Personalized opening sentence','Submission status','Submission date and time (UTC)','Confirmation message or reference','Public contact email','Notes or blocker']
out = ['# ClearAxis outreach log', '', '| ' + ' | '.join(cols) + ' |', '|' + '---|'*len(cols)]
for r in rows:
    out.append('| ' + ' | '.join(str(r.get(c, '')).replace('|', '/').replace('\n', ' ') for c in cols) + ' |')
open('outreach-log.md', 'w').write('\n'.join(out) + '\n')
import csv
with open('outreach-log.csv', 'w', newline='') as f:
    w = csv.DictWriter(f, fieldnames=cols); w.writeheader(); [w.writerow({c: r.get(c, '') for c in cols}) for r in rows]

import collections
norm = {'Blocked — missing required information': 'Blocked', 'Skipped — unsuitable form': 'Skipped — unsuitable'}
c = collections.Counter(norm.get(r['Submission status'], r['Submission status']) for r in rows)
summary = f"""
## Totals (all companies logged)

| Status | Count |
|---|---|
| Submitted (confirmed) | {c['Submitted']} |
| Submitted — unconfirmed (sent, no confirmation shown; do not resend) | {c['Submitted — unconfirmed']} |
| Ready for CAPTCHA (needs manual completion) | {c['Ready for CAPTCHA']} |
| Email only | {c['Email only']} |
| Blocked (required info missing, or bot wall) | {c['Blocked']} |
| Possible competitor | {c['Possible competitor']} |
| Skipped — unsuitable | {c['Skipped — unsuitable']} |
| Website unavailable | {c['Website unavailable']} |
| Already contacted (by you, by email) | {c['Already contacted']} |
| **Total** | **{len(rows)}** |

## Notes

- Round 1: companies #1–45. Round 2 (27 Sep): the original list's #46–57 plus new agencies found by web search (#58–77). Round 3 (27 Sep, evening): #86–123, new agencies only, sent through forms without a CAPTCHA. After the user's reminder, the focus moved to YouTube creator managers (Outshine, Up North, Right Click Culture, Warp Media, UPFAME).
- Contacted directly by Kayla by email (do not contact again): Moth Management, Ruthless Talent, Sixteenth, MGMT.exe, Upload Agency, Retro MGMT, Dulcedo, Mana Talent Group. No company on the do-not-contact list appears among the targets. Each company was contacted at most once, and no emails were sent.
- No CAPTCHA was solved or bypassed. For three Squarespace sites (Sharper, Spires, The Gold Arena), one submission was attempted and the site's invisible reCAPTCHA rejected it, so nothing was received. Those sites were not retried. Later Squarespace forms were not attempted.
- Round 3: Trinity (#101) and Level Up (#100) were sent, but the page gave no explicit confirmation, so they are logged as unconfirmed and must not be resent.
- No phone number, website, address, social handle or budget was invented. Forms that required any of these are marked Blocked.
- Where a roster is mainly short-form or social-first, the long-form clause was left out of the opening sentence so it stays accurate.
- Timestamps are UTC, taken from the automation host at the moment the submit button was clicked.
"""
open('outreach-log.md', 'a').write(summary)
