'use strict';
const $ = (selector) => document.querySelector(selector);
const menu = $('.menu');
if (menu) {
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); $('#nav').classList.toggle('open', open); });
  document.querySelectorAll('#nav a').forEach(a => a.addEventListener('click', () => { $('#nav').classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }));
}
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-filter]').forEach(b => { const active = b === button; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active)); });
  document.querySelectorAll('[data-audience]').forEach(card => { card.hidden = button.dataset.filter !== 'all' && card.dataset.audience !== button.dataset.filter; });
}));
function download(name, value) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], {type:'application/json'}));
  const link = document.createElement('a'); link.href = url; link.download = name; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const dialog = $('#request-dialog');
if (dialog) {
  document.querySelectorAll('[data-request]').forEach(button => button.addEventListener('click', () => { $('#request-form').reset(); $('#request-form').elements.type.value = button.dataset.request; $('#request-status').textContent = ''; dialog.showModal(); }));
  $('#close-dialog').addEventListener('click', () => dialog.close());
  $('#request-form').addEventListener('submit', event => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget)); download('dance-africa-request.json', { ...data, permission: true, createdAt: new Date().toISOString(), delivery: 'Not submitted. Share this file with your existing Dance Africa contact.' }); $('#request-status').textContent = 'Download requested. Your information has not been sent or saved on this website.'; });
}
if ($('#year')) $('#year').textContent = new Date().getFullYear();
const draftForm = $('#draft-form');
if (draftForm) {
  const key = 'dance-africa.editorial-drafts.v1';
  let drafts = [];
  try { const saved = JSON.parse(localStorage.getItem(key) || '[]'); if (Array.isArray(saved)) drafts = saved.filter(x => x && typeof x.id === 'string' && typeof x.title === 'string' && typeof x.content === 'string' && typeof x.date === 'string' && typeof x.audience === 'string' && ['Draft','Ready for review','Approved locally'].includes(x.status)).slice(0, 200); } catch { $('#draft-status').textContent = 'Saved drafts could not be read. You can still create and export drafts in this session.'; }
  function save() { try { localStorage.setItem(key, JSON.stringify(drafts)); return true; } catch { $('#draft-status').textContent = 'Browser storage is unavailable or full. Export drafts before leaving this page.'; return false; } }
  function render() {
    $('#draft-count').textContent = String(drafts.length); const list = $('#draft-list'); list.replaceChildren();
    if (!drafts.length) { const p = document.createElement('p'); p.textContent = 'No drafts yet. Start with a creator spotlight, class introduction or event announcement.'; list.append(p); }
    drafts.forEach(draft => {
      const article = document.createElement('article'); article.className = 'draft';
      for (const [tag, text, css] of [['span',draft.status,'status'],['h3',draft.title,''],['span',draft.audience + ' · ' + draft.date,'small'],['p',draft.content,'']]) { const node = document.createElement(tag); node.textContent = text; node.className = css; article.append(node); }
      const actions = document.createElement('div'); actions.className = 'actions';
      const advance = document.createElement('button'); advance.className = 'button outline'; advance.textContent = draft.status === 'Draft' ? 'Ready for review' : draft.status === 'Ready for review' ? 'Approve locally' : 'Return to draft'; advance.addEventListener('click', () => { draft.status = draft.status === 'Draft' ? 'Ready for review' : draft.status === 'Ready for review' ? 'Approved locally' : 'Draft'; save(); render(); });
      const remove = document.createElement('button'); remove.className = 'button outline'; remove.textContent = 'Delete'; remove.setAttribute('aria-label', 'Delete draft: ' + draft.title); remove.addEventListener('click', () => { if (window.confirm('Delete this local draft? Export it first if you want to keep a copy.')) { drafts = drafts.filter(x => x.id !== draft.id); save(); render(); } });
      actions.append(advance,remove); article.append(actions); list.append(article);
    });
  }
  draftForm.addEventListener('submit', event => { event.preventDefault(); if(drafts.length >= 200) { $('#draft-status').textContent = 'Export and remove older drafts before adding more. Limit: 200.'; return; } const data = Object.fromEntries(new FormData(draftForm)); drafts.unshift({...data,id:crypto.randomUUID(),status:'Draft'}); $('#draft-status').textContent = ''; const persisted = save(); render(); draftForm.reset(); if(persisted) $('#draft-status').textContent = 'Draft saved in this browser. Nothing has been published.'; });
  $('#export-drafts').addEventListener('click', () => download('dance-africa-editorial-drafts.json', {exportedAt:new Date().toISOString(),drafts})); render();
}
