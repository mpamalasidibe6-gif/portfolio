const imageNodes = document.querySelectorAll("[data-image]");
imageNodes.forEach(node => {
  const src = node.dataset.image;
  const img = new Image();
  img.onload = () => {
    node.style.setProperty("--photo", `url("${src}")`);
    node.classList.add("has-image");
    const label = node.querySelector(".photo-label");
    if (label) label.textContent = "";
  };
  img.src = src;
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, {threshold: 0.12});
document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

document.querySelector(".menu-btn").addEventListener("click", () => {
  const nav = document.querySelector(".nav-links");
  const open = nav.classList.toggle("mobile-open");
  nav.style.display = open ? "flex" : "";
  if (open) {
    nav.style.position = "absolute";
    nav.style.top = "76px";
    nav.style.left = "0";
    nav.style.right = "0";
    nav.style.padding = "20px 5vw";
    nav.style.background = "rgba(8,8,11,.96)";
    nav.style.flexDirection = "column";
    nav.style.borderBottom = "1px solid #29292f";
  }
});

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", () => {
    const nav = document.querySelector(".nav-links");
    nav.classList.remove("mobile-open");
    if (window.innerWidth <= 850) nav.style.display = "";
  });
});

document.getElementById("contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(e.target);
  const status = document.getElementById("formStatus");
  status.textContent = `> Message préparé pour ${data.get("name")}.`;
  e.target.reset();
});

/* ===================== V3 INTERACTION ENGINE ===================== */
(() => {
  const preloader = document.getElementById("preloader");
  const percent = document.getElementById("loaderPercent");
  const line = document.querySelector(".loader-line i");
  let p = 0;
  const timer = setInterval(() => {
    p += Math.floor(Math.random() * 9) + 4;
    if (p >= 100) {
      p = 100;
      clearInterval(timer);
      setTimeout(() => preloader?.classList.add("done"), 300);
    }
    if (percent) percent.textContent = String(p).padStart(2, "0") + "%";
    if (line) line.style.width = p + "%";
  }, 55);

  const progress = document.querySelector(".scroll-progress i");
  const updateScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.width = (max > 0 ? scrollY / max * 100 : 0) + "%";
  };
  addEventListener("scroll", updateScroll, {passive:true});
  updateScroll();

  // Desktop magnetic cursor.
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  const label = document.querySelector(".cursor-label");
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  addEventListener("pointermove", e => {
    mx = e.clientX; my = e.clientY;
    if (dot) { dot.style.left = mx + "px"; dot.style.top = my + "px"; }
  }, {passive:true});
  const cursorLoop = () => {
    rx += (mx-rx)*.16; ry += (my-ry)*.16;
    if (ring) { ring.style.left = rx + "px"; ring.style.top = ry + "px"; }
    if (label) { label.style.left = rx + "px"; label.style.top = ry + "px"; }
    requestAnimationFrame(cursorLoop);
  };
  cursorLoop();

  document.querySelectorAll("a,button,.skill-card,.gallery-item").forEach(el => {
    el.addEventListener("mouseenter", () => ring?.classList.add("hover"));
    el.addEventListener("mouseleave", () => ring?.classList.remove("hover"));
  });
  document.querySelectorAll(".cursor-view").forEach(el => {
    el.addEventListener("mouseenter", () => label?.classList.add("show"));
    el.addEventListener("mouseleave", () => label?.classList.remove("show"));
  });

  // 3D tilt for hero visual.
  const tilt = document.querySelector('[data-tilt="true"]');
  if (tilt && matchMedia("(pointer:fine)").matches) {
    tilt.addEventListener("pointermove", e => {
      const r = tilt.getBoundingClientRect();
      const x = (e.clientX-r.left)/r.width-.5;
      const y = (e.clientY-r.top)/r.height-.5;
      tilt.style.transform = `rotateY(${x*10}deg) rotateX(${-y*8}deg) translateZ(10px)`;
    });
    tilt.addEventListener("pointerleave", () => tilt.style.transform = "");
  }

  // Subtle spotlight follows pointer on skill cards.
  document.querySelectorAll(".skill-card").forEach(card => {
    card.addEventListener("pointermove", e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", ((e.clientX-r.left)/r.width*100)+"%");
      card.style.setProperty("--my", ((e.clientY-r.top)/r.height*100)+"%");
    });
  });

  // Particle field — intentionally lightweight for mobile.
  const canvas = document.getElementById("particleCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let w, h, dpr, particles = [];
    const count = innerWidth < 600 ? 28 : 55;
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = innerWidth; h = innerHeight;
      canvas.width = w*dpr; canvas.height = h*dpr;
      canvas.style.width = w+"px"; canvas.style.height = h+"px";
      ctx.setTransform(dpr,0,0,dpr,0,0);
      particles = Array.from({length:count}, () => ({
        x:Math.random()*w, y:Math.random()*h,
        vx:(Math.random()-.5)*.18, vy:(Math.random()-.5)*.18,
        r:Math.random()*1.5+.4, a:Math.random()*.45+.1
      }));
    };
    resize();
    addEventListener("resize", resize, {passive:true});
    const draw = () => {
      ctx.clearRect(0,0,w,h);
      for (const a of particles) {
        a.x += a.vx; a.y += a.vy;
        if (a.x<0) a.x=w; if (a.x>w) a.x=0;
        if (a.y<0) a.y=h; if (a.y>h) a.y=0;
        ctx.beginPath(); ctx.arc(a.x,a.y,a.r,0,Math.PI*2);
        ctx.fillStyle = `rgba(199,255,103,${a.a})`; ctx.fill();
      }
      requestAnimationFrame(draw);
    };
    draw();
  }

  // Parallax elements marked with data-speed.
  const parallax = [...document.querySelectorAll("[data-speed]")];
  const parallaxTick = () => {
    const y = scrollY;
    parallax.forEach(el => {
      const speed = parseFloat(el.dataset.speed || 0);
      el.style.transform = `translate3d(0,${y*speed*-1}px,0)`;
    });
  };
  addEventListener("scroll", parallaxTick, {passive:true});
})();

