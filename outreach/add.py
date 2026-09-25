import json, sys, os
p = 'log.json'; rows = json.load(open(p)) if os.path.exists(p) else []
r = json.loads(sys.stdin.read())
rows = [x for x in rows if x['#'] != r['#']] + [r]; rows.sort(key=lambda x: x['#'])
json.dump(rows, open(p, 'w'), indent=1, ensure_ascii=False)
