(() => {
  // Fluxos As-Is: os botões trocam o embed exibido.
  // Só existe um iframe na página; o src muda conforme o fluxo escolhido.
  const flowButtons = document.querySelectorAll('[data-flow-src]');
  const flowFrame = document.getElementById('flow-frame');

  if (flowButtons.length && flowFrame) {
    flowButtons.forEach((button) => {
      button.addEventListener('click', () => {
        flowButtons.forEach((other) => {
          const active = other === button;
          other.classList.toggle('case-tab--active', active);
          other.setAttribute('aria-pressed', String(active));
        });

        flowFrame.src = button.dataset.flowSrc;
        flowFrame.title = button.dataset.flowTitle;
      });
    });
  }

  // Galeria de insights: cada item abre a própria imagem no lightbox.
  const lightbox = document.getElementById('case-lightbox');
  const lightboxImg = document.getElementById('case-lightbox-img');
  const closeButton = lightbox ? lightbox.querySelector('.case-lightbox__close') : null;
  const galleryItems = document.querySelectorAll('[data-lightbox-index]');

  if (lightbox && lightboxImg && galleryItems.length) {
    let savedScrollY = 0;

    const openAt = (item) => {
      const img = item.querySelector('img');
      lightboxImg.src = img.currentSrc || img.src;
      lightboxImg.alt = img.alt;

      savedScrollY = window.scrollY;
      document.documentElement.classList.add('case-lightbox-open');
      lightbox.showModal();
    };

    const close = () => {
      lightbox.close();
    };

    galleryItems.forEach((item) => {
      item.addEventListener('click', () => openAt(item));
    });

    if (closeButton) {
      closeButton.addEventListener('click', close);
    }

    // Clique no fundo (o próprio <dialog>), e não na imagem, fecha o lightbox
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) {
        close();
      }
    });

    // Ao fechar (botão, Escape ou fundo), libera a rolagem e restaura a posição
    lightbox.addEventListener('close', () => {
      document.documentElement.classList.remove('case-lightbox-open');
      window.scrollTo({ top: savedScrollY, behavior: 'instant' });
      lightboxImg.removeAttribute('src');
    });
  }
})();