/* ===================== V5 FULL EXPERIENCE ENGINE ===================== */
(() => {
  const intro=document.getElementById('cinematicIntro');
  const enter=document.getElementById('enterExperience');
  const film=document.getElementById('filmVideo');
  enter?.addEventListener('click',()=>{intro?.classList.add('exit'); film?.play?.().catch(()=>{}); setTimeout(()=>intro?.remove(),1200);});
  setTimeout(()=>{if(intro && !intro.classList.contains('exit')){intro.classList.add('exit');film?.play?.().catch(()=>{});}},6500);

  const toggle=document.getElementById('modeToggle');
  toggle?.addEventListener('click',()=>{document.body.classList.toggle('cinema-on');toggle.classList.toggle('active');film?.play?.().catch(()=>{});});

  const modal=document.getElementById('projectModal');
  const modalTitle=document.getElementById('modalTitle');
  const modalNumber=document.getElementById('modalNumber');
  const modalKicker=document.getElementById('modalKicker');
  const modalDesc=document.getElementById('modalDescription');
  const modalTags=document.getElementById('modalTags');
  const projects={
    pam:{n:'01',k:'APP · EDUCATION · DESIGN',t:'PAM ACADEMY',d:'Une expérience mobile-first pour apprendre Word, Excel, PowerPoint et Photoshop avec une interface progressive, claire et orientée pratique.',tags:['React','Tailwind','Education','Mobile UI']},
    sira:{n:'02',k:'WEB · EXPERIENCE',t:'SIRA BIRTHDAY EXPERIENCE',d:'Une expérience web personnalisée pensée comme un parcours narratif : souvenirs, galerie, interactions et révélation finale.',tags:['HTML','CSS','JavaScript','Storytelling']},
    calc:{n:'03',k:'PYTHON · PYGAME',t:'CALCULATRICE',d:'Une calculatrice mobile expérimentale avec boutons arrondis, interactions tactiles, historique, racine et puissance.',tags:['Python','Pygame','Touch UI','Math']},
    spiral:{n:'04',k:'CREATIVE CODE · PYTHON',t:'PARTICLE SPIRAL',d:'Une composition générative de particules conçue pour rester centrée et immersive sur un écran de téléphone.',tags:['Python','Particles','Animation','Mobile']}
  };
  const openModal=(key)=>{const d=projects[key];if(!d||!modal)return;modalNumber.textContent=d.n;modalKicker.textContent=d.k;modalTitle.textContent=d.t;modalDesc.textContent=d.d;modalTags.innerHTML=d.tags.map(x=>`<span>${x}</span>`).join('');modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');};
  const closeModal=()=>{modal?.classList.remove('open');modal?.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');};
  document.querySelectorAll('.project-open').forEach(b=>b.addEventListener('click',()=>openModal(b.dataset.project)));
  document.querySelectorAll('[data-close-modal]').forEach(x=>x.addEventListener('click',closeModal));

  const palette=document.getElementById('commandPalette');
  const closePalette=()=>{palette?.classList.remove('open');palette?.setAttribute('aria-hidden','true');document.body.classList.remove('palette-open');};
  const openPalette=()=>{palette?.classList.add('open');palette?.setAttribute('aria-hidden','false');document.body.classList.add('palette-open');};
  document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>{closePalette();document.querySelector(b.dataset.go)?.scrollIntoView({behavior:'smooth'});}));
  document.querySelectorAll('[data-close-palette]').forEach(x=>x.addEventListener('click',closePalette));
  addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closePalette();}if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){e.preventDefault();openPalette();}});

  // Gallery fullscreen viewer.
  const galleryItems=[...document.querySelectorAll('.gallery-item img')];
  let viewer;
  const showViewer=(img)=>{
    if(!viewer){viewer=document.createElement('div');viewer.className='v5-viewer';viewer.innerHTML='<button aria-label="Fermer">×</button><img alt=""><span></span>';document.body.appendChild(viewer);viewer.addEventListener('click',e=>{if(e.target===viewer||e.target.tagName==='BUTTON')viewer.classList.remove('open');});}
    viewer.querySelector('img').src=img.src;viewer.querySelector('img').alt=img.alt;viewer.querySelector('span').textContent=img.alt||'IMAGE';viewer.classList.add('open');
  };
  galleryItems.forEach(img=>img.addEventListener('click',()=>showViewer(img)));
})();


