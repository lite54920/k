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
