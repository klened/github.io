/* =====================================================================
   우리집 혜택 찾기 — 공통 상단 메뉴
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
  var html = '<div class="container"><a href="/" class="brand">우리집 혜택 찾기</a>';
  for (var i = 0; i < LINKS.length; i++) {
    var l = LINKS[i];
    var active = (norm(l.href) === cur) ? ' class="active"' : '';
    html += '<a href="' + l.href + '"' + active + '>' + l.label + '</a>';
  }
  html += '</div>';

  var el = document.getElementById('siteNav');
  if (el) el.innerHTML = html;
})();
