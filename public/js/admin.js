/* Admin panel logic: login -> token, company selector, editor with save/delete. */
(function () {
  const $ = (id) => document.getElementById(id);
  const TOKEN_KEY = 'clh_token';
  const USER_KEY = 'clh_user';

  let isNew = false; // are we creating a fresh company?

  // ---------- helpers ----------
  function token() { return localStorage.getItem(TOKEN_KEY) || ''; }

  function authHeaders(extra) {
    return Object.assign({ Authorization: 'Bearer ' + token() }, extra || {});
  }

  async function api(path, options) {
    const res = await fetch(path, options);
    let data = {};
    try { data = await res.json(); } catch (_) {}
    if (res.status === 401) { logout(); throw new Error(data.error || 'Session expired.'); }
    if (!res.ok) throw new Error(data.error || ('Request failed (' + res.status + ')'));
    return data;
  }

  function showMsg(el, text, type) {
    el.textContent = text;
    el.className = 'msg ' + (type || 'error') + ' show';
    if (type === 'success') setTimeout(() => el.classList.remove('show'), 3500);
  }
  function clearMsg(el) { el.className = 'msg'; el.textContent = ''; }

  // ---------- views ----------
  function showLogin() {
    $('login-view').classList.remove('hidden');
    $('dash-view').classList.add('hidden');
  }
  function showDash() {
    $('login-view').classList.add('hidden');
    $('dash-view').classList.remove('hidden');
    $('who').textContent = 'Signed in as ' + (localStorage.getItem(USER_KEY) || 'admin');
  }

  // ---------- login ----------
  $('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMsg($('login-msg'));
    $('login-btn').disabled = true;
    try {
      const data = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: $('username').value.trim(), password: $('password').value }),
      }).then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Login failed.');
        return d;
      });
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, data.username);
      $('password').value = '';
      showDash();
      loadCompanies();
    } catch (err) {
      showMsg($('login-msg'), err.message, 'error');
    } finally {
      $('login-btn').disabled = false;
    }
  });

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    showLogin();
  }
  $('logout-btn').addEventListener('click', logout);

  // ---------- company list ----------
  async function loadCompanies(selectId) {
    try {
      const { companies } = await api('/api/admin/companies', { headers: authHeaders() });
      const sel = $('company-select');
      sel.innerHTML = '<option value="">— Choose a company —</option>';
      companies.forEach((c) => {
        const o = document.createElement('option');
        o.value = c.id;
        o.textContent = (c.name || '(no name)') + '  ·  ' + c.id;
        sel.appendChild(o);
      });
      if (selectId) sel.value = selectId;
    } catch (err) {
      showMsg($('global-msg'), err.message, 'error');
    }
  }

  $('company-select').addEventListener('change', (e) => {
    const id = e.target.value;
    if (!id) { $('editor').classList.add('hidden'); return; }
    openCompany(id);
  });

  $('new-btn').addEventListener('click', () => {
    isNew = true;
    $('company-select').value = '';
    buildLinksEditor({});
    $('cid').value = '';
    $('cid').disabled = false;
    $('name').value = '';
    $('logo').value = '';
    $('delete-btn').classList.add('hidden');
    updatePreview();
    $('editor').classList.remove('hidden');
    clearMsg($('global-msg'));
    $('cid').focus();
  });

  // ---------- editor ----------
  function buildLinksEditor(links) {
    const wrap = $('links-editor');
    wrap.innerHTML = '';
    window.PLATFORMS.forEach((p) => {
      const row = document.createElement('div');
      row.className = 'link-row';
      row.innerHTML =
        '<span class="ic" style="background:' + p.color + '" title="' + p.label + '"><i class="' + p.icon + '"></i></span>' +
        '<input data-key="' + p.key + '" type="text" placeholder="' + p.label + ' — ' + p.placeholder + '" />' +
        '<button type="button" class="clear" title="Clear ' + p.label + '"><i class="fa-solid fa-xmark"></i></button>';
      const input = row.querySelector('input');
      input.value = links[p.key] || '';
      row.querySelector('.clear').addEventListener('click', () => { input.value = ''; input.focus(); });
      wrap.appendChild(row);
    });
  }

  function collectLinks() {
    const out = {};
    $('links-editor').querySelectorAll('input[data-key]').forEach((inp) => {
      const v = inp.value.trim();
      if (v) out[inp.dataset.key] = v;
    });
    return out;
  }

  async function openCompany(id) {
    clearMsg($('global-msg'));
    try {
      const data = await api('/api/admin/company?cid=' + encodeURIComponent(id), { headers: authHeaders() });
      isNew = false;
      $('cid').value = data.id;
      $('cid').disabled = true;
      $('name').value = data.name || '';
      $('logo').value = data.logo || '';
      buildLinksEditor(data.links || {});
      $('delete-btn').classList.remove('hidden');
      updatePreview();
      $('editor').classList.remove('hidden');
    } catch (err) {
      showMsg($('global-msg'), err.message, 'error');
    }
  }

  function updatePreview() {
    const id = $('cid').value.trim();
    const btn = $('preview-btn');
    if (id) { btn.href = '/?cid=' + encodeURIComponent(id); btn.style.display = ''; }
    else { btn.style.display = 'none'; }
  }
  $('cid').addEventListener('input', updatePreview);

  $('save-btn').addEventListener('click', async () => {
    clearMsg($('global-msg'));
    const cid = $('cid').value.trim();
    const name = $('name').value.trim();
    if (!cid) return showMsg($('global-msg'), 'Company ID is required.', 'error');
    if (!name) return showMsg($('global-msg'), 'Company name is required.', 'error');

    const payload = { cid, name, logo: $('logo').value.trim(), links: collectLinks() };
    $('save-btn').disabled = true;
    try {
      await api('/api/admin/company', {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
      });
      showMsg($('global-msg'), 'Saved successfully.', 'success');
      isNew = false;
      $('cid').disabled = true;
      $('delete-btn').classList.remove('hidden');
      await loadCompanies(cid);
    } catch (err) {
      showMsg($('global-msg'), err.message, 'error');
    } finally {
      $('save-btn').disabled = false;
    }
  });

  $('delete-btn').addEventListener('click', async () => {
    const cid = $('cid').value.trim();
    if (!cid) return;
    if (!confirm('Delete company "' + cid + '"? This cannot be undone.')) return;
    try {
      await api('/api/admin/company?cid=' + encodeURIComponent(cid), {
        method: 'DELETE', headers: authHeaders(),
      });
      $('editor').classList.add('hidden');
      showMsg($('global-msg'), 'Company deleted.', 'success');
      await loadCompanies();
    } catch (err) {
      showMsg($('global-msg'), err.message, 'error');
    }
  });

  // ---------- boot ----------
  if (token()) { showDash(); loadCompanies(); }
  else showLogin();
})();
