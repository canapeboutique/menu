(async function () {
  'use strict';

  const menu = await fetch('data/menu.json');
  const menu_data = await menu.json();

  const products = await fetch('data/products.json');
  const products_data = await products.json();
  console.log(products_data);

  let activeCategory = menu_data.menu.categories[0].id;
  let showAll = false;

  // --- Logo helper ---
  function logoHTML(logo, cls) {
    if (logo.image) {
      return `
        <a class="logo ${cls || ''}" href="#top" aria-label="${logo.title} — на главную">
          <img class="logo__image" src="${logo.image}" alt="${logo.title}" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-flex';" />
          <span class="logo__text-fallback" style="display:none;">
            <span class="logo__title">${logo.title}</span>
            <span class="logo__caption">${logo.caption}</span>
          </span>
        </a>
      `;
    }
    return `
      <a class="logo ${cls || ''}" href="#top" aria-label="${logo.title} — на главную">
        <span class="logo__title">${logo.title}</span>
        <span class="logo__caption">${logo.caption}</span>
      </a>
    `;
  }

  // --- Render Header ---
  function renderHeader() {
    const el = document.querySelector('[data-header]');
    if (!el) return;

    const { logo, nav, contacts, cta } = menu_data.header;

    el.innerHTML = `
      ${logoHTML(logo)}

      <nav class="header__nav" aria-label="Главное меню">
        ${nav.map(item => `<a href="${item.href}">${item.label}</a>`).join('')}
      </nav>

      <div class="header__contacts">
        <a href="${contacts.phone.href}">${contacts.phone.label}</a>
        <a href="${contacts.email.href}">${contacts.email.label}</a>
      </div>

      <a class="button button--outline header__button" href="${cta.href}">${cta.label}</a>

      <button class="burger" type="button" aria-label="Открыть меню" aria-expanded="false" data-burger>
        <span></span><span></span><span></span>
      </button>
    `;
  }

  // --- Render Mobile Menu ---
  function renderMobileMenu() {
    const el = document.querySelector('[data-mobile-menu]');
    if (!el) return;

    const { nav } = menu_data.header;
    el.innerHTML = nav.map(item => `<a href="${item.href}">${item.label}</a>`).join('') +
      `<a href="${menu_data.header.cta.href}">Оставить заявку</a>`;
  }

  // --- Render Hero ---
  function renderHero() {
    const el = document.querySelector('[data-hero]');
    if (!el) return;

    const { title, text, image, imageAlt } = menu_data.hero;

    el.innerHTML = `
      <div class="hero__content">
        <h1>${title}</h1>
        <p class="hero__text">${text}</p>
      </div>
      <div class="hero__image" role="img" aria-label="${imageAlt}" style="--hero-bg: url('${image}')"></div>
    `;
  }

  // --- Render Menu Layout ---
  function renderMenuLayout() {
    const el = document.querySelector('[data-menu-layout]');
    if (!el) return;

    const { sidebarTitle, download, categories } = menu_data.menu;

    el.innerHTML = `
      <aside class="menu-sidebar">
        <div class="menu-sidebar__title">${sidebarTitle}</div>
        ${categories.map(cat => `
          <button class="menu-sidebar__item${cat.id === activeCategory ? ' is-active' : ''}" type="button" data-filter="${cat.id}">${cat.label}</button>
        `).join('')}
        <a class="download-card" href="${download.href}" download>
          <span>↧</span>
          <strong>${download.label}</strong>
          <small>${download.size}</small>
        </a>
      </aside>

      <div class="menu-content">
        <div class="section-heading section-heading--row">
          <div>
            <h2 data-menu-title>${getCategory(activeCategory).label}</h2>
          </div>
          <button class="link-button desktop-only" type="button" data-show-all>Смотреть все →</button>
        </div>

        <div class="mobile-category-tabs" data-mobile-tabs aria-label="Категории меню"></div>
        <div class="products-grid" data-products></div>
      </div>
    `;

    renderMobileTabs();
    renderProducts();
  }

  function normalizeTitle(title) {
    return title
      .toLowerCase()
      .replace(/ё/g, "е")
      .replace(/[^а-яa-z0-9]+/gi, "_")
      .replace(/^_+|_+$/g, "");
  }

  // --- Helpers ---
  function getCategory(id) {
    return menu_data.menu.categories.find(c => c.id === id) || menu_data.menu.categories[0];
  }

  function productTemplate(product, index) {
    const productTilte = normalizeTitle(product.title)
    const productImage = products_data[productTilte]
    console.log(product.title, productTilte, productImage)

    return `
      <article class="product-card" data-product-index="${index}" role="button" tabindex="0">
        <div class="product-card__image" style="--image: url('${productImage}')"></div>
        <div class="product-card__body">
          <h3 class="product-card__title">${product.title}</h3>
          <div class="product-card__meta">
            <span>${product.weight}</span>
            <span class="product-card__price">${product.price}</span>
          </div>
          <button class="product-card__button" type="button">Заказать</button>
        </div>
      </article>
    `;
  }

  function renderProducts(animate) {
    const productRoot = document.querySelector('[data-products]');
    const titleRoot = document.querySelector('[data-menu-title]');
    if (!productRoot) return;

    const category = getCategory(activeCategory);
    const items = showAll
      ? menu_data.menu.products
      : menu_data.menu.products.filter(p => p.category === activeCategory);

    if (titleRoot) {
      if (animate) {
        titleRoot.classList.add('fade-out');
        setTimeout(() => {
          titleRoot.textContent = showAll ? 'Меню Canape' : category.label;
          titleRoot.classList.remove('fade-out');
          titleRoot.classList.add('fade-in');
          setTimeout(() => titleRoot.classList.remove('fade-in'), 300);
        }, 150);
      } else {
        titleRoot.textContent = showAll ? 'Меню Canape' : category.label;
      }
    }

    if (animate) {
      productRoot.classList.add('fade-out');
      setTimeout(() => {
        productRoot.innerHTML = items.map((p, i) => productTemplate(p, menu_data.menu.products.indexOf(p))).join('');
        productRoot.classList.remove('fade-out');
        productRoot.classList.add('fade-in');
        setTimeout(() => productRoot.classList.remove('fade-in'), 300);
      }, 150);
    } else {
      productRoot.innerHTML = items.map((p, i) => productTemplate(p, menu_data.menu.products.indexOf(p))).join('');
    }

    // Update sidebar active state
    document.querySelectorAll('.menu-sidebar__item').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.filter === activeCategory && !showAll);
    });

    // Update mobile tabs active state
    document.querySelectorAll('.mobile-tab').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.filter === activeCategory && !showAll);
    });
  }

  function renderMobileTabs() {
    const mobileTabsRoot = document.querySelector('[data-mobile-tabs]');
    if (!mobileTabsRoot) return;

    mobileTabsRoot.innerHTML = menu_data.menu.categories
      .filter(cat => cat.id !== 'service')
      .map(cat => `<button class="mobile-tab${cat.id === activeCategory ? ' is-active' : ''}" type="button" data-filter="${cat.id}">${cat.short}</button>`)
      .join('');
  }

  function scrollTabToCenter(tabEl) {
    const container = tabEl.parentElement;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const tabRect = tabEl.getBoundingClientRect();
    const scrollLeft = container.scrollLeft + (tabRect.left - containerRect.left) - (containerRect.width / 2) + (tabRect.width / 2);
    container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
  }

  // --- Render About ---
  function renderAbout() {
    const el = document.querySelector('[data-about]');
    if (!el) return;

    const { title, paragraphs, quote, button, image, imageAlt, stats } = menu_data.about;

    el.innerHTML = `
      <div class="about__image" role="img" aria-label="${imageAlt}" style="--about-bg: url('${image}')"></div>
      <div class="about__content">
        <h2>${title}</h2>
        ${paragraphs.map(p => `<p>${p}</p>`).join('')}
        <p class="about__quote">${quote}</p>
        <a class="button button--outline about__button" href="${button.href}">${button.label}</a>
      </div>
      <div class="stats">
        ${stats.map(s => `<div><strong>${s.value}</strong><span>${s.label}</span></div>`).join('')}
      </div>
    `;
  }

  // --- Render Events (horizontal scroll) ---
  function renderEvents() {
    const el = document.querySelector('[data-events]');
    if (!el) return;

    const { title, images, link } = menu_data.events;

    el.innerHTML = `
      <div class="section-heading section-heading--center">
        <h2>${title}</h2>
      </div>
      <div class="events__scroll" data-events-scroll>
        ${images.map((img, i) => `<article class="event-card" data-event-index="${i}" style="--event-image: url('${img.src}')" role="button" tabindex="0"></article>`).join('')}
      </div>
    `;
  }

  // --- Render Footer ---
  function renderFooter() {
    const el = document.querySelector('[data-footer]');
    if (!el) return;

    const { brand, socials, nav, contacts, requisites, copyright } = menu_data.footer;
    const logo = menu_data.header.logo;

    el.innerHTML = `
      <div class="footer__brand">
        ${logoHTML(logo)}
        <p>${brand.description}</p>
        <div class="socials">
          ${socials.map(s => `<a href="${s.href}" aria-label="${s.label}">${s.icon}</a>`).join('')}
        </div>
      </div>

      <div class="footer__col">
        <h3>${nav.title}</h3>
        ${nav.links.map(l => `<a href="${l.href}">${l.label}</a>`).join('')}
      </div>

      <div class="footer__col">
        <h3>${contacts.title}</h3>
        ${contacts.items.map(item => {
          if (item.href) {
            return `<a href="${item.href}">${item.icon} ${item.label}</a>`;
          }
          return `<span>${item.icon} ${item.label}</span>`;
        }).join('')}
      </div>

      <div class="footer__col" id="requisites">
        <h3>${requisites.title}</h3>
        <p>${requisites.text}</p>
      </div>

      <div class="footer__bottom">${copyright}</div>
    `;
  }

  // --- Render Mobile Bottom CTA ---
  function renderMobileBottomCta() {
    const el = document.querySelector('[data-mobile-cta]');
    if (!el) return;

    const { label, href } = menu_data.mobileBottomCta;
    el.innerHTML = `<a href="${href}" data-bottom-link>${label} <span>⌄</span></a>`;
  }

  // --- Modal (pre-created for animation on first open) ---
  function initModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.setAttribute('data-modal', '');
    modal.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <button class="modal__close" type="button" data-modal-close aria-label="Закрыть">×</button>
        <div class="modal__image-wrap"></div>
        <div class="modal__scroll" data-modal-scroll>
          <div class="modal__snap-top">
            <div class="modal__card" data-modal-card></div>
          </div>
          <div class="modal__snap-bottom" data-modal-desc></div>
        </div>
      </div>
      <div class="modal__hint" data-modal-hint>
        <span class="modal__hint-arrow">⌃</span> Прокрутите вверх
      </div>
    `;
    document.body.appendChild(modal);

    // Scroll detection for hint hide
    const scrollEl = modal.querySelector('[data-modal-scroll]');
    scrollEl.addEventListener('scroll', () => {
      if (scrollEl.scrollTop > 10) {
        modal.classList.add('is-scrolled');
      } else {
        modal.classList.remove('is-scrolled');
      }
    });

    return modal;
  }

  // Create modal immediately so transitions work on first open
  const modalEl = initModal();

  function openProductModal(product) {
    const imageWrap = modalEl.querySelector('.modal__image-wrap');
    const cardEl = modalEl.querySelector('[data-modal-card]');
    const descEl = modalEl.querySelector('[data-modal-desc]');
    const hintEl = modalEl.querySelector('[data-modal-hint]');

    const productTilte = normalizeTitle(product.title)
    const productImage = products_data[productTilte]

    imageWrap.innerHTML = `<img class="modal__image" src="${productImage}" alt="${product.title}" />`;
    cardEl.innerHTML = `
      <h3 class="modal__title">${product.title}</h3>
      <div class="modal__meta">
        <span>${product.weight}</span>
        <span class="modal__price">${product.price}</span>
      </div>
      <p class="modal__category">${getCategory(product.category).label}</p>
    `;
    descEl.innerHTML = product.description
      ? `<p class="modal__description">${product.description}</p>`
      : '';

    // Show/hide hint based on whether there's description
    hintEl.style.display = product.description ? '' : 'none';

    // Reset scroll & state
    const scrollEl = modalEl.querySelector('[data-modal-scroll]');
    scrollEl.scrollTop = 0;
    modalEl.classList.remove('is-scrolled');

    requestAnimationFrame(() => {
      modalEl.classList.add('is-open');
      document.body.classList.add('is-locked');
    });
  }

  function openEventModal(img) {
    const imageWrap = modalEl.querySelector('.modal__image-wrap');
    const cardEl = modalEl.querySelector('[data-modal-card]');
    const descEl = modalEl.querySelector('[data-modal-desc]');
    const hintEl = modalEl.querySelector('[data-modal-hint]');

    imageWrap.innerHTML = `<img class="modal__image" src="${img.src}" alt="${img.title || 'Мероприятие'}" />`;
    cardEl.innerHTML = img.title ? `<h3 class="modal__title">${img.title}</h3>` : '';
    descEl.innerHTML = img.description
      ? `<p class="modal__description">${img.description}</p>`
      : '';

    hintEl.style.display = img.description ? '' : 'none';

    const scrollEl = modalEl.querySelector('[data-modal-scroll]');
    scrollEl.scrollTop = 0;
    modalEl.classList.remove('is-scrolled');

    requestAnimationFrame(() => {
      modalEl.classList.add('is-open');
      document.body.classList.add('is-locked');
    });
  }

  function closeModal() {
    modalEl.classList.remove('is-open');
    document.body.classList.remove('is-locked');
  }

  // --- Initialize all sections ---
  renderHeader();
  renderMobileMenu();
  renderHero();
  renderMenuLayout();
  renderAbout();
  renderEvents();
  renderFooter();
  renderMobileBottomCta();

  // --- Event Delegation ---
  document.addEventListener('click', (event) => {
    // Filter buttons (sidebar + mobile tabs)
    const filterButton = event.target.closest('[data-filter]');
    if (filterButton) {
      activeCategory = filterButton.dataset.filter;
      showAll = false;
      renderProducts(true);

      // Scroll mobile tab to center
      if (filterButton.classList.contains('mobile-tab')) {
        scrollTabToCenter(filterButton);
      } else {
        const mobileTab = document.querySelector(`.mobile-tab[data-filter="${activeCategory}"]`);
        if (mobileTab) scrollTabToCenter(mobileTab);
      }
    }

    // Show all button
    if (event.target.closest('[data-show-all]')) {
      showAll = true;
      renderProducts(true);
    }

    // Product card click → open detail modal
    const productCard = event.target.closest('[data-product-index]');
    if (productCard && !event.target.closest('.product-card__button')) {
      const idx = parseInt(productCard.dataset.productIndex, 10);
      const product = menu_data.menu.products[idx];
      if (product) openProductModal(product);
    }

    // Event card click → open media lightbox
    const eventCard = event.target.closest('[data-event-index]');
    if (eventCard) {
      const idx = parseInt(eventCard.dataset.eventIndex, 10);
      const img = menu_data.events.images[idx];
      if (img) openEventModal(img);
    }

    // Close modal
    if (event.target.closest('[data-modal-close]') || event.target.matches('[data-modal]')) {
      closeModal();
    }
  });

  // Close modal on Escape
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });

  // --- Burger Menu ---
  document.addEventListener('click', (event) => {
    const burger = event.target.closest('[data-burger]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (burger && mobileMenu) {
      const isOpen = burger.classList.toggle('is-open');
      mobileMenu.classList.toggle('is-open', isOpen);
      document.body.classList.toggle('is-locked', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
    }

    // Close mobile menu on link click
    if (mobileMenu && event.target.closest('[data-mobile-menu] a')) {
      const burgerBtn = document.querySelector('[data-burger]');
      if (burgerBtn) {
        burgerBtn.classList.remove('is-open');
        burgerBtn.setAttribute('aria-expanded', 'false');
      }
      mobileMenu.classList.remove('is-open');
      document.body.classList.remove('is-locked');
    }
  });

  // --- Bottom Link Observer ---
  const observedSections = [
    { id: 'menu', label: 'К бренду', href: '#about' },
    { id: 'about', label: 'К галерее мероприятий', href: '#events' },
    { id: 'events', label: 'Наверх', href: '#top' },
    { id: 'contacts', label: 'Наверх', href: '#top' }
  ];

  const bottomLink = document.querySelector('[data-bottom-link]');

  if (bottomLink && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      const current = observedSections.find(section => section.id === visible.target.id);
      if (!current) return;

      bottomLink.href = current.href;
      bottomLink.innerHTML = `${current.label} <span>${current.href === '#top' ? '⌃' : '⌄'}</span>`;
    }, { threshold: [0.35, 0.55] });

    observedSections.forEach(({ id }) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }
})();
