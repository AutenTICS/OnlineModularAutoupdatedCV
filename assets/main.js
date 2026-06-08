// Lightweight UX: project-card modal, sticky Print / Export PDF actions, and small accessibility helpers

document.addEventListener('DOMContentLoaded', () => {
  // --- Modal (Project details) ---
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-hidden="true" aria-label="Project details">
      <button class="close-btn" aria-label="Cerrar proyecto">Cerrar</button>
      <h3 class="modal-title"></h3>
      <p class="modal-desc"></p>
      <div class="modal-stack"></div>
    </div>
  `;
  document.body.appendChild(modalOverlay);

  const modal = modalOverlay.querySelector('.modal');
  const titleEl = modal.querySelector('.modal-title');
  const descEl = modal.querySelector('.modal-desc');
  const stackEl = modal.querySelector('.modal-stack');
  const closeBtn = modal.querySelector('.close-btn');

  function openModal({ title = '', desc = '', stack = '' }) {
    titleEl.textContent = title;
    descEl.textContent = desc;
    stackEl.textContent = stack;
    modalOverlay.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    // move focus to close button for quick exit
    closeBtn.focus();
    document.documentElement.classList.add('no-scroll');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('no-scroll');
    document.body.style.overflow = '';
  }

  // Attach to project cards (keyboard accessible)
  document.querySelectorAll('.project-card').forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('click', () => {
      const title = card.querySelector('.project-name')?.textContent?.trim();
      const desc = card.querySelector('.project-desc')?.textContent?.trim();
      const stack = card.querySelector('.project-stack')?.textContent?.trim();
      openModal({ title, desc, stack });
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  // Close handlers
  closeBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // --- Sticky actions: Print & Export PDF ---
  const printBtn = document.getElementById('printBtn');
  const pdfBtn = document.getElementById('pdfBtn');

  function doPrint(optimized = false) {
    // when optimized=true, add a class so CSS can switch to print-friendly styling if needed
    if (optimized) document.documentElement.classList.add('print-optimized');
    // call print
    window.print();
    // cleanup: some browsers fire onafterprint; use both
    const cleanup = () => {
      if (optimized) document.documentElement.classList.remove('print-optimized');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    // fallback cleanup after 1s in case afterprint isn't supported
    setTimeout(cleanup, 1000);
  }

  if (printBtn) {
    printBtn.addEventListener('click', () => doPrint(false));
    printBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        doPrint(false);
      }
    });
  }

  if (pdfBtn) {
    // Export PDF will trigger print but mark as optimized; browsers typically allow "Save as PDF".
    pdfBtn.addEventListener('click', () => doPrint(true));
    pdfBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        doPrint(true);
      }
    });
  }

  // Small visual feedback on hover / focus for sticky buttons
  document.querySelectorAll('.sticky-btn').forEach(b => {
    b.addEventListener('mousedown', () => b.classList.add('active'));
    b.addEventListener('mouseup', () => b.classList.remove('active'));
    b.addEventListener('blur', () => b.classList.remove('active'));
  });

  // --- Accessibility: reduce motion respect (just in case) ---
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('reduced-motion');
  }
});
