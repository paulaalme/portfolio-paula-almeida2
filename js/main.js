(() => {
  const EMAIL = 'Paula.lagos987@gmail.com';
  const COPY_FEEDBACK_MS = 2000;
  const SCROLL_THRESHOLD_PX = 8;

  // Menu mobile: abre/fecha a navegação e fecha ao escolher um link
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');

  const setMenuOpen = (open) => {
    if (!toggle || !nav) {
      return;
    }

    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      setMenuOpen(!nav.classList.contains('is-open'));
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenuOpen(false));
    });
  }

  // Header: fixa ao rolar para baixo, oculta ao rolar para cima, volta ao estado original no topo
  const header = document.querySelector('.site-header');
  const headerWrap = document.querySelector('.site-header-wrap');

  if (header && headerWrap) {
    let lastY = window.scrollY;
    let frameRequested = false;

    const updateHeader = () => {
      frameRequested = false;

      const y = Math.max(0, window.scrollY);

      // No topo da página, a header volta à apresentação original
      if (y <= header.offsetHeight) {
        header.classList.remove('is-fixed', 'is-hidden');
        headerWrap.classList.remove('is-hidden');
        setMenuOpen(false);
        lastY = y;
        return;
      }

      const delta = y - lastY;

      // Ignora variações pequenas para evitar alternância contínua
      if (Math.abs(delta) < SCROLL_THRESHOLD_PX) {
        return;
      }

      const hide = delta < 0;

      header.classList.add('is-fixed');
      header.classList.toggle('is-hidden', hide);
      headerWrap.classList.toggle('is-hidden', hide);

      if (hide) {
        setMenuOpen(false);
      }

      lastY = y;
    };

    window.addEventListener('scroll', () => {
      if (!frameRequested) {
        frameRequested = true;
        requestAnimationFrame(updateHeader);
      }
    }, { passive: true });
  }

  // Link do currículo: o botão "Ver currículo (PDF)" usa o mesmo destino do botão "Currículo"
  const resumeSource = document.getElementById('resume-link');

  if (resumeSource) {
    document.querySelectorAll('[data-resume-target]').forEach((link) => {
      link.href = resumeSource.href;
      link.target = resumeSource.target;
      link.rel = resumeSource.rel;
    });
  }

  // Copiar e-mail: usa a API de clipboard e, se indisponível, um fallback com execCommand
  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand('copy');
    field.remove();

    if (!copied) {
      throw new Error('Cópia não suportada');
    }
  };

  document.querySelectorAll('[data-copy]').forEach((button) => {
    const defaultLabel = button.getAttribute('aria-label');
    let timer = null;

    const restore = () => {
      button.classList.remove('is-copied');
      button.setAttribute('aria-label', defaultLabel);
      timer = null;
    };

    button.addEventListener('click', async () => {
      try {
        await copyText(button.dataset.copy || EMAIL);
        button.classList.add('is-copied');
        button.setAttribute('aria-label', 'E-mail copiado');
      } catch {
        // Falha: não mostra o estado de sucesso
        button.classList.remove('is-copied');
        button.setAttribute('aria-label', 'Não foi possível copiar');
      }

      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(restore, COPY_FEEDBACK_MS);
    });
  });

  // Revelação única: executa o callback na primeira vez que o alvo entra na área visível.
  // rootMargin reduz a área de detecção, para a animação começar quando a seção chega de fato.
  const onFirstVisible = (target, callback) => {
    if (!target) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      callback();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        callback();
      }
    }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });

    observer.observe(target);
  };

  // Seleção progressiva nas frases destacadas do hero e da seção 2
  onFirstVisible(document.querySelector('.hero__title'), () => {
    document.querySelectorAll('.hero__title .highlight').forEach((el) => el.classList.add('is-selected'));
  });

  onFirstVisible(document.querySelector('.section-title--process'), () => {
    document.querySelectorAll('.section-title--process .highlight').forEach((el) => el.classList.add('is-selected'));
  });

  // Entrada sequencial das etapas da seção 2, quando a lista de etapas chega à tela
  onFirstVisible(document.querySelector('#como-eu-trabalho .steps'), () => {
    document.getElementById('como-eu-trabalho').classList.add('is-revealed');
  });
})();
