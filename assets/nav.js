/* =====================================================================
   숨은 돈 찾기 — 공통 상단 메뉴
   ---------------------------------------------------------------------
   이 파일 하나만 고치면 전체 페이지의 상단 메뉴가 한 번에 바뀝니다.
   메뉴 항목을 추가·수정·삭제하려면 아래 LINKS 배열만 편집하세요.
   ===================================================================== */
(function () {
  var LINKS = [
    { href: '/',          label: '홈' },
    { href: '/loan/',     label: '부동산 대출' },
    { href: '/baby/',     label: '출산·육아 지원금' },
    { href: '/business/', label: '사업자 지원금' },
    { href: '/check/',    label: '내 가게 진단' },
    { href: '/about/',    label: '소개' }
  ];

  /* 경로 정규화: '/loan' 또는 '/loan/index.html' → '/loan/' */
  function norm(p) {
    p = p.replace(/index\.html$/, '');
    if (p.length > 1 && p.charAt(p.length - 1) !== '/') p += '/';
    return p;
  }

  var cur = norm(location.pathname);
  var html = '<div class="container"><a href="/" class="brand">숨은 돈 찾기</a>';
  for (var i = 0; i < LINKS.length; i++) {
    var l = LINKS[i];
    var active = (norm(l.href) === cur) ? ' class="active"' : '';
    html += '<a href="' + l.href + '"' + active + '>' + l.label + '</a>';
  }
  html += '</div>';

  var el = document.getElementById('siteNav');
  if (el) el.innerHTML = html;
})();


/* =====================================================================
   숨은 돈 찾기 — 공통 공유 버튼
   ---------------------------------------------------------------------
   모든 페이지 우측 하단에 공유 버튼을 띄웁니다.
   이 파일 하나만 고치면 전체 페이지에 한 번에 적용됩니다.
   · 모바일: 기기 공유 시트(카카오톡·메시지 등) 호출
   · 데스크톱/미지원 환경: 링크를 클립보드에 복사
   ===================================================================== */
(function () {
  /* 페이지별 정체성 색 — 상단 메뉴와 동일한 규칙 */
  function accent() {
    var p = location.pathname;
    if (p.indexOf('/baby') === 0)     return '#EC4899';
    if (p.indexOf('/business') === 0) return '#0FA968';
    if (p.indexOf('/check') === 0)    return '#5B5BD6';
    return '#3182F6';
  }
  var COLOR = accent();

  /* 스타일 주입 */
  var css =
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
  var st = document.createElement('style');
  st.appendChild(document.createTextNode(css));
  document.head.appendChild(st);

  /* 공유 버튼 */
  var btn = document.createElement('button');
  btn.className = 'snj-share-btn';
  btn.type = 'button';
  btn.setAttribute('aria-label', '이 페이지 공유하기');
  btn.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/>' +
    '<circle cx="18" cy="19" r="3"/>' +
    '<path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg><span>공유하기</span>';

  /* 안내 토스트 */
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

  btn.addEventListener('click', function () {
    var data = { title: document.title, text: metaDesc(), url: location.href };
    if (navigator.share) {
      navigator.share(data)
        .then(function () { track('web_share'); })
        .catch(function () {});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(location.href).then(function () {
        showToast('링크가 복사됐어요. 붙여넣기로 공유하세요!');
        track('clipboard');
      }).catch(function () {
        showToast('주소창의 링크를 복사해 공유해 주세요.');
      });
    } else {
      showToast('주소창의 링크를 복사해 공유해 주세요.');
    }
  });

  function mount() {
    document.body.appendChild(btn);
    document.body.appendChild(toast);
  }
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
