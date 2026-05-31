#!/usr/bin/env python3
"""
공공데이터포털에서 LH 분양·임대공고문 정보를 가져와 assets/notices.json 으로 저장.

데이터 소스:
  · 한국토지주택공사 분양임대공고별 공급정보 조회 서비스
    https://apis.data.go.kr/B552555/lhLeaseNoticeSplInfo1/getLeaseNoticeSplInfo1
  · 필요 시 추가 API 확장 가능

인증키는 GitHub Secret(DATA_GO_KR_KEY)에서 읽음.
키 미설정·API 미활성화 등 실패 시에도 빈 결과(empty list)로 종료해
워크플로우가 깨지지 않도록 함.
"""
import os
import json
import sys
import datetime
import urllib.parse
import urllib.request

SERVICE_KEY = os.environ.get('DATA_GO_KR_KEY', '').strip()
OUT_PATH = 'assets/notices.json'

LH_LEASE_URL = (
    'https://apis.data.go.kr/B552555/lhLeaseNoticeSplInfo1/'
    'getLeaseNoticeSplInfo1'
)


def fetch_json(url, params, timeout=20):
    """data.go.kr JSON 요청. 실패 시 None 반환."""
    qs = urllib.parse.urlencode(params, safe='%')
    full = url + '?' + qs
    try:
        req = urllib.request.Request(
            full,
            headers={'Accept': 'application/json'}
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read().decode('utf-8', errors='replace')
            # data.go.kr은 응답이 JSON일 수도 XML일 수도 있음
            if raw.strip().startswith('{'):
                return json.loads(raw)
            if raw.strip().startswith('<?xml') or raw.strip().startswith('<'):
                # XML이면 일단 raw로 반환
                return {'_raw_xml': raw}
            # 단순 텍스트 (Forbidden, Unauthorized 등)
            print(f"[WARN] 비정상 응답: {raw[:100]}", file=sys.stderr)
            return None
    except Exception as e:
        print(f"[WARN] fetch 실패: {e}", file=sys.stderr)
        return None


def parse_items(payload):
    """data.go.kr 표준 응답 구조에서 item 배열 추출."""
    if not payload or '_raw_xml' in payload:
        return []
    # 표준 구조: response > body > items > item
    try:
        body = payload.get('response', {}).get('body', {})
        items = body.get('items', {})
        if isinstance(items, dict):
            raw_items = items.get('item', [])
        else:
            raw_items = items
        if isinstance(raw_items, dict):
            raw_items = [raw_items]
        return raw_items or []
    except Exception as e:
        print(f"[WARN] 파싱 실패: {e}", file=sys.stderr)
        return []


def normalize(raw_items):
    """LH 응답을 사이트 표시용 형식으로 정규화."""
    result = []
    for it in raw_items:
        title = it.get('PAN_NM') or it.get('panNm') or ''
        region = it.get('CNP_CD_NM') or it.get('cnpCdNm') or ''
        kind = it.get('AIS_TP_CD_NM') or it.get('aisTpCdNm') or ''
        notice_date = it.get('PAN_DT') or it.get('panDt') or ''
        receipt_start = it.get('RCEPT_BGNDE') or it.get('rceptBgnde') or ''
        receipt_end = it.get('RCEPT_ENDDE') or it.get('rceptEndde') or ''
        url = it.get('DTL_URL') or it.get('dtlUrl') or 'https://apply.lh.or.kr'
        if not title:
            continue
        result.append({
            'agency': 'LH',
            'title': title,
            'region': region,
            'kind': kind,
            'noticeDate': notice_date,
            'receiptStart': receipt_start,
            'receiptEnd': receipt_end,
            'url': url
        })
    return result


def fetch_lh_recent():
    """LH 분양·임대공고 최근 항목 조회."""
    if not SERVICE_KEY:
        print("[INFO] DATA_GO_KR_KEY 미설정 — fetch 건너뜀", file=sys.stderr)
        return []
    # data.go.kr 표준 페이지네이션 + JSON 응답 요청
    params = {
        'serviceKey': SERVICE_KEY,
        'pageNo': '1',
        'numOfRows': '50',
        '_type': 'json',
    }
    payload = fetch_json(LH_LEASE_URL, params)
    items = parse_items(payload)
    if not items:
        # 다른 파라미터 형식으로 재시도
        params2 = {
            'serviceKey': SERVICE_KEY,
            'PAGE': '1',
            'PG_SZ': '50',
        }
        payload = fetch_json(LH_LEASE_URL, params2)
        items = parse_items(payload)
    return normalize(items)


def main():
    notices = fetch_lh_recent()

    payload = {
        'updated': datetime.datetime.utcnow().isoformat() + 'Z',
        'source': '공공데이터포털 (LH 분양임대공고) 자동 갱신',
        'notices': notices,
    }
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    print(f"[OK] notices.json 저장 — {len(notices)}건")


if __name__ == '__main__':
    main()
