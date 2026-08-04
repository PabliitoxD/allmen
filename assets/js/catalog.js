// Renderiza as peças de assets/data/products.js dentro das grades de
// colecoes.html. Cada seção de categoria tem um <div class="grid" data-catalog-category="...">
// vazio no HTML; este script preenche com os cards.

window.CATALOG_CATEGORIES = {
  alfaiataria: {
    placeholderIcon: '<path d="M4 4l4-2 4 3 4-3 4 2-2 5-2-1v13H6V8L4 9z"/>'
  },
  camisaria: {
    placeholderIcon: '<path d="M5 3l4 2h6l4-2 3 5-4 2v11H6V10L2 8z"/>'
  },
  casual: {
    placeholderIcon: '<path d="M6 4h12v4l-3 2v10H9V10L6 8z"/>'
  },
  acessorios: {
    placeholderIcon: '<rect x="3" y="10" width="18" height="5" rx="1"/><rect x="9" y="9" width="4" height="7" rx="1"/>'
  }
};

const WHATSAPP_NUMBER = "5554996222619";

function buildWhatsappLink(productName) {
  const text = encodeURIComponent(`Olá! Tenho interesse em ${productName}.`);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

function categoryLabel(key) {
  const labels = {
    alfaiataria: "Alfaiataria",
    camisaria: "Camisaria",
    casual: "Casual Premium",
    acessorios: "Acessórios"
  };
  return labels[key] || key;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

function renderProductCard(product) {
  const meta = window.CATALOG_CATEGORIES[product.category] || {};
  const icon = meta.placeholderIcon || '<circle cx="12" cy="12" r="9"/>';
  const name = escapeHtml(product.name);
  const description = escapeHtml(product.description);

  const card = document.createElement("div");
  card.className = "card reveal";
  card.innerHTML = `
    <div class="card-media">
      <div class="placeholder-media">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">${icon}</svg>
        <span>Foto em breve</span>
      </div>
      ${product.image ? `<img src="${escapeHtml(product.image)}" alt="${name}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" onerror="this.remove()">` : ""}
    </div>
    <div class="card-body">
      <span class="cat">${categoryLabel(product.category)}</span>
      <h3>${name}</h3>
      <p>${description}</p>
      <a href="${buildWhatsappLink(product.name)}" class="btn btn-primary btn-block" target="_blank" rel="noopener">Consultar no WhatsApp</a>
    </div>
  `;
  return card;
}

document.addEventListener("DOMContentLoaded", () => {
  const products = window.PRODUCTS || [];
  const grids = document.querySelectorAll("[data-catalog-category]");

  grids.forEach((grid) => {
    const category = grid.getAttribute("data-catalog-category");
    const items = products.filter((p) => p.category === category);

    if (!items.length) {
      grid.innerHTML = '<p style="color:var(--color-text-faint);">Nenhuma peça cadastrada nesta categoria ainda.</p>';
      return;
    }

    items.forEach((product) => grid.appendChild(renderProductCard(product)));
  });

  // Os cards foram criados depois que main.js já rodou seu observer de reveal,
  // então cuidamos da visibilidade deles aqui também.
  const revealEls = document.querySelectorAll(".reveal:not(.is-visible)");
  if ("IntersectionObserver" in window && revealEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }
});
