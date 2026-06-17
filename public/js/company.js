/* Reads ?cid= from the URL, fetches the company, and renders the link hub. */
(function () {
  const $ = (id) => document.getElementById(id);

  function show(el) { el.classList.remove('hidden'); }
  function hide(el) { el.classList.add('hidden'); }

  function showError(title, text) {
    hide($('loading'));
    hide($('card'));
    $('error-title').textContent = title;
    $('error-text').textContent = text;
    show($('error'));
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  function renderLogo(name, logo) {
    const holder = $('logo-holder');
    const url = window.resolveLogo(logo);
    if (url) {
      const img = new Image();
      img.className = 'logo';
      img.alt = name + ' logo';
      img.src = url;
      img.onerror = () => { holder.innerHTML = ''; holder.appendChild(makeFallback(name)); };
      holder.appendChild(img);
    } else {
      holder.appendChild(makeFallback(name));
    }
  }

  function makeFallback(name) {
    const div = document.createElement('div');
    div.className = 'logo-fallback';
    div.textContent = (name || '?').trim().charAt(0).toUpperCase();
    return div;
  }

  function renderLinks(links) {
    const container = $('links');
    container.innerHTML = '';
    let count = 0;

    window.PLATFORMS.forEach((p) => {
      const value = links[p.key];
      if (!value) return;
      const href = window.buildHref(p.type, value);
      if (!href) return;

      const a = document.createElement('a');
      a.className = 'link-btn';
      a.href = href;
      if (p.type === 'url') { a.target = '_blank'; a.rel = 'noopener'; }
      a.innerHTML =
        '<span class="icon" style="background:' + p.color + '"><i class="' + p.icon + '"></i></span>' +
        '<span>' + escapeHtml(p.label) + '</span>' +
        '<span class="chev"><i class="fa-solid fa-chevron-right"></i></span>';
      container.appendChild(a);
      count++;
    });

    if (!count) {
      const empty = document.createElement('p');
      empty.style.textAlign = 'center';
      empty.style.color = '#64748b';
      empty.textContent = 'No links have been added yet.';
      container.appendChild(empty);
    }
  }

  async function init() {
    const params = new URLSearchParams(window.location.search);
    const cid = (params.get('cid') || '').trim();

    if (!cid) {
      showError('No company selected', 'Please use a link provided by your company to access this page.');
      return;
    }

    try {
      const res = await fetch('/api/company?cid=' + encodeURIComponent(cid));
      const data = await res.json();

      if (!res.ok) {
        showError(res.status === 404 ? 'Company not found' : 'Error',
          data.error || 'Unable to load this company.');
        return;
      }

      document.title = data.name ? data.name + ' — Links' : 'Company Links';
      $('company-name').textContent = data.name || 'Company';
      renderLogo(data.name, data.logo);
      renderLinks(data.links || {});

      hide($('loading'));
      show($('card'));
    } catch (err) {
      console.error(err);
      showError('Connection error', 'Please check your internet connection and try again.');
    }
  }

  init();
})();
