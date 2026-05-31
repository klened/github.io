#!/usr/bin/env python3
"""
공공데이터포털 LH 분양임대공고문 조회 API -> assets/notices.json
Endpoint: https://apis.data.go.kr/B552555/lhLeaseNoticeInfo1/lhLeaseNoticeInfo1
"""
import os
import sys
import json
import datetime
import urllib.parse
import urllib.request

SERVICE_KEY = os.environ.get('DATA_GO_KR_KEY', '').strip()
OUT_PATH = 'assets/notices.json'
API_URL = 'https://apis.data.go.kr/B552555/lhLeaseNoticeInfo1/lhLeaseNoticeInfo1'
LOOKBACK_DAYS = 60
MAX_ROWS = 100


def fetch_json(url, params, timeout=25):
    qs = urllib.parse.urlencode(params, safe='%')
    full = url + '?' + qs
    try:
        req = urllib.request.Request(full, headers={'Accept': 'application/json'})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read().decode('utf-8', errors='replace')
            if raw.strip().startswith('[') or raw.strip().startswith('{'):
                return json.loads(raw)
            print("[WARN] non-JSON response:", raw[:200], file=sys.stderr)
            return None
    except Exception as e:
        print("[WARN] fetch failed:", e, file=sys.stderr)
        return None


def parse_lh_response(payload):
    if not payload or not isinstance(payload, list):
        return []
    for block in payload:
        if isinstance(block, dict) and 'dsList' in block:
            ds = block.get('dsList')
            if isinstance(ds, list):
                return ds
    return []


def fetch_recent_notices():
    if not SERVICE_KEY:
        print("[INFO] DATA_GO_KR_KEY missing -> skip fetch", file=sys.stderr)
        return []
    today = datetime.date.today()
    start = today - datetime.timedelta(days=LOOKBACK_DAYS)
    params = {
        'serviceKey': SERVICE_KEY,
        'PG_SZ': str(MAX_ROWS),
        'PAGE': '1',
        'PAN_ST_DT': start.strftime('%Y%m%d'),
        'PAN_ED_DT': today.strftime('%Y%m%d'),
    }
    payload = fetch_json(API_URL, params)
    items = parse_lh_response(payload)
    print("[INFO] received {} items".format(len(items)), file=sys.stderr)
    return items


def normalize(raw_items):
    STATUS_RANK = {'접수중': 0, '공고중': 1, '정정공고중': 2, '상담요청': 3, '접수마감': 9}
    result = []
    for it in raw_items:
        title = (it.get('PAN_NM') or '').strip()
        if not title:
            continue
        status = (it.get('PAN_SS') or '').strip()
        if status == '접수마감':
            continue
        result.append({
            'title': title,
            'category': (it.get('UPP_AIS_TP_NM') or '').strip(),
            'subtype': (it.get('AIS_TP_CD_NM') or '').strip(),
            'region': (it.get('CNP_CD_NM') or '').strip(),
            'posted': (it.get('PAN_NT_ST_DT') or '').strip(),
            'deadline': (it.get('CLSG_DT') or '').strip(),
            'status': status,
            'url': (it.get('DTL_URL') or '').strip() or 'https://apply.lh.or.kr',
        })
    result.sort(key=lambda x: (STATUS_RANK.get(x['status'], 5), '-' + x['posted'] if x['posted'] else 'z'))
    return result


def main():
    raw = fetch_recent_notices()
    notices = normalize(raw)
    payload = {
        'updated': datetime.datetime.utcnow().isoformat() + 'Z',
        'source': '공공데이터포털 (LH 분양임대공고문 조회) 자동 갱신',
        'lookbackDays': LOOKBACK_DAYS,
        'count': len(notices),
        'notices': notices,
    }
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    print("[OK] notices.json saved - {} items".format(len(notices)))


if __name__ == '__main__':
    main()
