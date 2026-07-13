/* ==========================================================================
   Casa do Baralho — script.js
   Todo o site (categorias, seções, cards) é gerado a partir de dois arquivos:
     - data/categorias.json  → quais categorias existem, ordem e aparência
     - data/produtos.json    → os produtos, cada um referenciando uma categoria
   Para adicionar, remover, renomear ou reordenar categorias, edite apenas
   categorias.json. Nenhum HTML/CSS/JS precisa ser alterado.
   ========================================================================== */
(function () {
  "use strict";

  const CATEGORIAS_URL = "data/categorias.json";
  const PRODUTOS_URL = "data/produtos.json";

  const catalogoWrap = document.getElementById("catalogo");
  const headerNav = document.getElementById("nav");
  const footerNav = document.getElementById("footerNav");
  const emptyState = document.getElementById("emptyState");

  const sections = []; // { el, id, track, dotsWrap, prevBtn, nextBtn, rebuildDots }

  /* ---------- Utilidades ---------- */
  function el(tag, className, html) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  /* ---------- Navegação (cabeçalho e rodapé) ---------- */
  function renderNav(categorias) {
    headerNav.innerHTML = "";
    footerNav.innerHTML = "";
    categorias.forEach((cat) => {
      const linkHeader = el("a", "", escapeHtml(cat.nome));
      linkHeader.href = `#${cat.id}`;
      headerNav.appendChild(linkHeader);

      const linkFooter = el("a", "", escapeHtml(cat.nome));
      linkFooter.href = `#${cat.id}`;
      footerNav.appendChild(linkFooter);
    });
  }

  /* ---------- Card de produto ---------- */
  function buildCard(produto) {
    const card = el("article", "card");
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "link");
    card.setAttribute("aria-label", `Ver ${produto.nome} em ${produto.marketplace}`);
    card.dataset.nome = produto.nome.toLowerCase();
    card.dataset.categoria = produto.categoria;

    card.innerHTML = `
      <div class="card__media">
        <span class="card__badge">${escapeHtml(produto.marketplace)}</span>
        <img src="${escapeHtml(produto.imagem)}" alt="${escapeHtml(produto.nome)}" loading="lazy" width="500" height="600">
      </div>
      <div class="card__body">
        <h3 class="card__name">${escapeHtml(produto.nome)}</h3>
        <p class="card__desc">${escapeHtml(produto.descricao)}</p>
        <div class="card__meta"><span>${escapeHtml(produto.categoriaNome || produto.categoria)}</span></div>
        <span class="card__cta">Comprar</span>
      </div>
    `;

    const open = () => window.open(produto.link, "_blank", "noopener");
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });

    return card;
  }

  /* ---------- Seção de categoria (estrutura + carrossel) ---------- */
  function buildSectionShell(cat, index) {
    const section = el("section", "section");
    section.id = cat.id;
    section.dataset.categoria = cat.id;
    if (cat.cor) section.style.setProperty("--tema-cor", cat.cor);

    const head = el("div", "section__head reveal");
    head.innerHTML = `
      <span class="section__eyebrow">${pad2(index + 1)}</span>
      <h2>${escapeHtml(cat.nome)}</h2>
      ${cat.aviso ? `<p class="notice">${escapeHtml(cat.aviso)}</p>` : (cat.subtitulo ? `<p>${escapeHtml(cat.subtitulo)}</p>` : "")}
    `;
    section.appendChild(head);

    const carousel = el("div", "carousel");
    carousel.setAttribute("data-carousel", "");
    carousel.innerHTML = `
      <div class="carousel__track" data-track></div>
      <div class="carousel__dots" data-dots></div>
      <button class="carousel__arrow carousel__arrow--prev" data-prev aria-label="Anterior">‹</button>
      <button class="carousel__arrow carousel__arrow--next" data-next aria-label="Próximo">›</button>
    `;
    section.appendChild(carousel);

    catalogoWrap.appendChild(section);

    return {
      el: section,
      id: cat.id,
      track: carousel.querySelector("[data-track]"),
      dotsWrap: carousel.querySelector("[data-dots]"),
      prevBtn: carousel.querySelector("[data-prev]"),
      nextBtn: carousel.querySelector("[data-next]"),
      carousel,
      head,
    };
  }

  function setupCarousel(section) {
    const { track, dotsWrap, prevBtn, nextBtn } = section;

    function rebuildDots() {
      dotsWrap.innerHTML = "";
      const cards = [...track.children].filter((c) => c.style.display !== "none");
      cards.forEach((_, i) => {
        const dot = el("button", i === 0 ? "is-active" : "");
        dot.setAttribute("aria-label", `Ir para item ${i + 1}`);
        dot.addEventListener("click", () => {
          cards[i].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        });
        dotsWrap.appendChild(dot);
      });
    }

    function updateActiveDot() {
      const cards = [...track.children].filter((c) => c.style.display !== "none");
      const dots = [...dotsWrap.children];
      if (!cards.length || !dots.length) return;
      const trackRect = track.getBoundingClientRect();
      const center = trackRect.left + trackRect.width / 2;
      let closest = 0, minDist = Infinity;
      cards.forEach((c, i) => {
        const r = c.getBoundingClientRect();
        const d = Math.abs((r.left + r.width / 2) - center);
        if (d < minDist) { minDist = d; closest = i; }
      });
      dots.forEach((d, i) => d.classList.toggle("is-active", i === closest));
    }

    track.addEventListener("scroll", () => {
      window.requestAnimationFrame(updateActiveDot);
    }, { passive: true });

    prevBtn.addEventListener("click", () => {
      track.scrollBy({ left: -track.clientWidth * 0.82, behavior: "smooth" });
    });
    nextBtn.addEventListener("click", () => {
      track.scrollBy({ left: track.clientWidth * 0.82, behavior: "smooth" });
    });

    section.rebuildDots = rebuildDots;
    rebuildDots();
  }

  /* ---------- Montagem completa do catálogo ---------- */
  function renderCatalogo(categorias, produtos) {
    catalogoWrap.innerHTML = "";
    sections.length = 0;

    const categoriaPorId = new Map(categorias.map((c) => [c.id, c.nome]));

    // Avisa no console sobre produtos com categoria inexistente (typo no JSON)
    produtos.forEach((p) => {
      if (!categoriaPorId.has(p.categoria)) {
        console.warn(`Produto "${p.nome}" usa a categoria "${p.categoria}", que não existe em categorias.json.`);
      }
      p.categoriaNome = categoriaPorId.get(p.categoria) || p.categoria;
    });

    categorias.forEach((cat, index) => {
      const section = buildSectionShell(cat, index);
      const produtosDaCategoria = produtos.filter((p) => p.categoria === cat.id);

      if (produtosDaCategoria.length === 0) {
        section.carousel.replaceWith(
          el("p", "section__empty", "Novos produtos em breve nesta categoria.")
        );
      } else {
        produtosDaCategoria.forEach((p) => section.track.appendChild(buildCard(p)));
        setupCarousel(section);
      }

      sections.push(section);
    });

    observeReveal();
  }

  function loadCatalog() {
    Promise.all([
      fetch(CATEGORIAS_URL).then((r) => {
        if (!r.ok) throw new Error("Não foi possível carregar as categorias.");
        return r.json();
      }),
      fetch(PRODUTOS_URL).then((r) => {
        if (!r.ok) throw new Error("Não foi possível carregar o catálogo.");
        return r.json();
      }),
    ])
      .then(([categorias, produtos]) => {
        renderNav(categorias);
        renderCatalogo(categorias, produtos);
      })
      .catch((err) => {
        console.error(err);
        const msg = el("p", "empty-state", "Não foi possível carregar o catálogo no momento.");
        msg.hidden = false;
        catalogoWrap.appendChild(msg);
      });
  }

  /* ---------- Pesquisa em tempo real ---------- */
  function setupSearch() {
    const input = document.getElementById("searchInput");

    input.addEventListener("input", () => {
      const term = input.value.trim().toLowerCase();
      let totalVisible = 0;

      sections.forEach((section) => {
        const cards = [...section.track.querySelectorAll(".card")];
        let visibleInSection = 0;
        cards.forEach((card) => {
          const match = !term || card.dataset.nome.includes(term);
          card.style.display = match ? "" : "none";
          if (match) { visibleInSection++; totalVisible++; }
        });
        section.el.style.display = term && cards.length && visibleInSection === 0 ? "none" : "";
        if (section.rebuildDots) section.rebuildDots();
      });

      emptyState.hidden = totalVisible !== 0;
    });
  }

  /* ---------- Cabeçalho: sombra ao rolar + menu mobile ---------- */
  function setupHeader() {
    const header = document.getElementById("header");
    window.addEventListener("scroll", () => {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
      toggleBackToTop();
    }, { passive: true });

    const toggle = document.getElementById("navToggle");
    const nav = document.getElementById("nav");
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      toggle.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
    nav.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        nav.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Botão voltar ao topo ---------- */
  const toTopBtn = () => document.getElementById("toTop");
  function toggleBackToTop() {
    toTopBtn().classList.toggle("is-visible", window.scrollY > 500);
  }
  function setupBackToTop() {
    toTopBtn().addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Scroll reveal ---------- */
  function observeReveal() {
    const items = document.querySelectorAll(".reveal:not(.is-visible)");
    if (!("IntersectionObserver" in window)) {
      items.forEach((i) => i.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach((i) => io.observe(i));
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("year").textContent = new Date().getFullYear();
    setupHeader();
    setupBackToTop();
    setupSearch();
    loadCatalog();
  });
})();