/* ===================== V6 AWARD EXPERIENCE ENGINE ===================== */
(() => {
  // Horizontal story rail: drag with mouse or touch, while native swipe remains available.
  const rail = document.getElementById('storyRail');
  if (rail) {
    let down=false,startX=0,startScroll=0;
    rail.addEventListener('pointerdown', e => {
      down=true; startX=e.clientX; startScroll=rail.scrollLeft; rail.setPointerCapture?.(e.pointerId);
    });
    rail.addEventListener('pointermove', e => {
      if(!down) return;
      rail.scrollLeft = startScroll - (e.clientX-startX)*1.15;
    });
    ['pointerup','pointercancel','pointerleave'].forEach(ev=>rail.addEventListener(ev,()=>down=false));
  }

  // Soft spotlight follows the pointer on larger screens.
  const spotlight=document.createElement('div');
  spotlight.className='v6-spotlight';
  document.body.appendChild(spotlight);
  let sx=0,sy=0,tx=0,ty=0;
  addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;});
  const spotLoop=()=>{
    sx+=(tx-sx)*.12; sy+=(ty-sy)*.12;
    spotlight.style.transform=`translate3d(${sx-190}px,${sy-190}px,0)`;
    requestAnimationFrame(spotLoop);
  };
  spotLoop();

  // Mark current major section in the navigation.
  const links=[...document.querySelectorAll('.nav-links a')];
  const targets=links.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        links.forEach(a=>a.classList.toggle('is-current',a.getAttribute('href')==='#'+entry.target.id));
      }
    });
  },{rootMargin:'-35% 0px -55% 0px',threshold:0});
  targets.forEach(t=>observer.observe(t));

  // Add a subtle magnetic response to primary actions.
  if(matchMedia('(pointer:fine)').matches){
    document.querySelectorAll('.btn-primary,.nav-cta,.intro-enter').forEach(el=>{
      el.addEventListener('pointermove',e=>{
        const r=el.getBoundingClientRect();
        const dx=(e.clientX-(r.left+r.width/2))*.12;
        const dy=(e.clientY-(r.top+r.height/2))*.12;
        el.style.transform=`translate(${dx}px,${dy}px)`;
      });
      el.addEventListener('pointerleave',()=>el.style.transform='');
    });
  }
})();

/* ===================== V7 SIGNATURE COMMAND CENTER ===================== */
(() => {
  const palette=document.getElementById('commandPalette');
  const input=document.getElementById('commandInput');
  const openBtn=document.getElementById('openCommands');
  const items=[...document.querySelectorAll('.command-items button')];

  const open=()=>{
    if(!palette) return;
    palette.classList.add('open');
    palette.setAttribute('aria-hidden','false');
    setTimeout(()=>input?.focus(),80);
  };
  const close=()=>{
    palette?.classList.remove('open');
    palette?.setAttribute('aria-hidden','true');
    if(input) input.value='';
    items.forEach(x=>x.style.display='grid');
  };
  openBtn?.addEventListener('click',open);
  palette?.addEventListener('click',e=>{if(e.target===palette) close();});
  items.forEach(btn=>btn.addEventListener('click',()=>{document.querySelector(btn.dataset.go)?.scrollIntoView({behavior:'smooth'});close();}));
  input?.addEventListener('input',()=>{
    const q=input.value.toLowerCase().trim();
    items.forEach(btn=>btn.style.display=btn.textContent.toLowerCase().includes(q)?'grid':'none');
  });
  addEventListener('keydown',e=>{
    if(e.key==='/' && document.activeElement!==input && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){e.preventDefault();open();}
    if(e.key==='Escape') close();
  });
})();
