/* =====================================================================
   숨은 돈 찾기 — 공통 상단 메뉴 + 공유 버튼 + BreadcrumbList + 관련 도구
   ---------------------------------------------------------------------
   이 파일 하나만 고치면 전체 페이지의 메뉴·공유·구조화 데이터·내부 링크가
   한 번에 갱신됩니다. 페이지 추가 시 PAGE_INFO에 항목만 추가하세요.
   ===================================================================== */

(function () {
  /* ===== 1. 페이지 정의 =====
     PAGE_INFO는 SEO·BreadcrumbList·관련 도구·공유 버튼 색의 단일 소스입니다. */
  var CAT = {
    welfare: { name: '정부지원금·복지', emoji: '🤝', color: '#EC4899' },
    worker:  { name: '근로자·직장인',   emoji: '💼', color: '#14B8A6' },
    biz:     { name: '사업자·자영업',   emoji: '🏪', color: '#0FA968' },
    home:    { name: '주거·금융·환급',  emoji: '🏠', color: '#3182F6' }
  };
  var PAGE_INFO = {
    '/baby/':      { name: '출산·육아 지원금',     cat: 'welfare' },
    '/youth/':     { name: '청년 지원금',          cat: 'welfare' },
    '/senior/':    { name: '어르신·노후 지원금',   cat: 'welfare' },
    '/welfare/':   { name: '한부모·복지 통합 진단', cat: 'welfare' },
    '/tax/':       { name: '연말정산 환급 진단',   cat: 'worker' },
    '/jobless/':   { name: '실업급여 계산기',      cat: 'worker' },
    '/business/':  { name: '사업자 지원금',        cat: 'biz' },
    '/check/':     { name: '내 가게 경영진단',     cat: 'biz' },
    '/marketing/': { name: '마케팅 예산 계산기',   cat: 'biz' },
    '/closure/':   { name: '폐업·재도전 지원금',   cat: 'biz' },
    '/loan/':      { name: '부동산 대출',          cat: 'home' },
    '/rent/':      { name: '장기전세·공공임대',    cat: 'home' },
    '/guarantee/': { name: '전세보증보험 계산기',  cat: 'home' },
    '/refund/':    { name: '숨은 환급금 조회',     cat: 'home' },
    '/utility/':   { name: '요금감면 자격 진단',   cat: 'home' }
  };

  /* 경로 정규화 */
  function norm(p) {
    p = p.replace(/index\.html$/, '');
    if (p.length > 1 && p.charAt(p.length - 1) !== '/') p += '/';
    return p;
  }
  var CUR = norm(location.pathname);
  var INFO = PAGE_INFO[CUR];

  /* ===== 2. 상단 메뉴 =====
     카테고리 anchor 방식: 메인 페이지의 해당 섹션으로 점프. */
  var LINKS = [
    { href: '/',            label: '홈' },
    { href: '/#welfare',    label: '🤝 복지·지원금' },
    { href: '/#worker',     label: '💼 근로자' },
    { href: '/#biz',        label: '🏪 사업자' },
    { href: '/#home-cat',   label: '🏠 주거·환급' },
    { href: '/about/',      label: '소개' }
  ];
  var navHtml = '<div class="container"><a href="/" class="brand">숨은 돈 찾기</a>';
  for (var i = 0; i < LINKS.length; i++) {
    var l = LINKS[i];
    var isActive = false;
    // 메인 페이지에서 카테고리 anchor 활성화 (현재 페이지 카테고리 매칭)
    if (CUR === '/' && l.href.indexOf('/#') === 0 && INFO == null) {
      isActive = false; // 메인 홈 자체에서는 카테고리 활성 안 함
    } else if (INFO && l.href === '/#' + (INFO.cat === 'home' ? 'home-cat' : INFO.cat)) {
      isActive = true; // 서브 페이지에서는 자신의 카테고리 메뉴 활성화
    } else if (norm(l.href.replace(/#.*/, '')) === CUR && l.href.indexOf('#') === -1) {
      isActive = true;
    }
    navHtml += '<a href="' + l.href + '"' + (isActive ? ' class="active"' : '') + '>' + l.label + '</a>';
  }
  navHtml += '</div>';
  var navEl = document.getElementById('siteNav');
  if (navEl) navEl.innerHTML = navHtml;

  /* ===== 3. BreadcrumbList JSON-LD =====
     SERP에서 빵부스러기 형태로 노출되도록 구조화 데이터 자동 삽입. */
  if (INFO) {
    var origin = location.origin;
    var ld = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': '홈', 'item': origin + '/' },
        { '@type': 'ListItem', 'position': 2, 'name': CAT[INFO.cat].name, 'item': origin + '/#' + (INFO.cat === 'home' ? 'home-cat' : INFO.cat) },
        { '@type': 'ListItem', 'position': 3, 'name': INFO.name, 'item': origin + CUR }
      ]
    };
    var bcScript = document.createElement('script');
    bcScript.type = 'application/ld+json';
    bcScript.textContent = JSON.stringify(ld);
    document.head.appendChild(bcScript);
  }

  /* ===== 4. 공유 버튼 =====
     페이지 카테고리 색 자동 적용. */
  function accent() {
    if (INFO) return CAT[INFO.cat].color;
    return '#3182F6';
  }
  var COLOR = accent();

  /* === 상단 메뉴 일관성 강제 (1040px 중앙정렬 + 아이템 패딩·우측정렬) === */
  var navFixCss =
    '.site-nav>.container{max-width:1040px!important;margin:0 auto!important;' +
    'padding:0 20px!important;display:flex!important;gap:8px!important;' +
    'align-items:center!important;flex-wrap:nowrap!important;' +
    'overflow-x:auto!important;scrollbar-width:none;-webkit-overflow-scrolling:touch;}' +
    '.site-nav>.container::-webkit-scrollbar{display:none;}' +
    '.site-nav .brand{margin-right:auto!important;flex-shrink:0;white-space:nowrap;}' +
    '.site-nav a:not(.brand){color:#4E5968;font-size:14px;font-weight:600;' +
    'padding:7px 11px;border-radius:8px;transition:all .15s;flex-shrink:0;' +
    'white-space:nowrap;text-decoration:none;}' +
    '.site-nav a:not(.brand):hover{background:#EEF2F8;color:#3182F6;}' +
    '.site-nav a.active{background:#E8F2FE!important;color:#1B64DA!important;}';
  var navFixStyle = document.createElement('style');
  navFixStyle.appendChild(document.createTextNode(navFixCss));
  document.head.appendChild(navFixStyle);

  var shareCss =
    '.snj-share-btn{position:fixed;right:16px;bottom:16px;z-index:90;' +
    'display:flex;align-items:center;gap:7px;border:none;cursor:pointer;' +
    'font-family:inherit;font-size:14px;font-weight:700;color:#fff;' +
    'padding:12px 18px;border-radius:999px;background:' + COLOR + ';' +
    'box-shadow:0 6px 20px rgba(0,0,0,.22);' +
    'transition:transform .12s ease,box-shadow .12s ease;}' +
    '.snj-share-btn:hover{transform:translateY(-1px);' +
    'box-shadow:0 9px 26px rgba(0,0,0,.26);}' +
    '.snj-share-btn:active{transform:scale(.96);}' +
    '.snj-share-btn svg{width:16px;height:16px;}' +
    '.snj-toast{position:fixed;left:50%;bottom:80px;' +
    'transform:translateX(-50%) translateY(10px);background:#191F28;color:#fff;' +
    'font-size:13px;font-weight:600;padding:10px 16px;border-radius:10px;' +
    'opacity:0;pointer-events:none;z-index:91;white-space:nowrap;' +
    'box-shadow:0 6px 20px rgba(0,0,0,.22);' +
    'transition:opacity .25s ease,transform .25s ease;}' +
    '.snj-toast.show{opacity:1;transform:translateX(-50%) translateY(0);}' +
    '@media(min-width:768px){.snj-share-btn{right:24px;bottom:24px;' +
    'padding:13px 20px;font-size:15px;}}';
  var styleEl = document.createElement('style');
  styleEl.appendChild(document.createTextNode(shareCss));
  document.head.appendChild(styleEl);

  var shareBtn = document.createElement('button');
  shareBtn.className = 'snj-share-btn';
  shareBtn.type = 'button';
  shareBtn.setAttribute('aria-label', '이 페이지 공유하기');
  shareBtn.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/>' +
    '<circle cx="18" cy="19" r="3"/>' +
    '<path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg><span>공유하기</span>';

  var toast = document.createElement('div');
  toast.className = 'snj-toast';
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }
  function metaDesc() {
    var m = document.querySelector('meta[name="description"]');
    return m ? m.content : '';
  }
  function track(method) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'share', { method: method, page_path: location.pathname });
    }
  }
  shareBtn.addEventListener('click', function () {
    var data = { title: document.title, text: metaDesc(), url: location.href };
    if (navigator.share) {
      navigator.share(data).then(function () { track('web_share'); }).catch(function () {});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(location.href).then(function () {
        showToast('링크가 복사됐어요. 붙여넣기로 공유하세요!');
        track('clipboard');
      }).catch(function () { showToast('주소창의 링크를 복사해 공유해 주세요.'); });
    } else {
      showToast('주소창의 링크를 복사해 공유해 주세요.');
    }
  });

  /* ===== 5. "함께 보면 좋은 도구" 자동 삽입 =====
     서브 페이지 푸터 직전에 같은 카테고리 다른 도구 + 보완 추천 카드 표시. */
  function buildRelated() {
    if (!INFO) return null;
    var sameCat = [];
    var otherTop = [];
    for (var path in PAGE_INFO) {
      if (path === CUR) continue;
      var p = PAGE_INFO[path];
      if (p.cat === INFO.cat) sameCat.push({ path: path, name: p.name, cat: p.cat });
      else otherTop.push({ path: path, name: p.name, cat: p.cat });
    }
    // 같은 카테고리 우선 + 다른 카테고리에서 인기 도구 한두 개 보강
    var POPULAR_BY_CAT = { welfare: '/baby/', worker: '/jobless/', biz: '/business/', home: '/loan/' };
    var picks = sameCat.slice(0, 3);
    var otherCats = Object.keys(CAT).filter(function (c) { return c !== INFO.cat; });
    for (var j = 0; j < otherCats.length && picks.length < 5; j++) {
      var pop = POPULAR_BY_CAT[otherCats[j]];
      if (pop && pop !== CUR) {
        picks.push({ path: pop, name: PAGE_INFO[pop].name, cat: PAGE_INFO[pop].cat });
      }
    }
    return picks;
  }

  function injectRelated() {
    var picks = buildRelated();
    if (!picks || picks.length === 0) return;
    var footer = document.querySelector('footer.site-footer');
    if (!footer) return;
    if (document.querySelector('.snj-related')) return;

    var relCss =
      '.snj-related{background:transparent;padding:24px 0 12px;border-top:1px solid #EAEDF1;margin-top:24px;}' +
      '.snj-related .snj-related-inner{max-width:1040px;margin:0 auto;padding:0 20px;}' +
      '.snj-related h3{font-size:17px;font-weight:800;color:#191F28;margin-bottom:14px;letter-spacing:-0.3px;padding:0 4px;}' +
      '.snj-related-grid{display:grid;grid-template-columns:1fr;gap:10px;}' +
      '.snj-related-card{display:flex;align-items:center;justify-content:space-between;gap:12px;background:#fff;border:1px solid #EAEDF1;border-radius:12px;padding:14px 16px;color:inherit;text-decoration:none;transition:all .15s;box-shadow:0 1px 3px rgba(0,0,0,.04);}' +
      '.snj-related-card:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,0,0,.08);}' +
      '.snj-related-card .rc-info{flex:1;min-width:0;}' +
      '.snj-related-card .rc-cat{font-size:11px;font-weight:700;display:inline-block;padding:2px 8px;border-radius:100px;margin-bottom:5px;}' +
      '.snj-related-card .rc-name{font-size:14px;font-weight:700;color:#191F28;letter-spacing:-0.2px;}' +
      '.snj-related-card .rc-arrow{font-size:14px;color:#8B95A1;font-weight:700;}' +
      '.snj-related-card.cat-welfare{border-left:3px solid #EC4899;}' +
      '.snj-related-card.cat-welfare .rc-cat{background:#FCE7F3;color:#DB2777;}' +
      '.snj-related-card.cat-worker{border-left:3px solid #14B8A6;}' +
      '.snj-related-card.cat-worker .rc-cat{background:#CCFBF1;color:#0D9488;}' +
      '.snj-related-card.cat-biz{border-left:3px solid #0FA968;}' +
      '.snj-related-card.cat-biz .rc-cat{background:#E3F6EE;color:#0B8A54;}' +
      '.snj-related-card.cat-home{border-left:3px solid #3182F6;}' +
      '.snj-related-card.cat-home .rc-cat{background:#E8F2FE;color:#1B64DA;}' +
      '@media(min-width:768px){.snj-related-grid{grid-template-columns:repeat(2,1fr);gap:12px;}}';
    var relStyle = document.createElement('style');
    relStyle.appendChild(document.createTextNode(relCss));
    document.head.appendChild(relStyle);

    var section = document.createElement('section');
    section.className = 'snj-related';
    var html = '<div class="snj-related-inner"><h3>🔍 함께 보면 좋은 도구</h3><div class="snj-related-grid">';
    for (var k = 0; k < picks.length; k++) {
      var pk = picks[k];
      var catInfo = CAT[pk.cat];
      html += '<a href="' + pk.path + '" class="snj-related-card cat-' + pk.cat + '">' +
              '<div class="rc-info">' +
              '<span class="rc-cat">' + catInfo.emoji + ' ' + catInfo.name + '</span>' +
              '<div class="rc-name">' + pk.name + '</div>' +
              '</div>' +
              '<span class="rc-arrow">→</span>' +
              '</a>';
    }
    html += '</div></div>';
    section.innerHTML = html;
    footer.parentNode.insertBefore(section, footer);
  }

  /* ===== 6. 마운트 ===== */
  function mount() {
    document.body.appendChild(shareBtn);
    document.body.appendChild(toast);
    injectRelated();
  }
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
