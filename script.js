/* ============================================
   COLECCIÓN BOTÁNICA — SCRIPT
   Scroll horizontal · Blur progresivo
   ============================================ */

(function () {
  const scrollTrack   = document.getElementById('scrollTrack');
  const blurOverlay   = document.getElementById('blurOverlay');
  const textHalo      = document.getElementById('textHalo');
  const panelGallery  = document.getElementById('panelGallery');
  const cards         = document.querySelectorAll('.chapter-card');

  let currentPanel  = 0;
  const totalPanels = 2;
  let isAnimating   = false;

  // ─── Estado inicial ───────────────────────
  goToPanel(0, false);

  // ─── Navegar a un panel ───────────────────
  function goToPanel(index, animate = true) {
    if (index < 0 || index >= totalPanels) return;
    currentPanel = index;

    if (!animate) {
      scrollTrack.style.transition = 'none';
    } else {
      scrollTrack.style.transition = 'transform 0.9s cubic-bezier(0.77, 0, 0.175, 1)';
    }

    scrollTrack.style.transform = `translateX(${-index * 100}vw)`;

    updateBlur(index);

    if (animate) {
      isAnimating = true;
      setTimeout(() => {
        isAnimating = false;
      }, 950);
    }
  }

  // ─── Lógica de blur ───────────────────────
  function updateBlur(panelIndex) {
    if (panelIndex === 0) {
      // PORTADA: blur solo en el halo del texto
      blurOverlay.classList.remove('gallery-active');
      textHalo.style.opacity = '1';
    } else {
      // GALERÍA: blur se extiende a toda la pintura
      blurOverlay.classList.add('gallery-active');
      textHalo.style.opacity = '0';

      // Animar las cards cuando llega a la galería
      animateCards();
    }
  }

  // ─── Animación secuencial de las cards ────
  function animateCards() {
    cards.forEach((card, i) => {
      card.classList.remove('animate-in');
      // Pequeño delay para que se vea el sequence
      setTimeout(() => {
        card.classList.add('animate-in');
      }, 80 + i * 100);
    });
  }

  // ─── Scroll con rueda del mouse ───────────
  let wheelCooldown = false;

  window.addEventListener('wheel', (e) => {
    e.preventDefault();

    if (isAnimating || wheelCooldown) return;

    // Cualquier dirección de scroll navega
    const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;

    if (delta > 30) {
      goToPanel(currentPanel + 1);
      setCooldown();
    } else if (delta < -30) {
      goToPanel(currentPanel - 1);
      setCooldown();
    }
  }, { passive: false });

  function setCooldown() {
    wheelCooldown = true;
    setTimeout(() => { wheelCooldown = false; }, 1000);
  }

  // ─── Touch en móvil ───────────────────────
  let touchStartX = 0;
  let touchStartY = 0;

  window.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    if (isAnimating) return;

    const dx = touchStartX - e.changedTouches[0].clientX;
    const dy = touchStartY - e.changedTouches[0].clientY;

    // Solo detectar swipe horizontal (más dx que dy)
    if (Math.abs(dx) < Math.abs(dy) * 1.2) return;
    if (Math.abs(dx) < 50) return;

    if (dx > 0) {
      goToPanel(currentPanel + 1);
    } else {
      goToPanel(currentPanel - 1);
    }
  }, { passive: true });

  // ─── Teclado ──────────────────────────────
  window.addEventListener('keydown', (e) => {
    if (isAnimating) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      goToPanel(currentPanel + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      goToPanel(currentPanel - 1);
    }
  });

  // ─── Prevenir scroll vertical del body ────
  document.body.addEventListener('touchmove', (e) => {
    e.preventDefault();
  }, { passive: false });

      // ═══ SISTEMA DE DESBLOQUEO ═══
  (function initUnlock() {
    const params = new URLSearchParams(window.location.search);
    const unlockCode = params.get('unlock');
    
    if (unlockCode) {
      // Guardar capítulo desbloqueado
      let unlocked = JSON.parse(localStorage.getItem('unlockedChapters') || '["cap1"]');
      if (!unlocked.includes(unlockCode)) {
        unlocked.push(unlockCode);
        localStorage.setItem('unlockedChapters', JSON.stringify(unlocked));
        
        // Limpiar URL sin recargar
        window.history.replaceState({}, '', window.location.pathname);
        
        // Mostrar notificación
        showUnlockNotification(unlockCode);
      }
    }
    
    // Aplicar desbloqueos guardados
    applyUnlocks();
  })();

  function applyUnlocks() {
    const unlocked = JSON.parse(localStorage.getItem('unlockedChapters') || '["cap1"]');
    
    // Actualizar contador
    const counter = document.getElementById('unlockedCount');
    if (counter) counter.textContent = unlocked.length;
    
    // Desbloquear cards correspondientes
    unlocked.forEach(code => {
      const card = document.querySelector(`[data-unlock="${code}"]`);
      if (card && card.classList.contains('locked')) {
        card.classList.remove('locked');
        card.classList.add('unlocked');
        // Si es <div>, convertir a <a>
        if (card.tagName === 'DIV') {
          const href = card.getAttribute('data-href');
          if (href) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => window.location.href = href);
          }
        }
      }
    });
  }

  function showUnlockNotification(code) {
    const notif = document.createElement('div');
    notif.className = 'unlock-notification';
    notif.innerHTML = `
      <div class="notif-icon">✓</div>
      <div class="notif-text">Capítulo desbloqueado</div>
    `;
    document.body.appendChild(notif);
    
    setTimeout(() => notif.classList.add('show'), 100);
    setTimeout(() => {
      notif.classList.remove('show');
      setTimeout(() => notif.remove(), 400);
    }, 3000);
  }

  // ═══ CONTADOR DE DÍAS ═══
  (function initDaysCounter() {
    const firstFlowerDate = new Date('2026-02-13'); // 13 de febrero 2026
    const today = new Date();
    const diffTime = Math.abs(today - firstFlowerDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const counter = document.getElementById('daysCounter');
    if (counter) {
      counter.textContent = `${diffDays} ${diffDays === 1 ? 'día' : 'días'} desde la primera flor`;
    }
  })();

})();
