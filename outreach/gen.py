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
c = collections.Counter(r['Submission status'] for r in rows)
summary = f"""
## Totals (companies 1–45)

| Status | Count |
|---|---|
| Submitted | {c['Submitted']} |
| Ready for CAPTCHA (needs manual completion) | {c['Ready for CAPTCHA']} |
| Email only | {c['Email only']} |
| Blocked (required info missing, or bot wall) | {c['Blocked']} |
| Possible competitor | {c['Possible competitor']} |
| Skipped — unsuitable | {c['Skipped — unsuitable']} |
| Website unavailable | {c['Website unavailable']} |
| **Total** | **{len(rows)}** |

## Notes

- Scope: the brief said to start with Repulse Media and finish with HOUSE Talent (#45). The 12 companies listed after it (#46 The Booking Project through #57 Semaphore) were not contacted.
- No company on the do-not-contact list appears among the targets. Each company was contacted at most once, and no emails were sent.
- No CAPTCHA was solved or bypassed. For three Squarespace sites (Sharper, Spires, The Gold Arena), one submission was attempted and the site's invisible reCAPTCHA rejected it, so nothing was received. Those sites were not retried. Later Squarespace forms were not attempted.
- No phone number, website, address, social handle or budget was invented. Forms that required any of these are marked Blocked.
- Where a roster is mainly short-form or social-first, the long-form clause was left out of the opening sentence so it stays accurate.
- Timestamps are UTC, taken from the automation host at the moment the submit button was clicked.
"""
open('outreach-log.md', 'a').write(summary)
