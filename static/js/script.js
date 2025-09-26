// script.js - main JS for the site
document.addEventListener('DOMContentLoaded', function(){
  // Preloader hide
  const pre = document.getElementById('preloader');
  setTimeout(()=>{
    pre.classList.add('preloader-hidden');
    pre.style.opacity = '0';
    pre.style.pointerEvents = 'none';
    pre.style.visibility = 'hidden';
  }, 700);

  // Year in footer
  const yearEl = document.getElementById('year'); if(yearEl) yearEl.textContent = new Date().getFullYear();

  /* --- Gallery filter & pagination (keeps previous behavior) --- */
  const items = Array.from(document.querySelectorAll('#galleryGrid .gallery-item'));
  const perPage = 6; // items per page
  let currentFilter = 'all';
  let currentPage = 1;
  const paginationContainer = document.getElementById('galleryPagination');
  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));

  filterButtons.forEach(btn => btn.addEventListener('click', ()=>{
    filterButtons.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.getAttribute('data-filter');
    currentPage = 1;
    renderGallery();
  }));

  function getFiltered(){ if(currentFilter === 'all') return items; return items.filter(i => i.dataset.category === currentFilter); }

  function renderGallery(){
    const filtered = getFiltered();
    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / perPage));
    // hide all
    items.forEach(i=>{ i.classList.remove('show'); i.classList.add('hide'); i.style.display = 'none'; });
    // show current page
    const start = (currentPage-1)*perPage;
    const visible = filtered.slice(start, start+perPage);
    visible.forEach(v=>{ v.style.display = ''; setTimeout(()=>{ v.classList.remove('hide'); v.classList.add('show'); }, 22); });
    // render pagination
    renderPagination(pages);
  }

  function renderPagination(pages){
    if(!paginationContainer) return;
    paginationContainer.innerHTML = '';
    for(let i=1;i<=pages;i++){
      const li = document.createElement('li'); li.className = 'page-item' + (i===currentPage? ' active' : '');
      const a = document.createElement('a'); a.className = 'page-link'; a.href = '#'; a.textContent = i;
      a.addEventListener('click', (e)=>{ e.preventDefault(); currentPage = i; renderGallery(); });
      li.appendChild(a);
      paginationContainer.appendChild(li);
    }
  }
  renderGallery();

  // Reveal animations using IntersectionObserver
  const revealElems = document.querySelectorAll('section, .feature-card, .hero-card, .card-animated, .feature-animated');
  const revealObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('reveal');
      }
    });
  }, {threshold: .12});
  revealElems.forEach(e=>revealObserver.observe(e));

  // Smooth anchor scrolling
  document.querySelectorAll('a.nav-link, a[href^="#"]').forEach(a=>{
    a.addEventListener('click', function(e){
      const href = this.getAttribute('href');
      if(href && href.startsWith('#')){
        e.preventDefault();
        const el = document.querySelector(href);
        if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });

  // Lightbox - open image in modal
  const lightboxModalEl = document.getElementById('lightboxModal');
  if(lightboxModalEl){
    const lightboxModal = new bootstrap.Modal(lightboxModalEl);
    document.querySelectorAll('#galleryGrid img').forEach(img=>{
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', ()=>{
        const full = img.dataset.full || img.src;
        const light = document.getElementById('lightboxImg');
        light.src = full;
        light.alt = img.alt || '';
        lightboxModal.show();
      });
    });
  }

  // Admission form validation + demo submit
  const admissionForm = document.getElementById('admissionForm');
  if(admissionForm){
    admissionForm.addEventListener('submit', function(e){
      e.preventDefault();
      if(!admissionForm.checkValidity()){ admissionForm.classList.add('was-validated'); return; }
      const submitBtn = admissionForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true; submitBtn.textContent = 'Sending...';
      setTimeout(()=>{
        alert('Thank you — your enquiry has been received (demo).');
        submitBtn.disabled = false; submitBtn.textContent = 'Send Enquiry';
        const modalEl = bootstrap.Modal.getInstance(document.getElementById('admissionModal'));
        if(modalEl) modalEl.hide();
        admissionForm.reset(); admissionForm.classList.remove('was-validated');
      }, 900);
    });
  }

  // Comments: simple client-side storage & rendering (localStorage)
  const commentForm = document.getElementById('commentForm');
  const commentsList = document.getElementById('commentsList');
  const clearBtn = document.getElementById('clearComments');
  const COMMENTS_KEY = 'cvss_comments_v1';

  function loadComments(){
    const raw = localStorage.getItem(COMMENTS_KEY);
    try{
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return []; }
  }

  function saveComments(list){ localStorage.setItem(COMMENTS_KEY, JSON.stringify(list)); }

  function renderComments(){
    const list = loadComments().slice().reverse(); // newest first
    commentsList.innerHTML = '';
    if(list.length===0) commentsList.innerHTML = '<p class="text-muted small">No comments yet — be the first to encourage our students.</p>';
    list.forEach(c=>{
      const div = document.createElement('div'); div.className = 'comment';
      div.innerHTML = `<div><strong>${escapeHtml(c.name)}</strong> <div class="meta">${new Date(c.ts).toLocaleString()}</div></div><p class="mb-0 mt-2">${escapeHtml(c.text)}</p>`;
      commentsList.appendChild(div);
    });
  }

  function escapeHtml(s){ return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'); }

  if(commentForm){
    commentForm.addEventListener('submit', function(e){
      e.preventDefault();
      if(!commentForm.checkValidity()){ commentForm.classList.add('was-validated'); return; }
      const fd = new FormData(commentForm);
      const name = fd.get('name').trim();
      const text = fd.get('comment').trim();
      const list = loadComments();
      list.push({name, text, ts: Date.now()});
      saveComments(list);
      renderComments();
      commentForm.reset(); commentForm.classList.remove('was-validated');
    });
  }

  if(clearBtn){ clearBtn.addEventListener('click', function(){ if(confirm('Clear all comments (demo)?')){ localStorage.removeItem(COMMENTS_KEY); renderComments(); } }); }

  renderComments();

  // Language toggle (keeps previous simple i18n)
  const i18n = window.i18n || {}; // existing map already in canvas; if not present it's fine
  const setLanguageBtns = { en: document.getElementById('langEn'), sw: document.getElementById('langSw') };
  if(setLanguageBtns.en && setLanguageBtns.sw){
    setLanguageBtns.en.addEventListener('click', ()=> setLanguage('en'));
    setLanguageBtns.sw.addEventListener('click', ()=> setLanguage('sw'));
  }

});

// progressive enhancement styles appended dynamically
(function(){
  const s = document.createElement('style');
  s.innerHTML = `
  .preloader-hidden{transition:opacity .6s ease, visibility .6s ease; opacity:0; visibility:hidden}
  section.reveal{transform:none;opacity:1;transition:transform .8s ease,opacity .8s ease}
  section{transform:translateY(18px);opacity:0}
  .feature-card.reveal,.hero-card.reveal{transform:none;opacity:1;transition:transform .65s ease,opacity .65s ease}
  .feature-card,.hero-card{transform:translateY(8px);opacity:0}
  `;
  document.head.appendChild(s);
})();


      // Gallery filter logic
      document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.addEventListener('click', function() {
        document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const filter = this.getAttribute('data-filter');
        document.querySelectorAll('#galleryGrid .gallery-item').forEach(item => {
          if (filter === 'all' || item.getAttribute('data-category') === filter) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
        });
      });
