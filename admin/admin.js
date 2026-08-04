(function () {
  const STORAGE_KEY = "allmen_admin_draft_v1";
  const CATEGORIES = [
    { value: "alfaiataria", label: "Alfaiataria" },
    { value: "camisaria", label: "Camisaria" },
    { value: "casual", label: "Casual Premium" },
    { value: "acessorios", label: "Acessórios" }
  ];

  let products = [];
  let editingIndex = null;
  let pendingDownload = null;

  const els = {
    form: document.getElementById("product-form"),
    formTitle: document.getElementById("form-title"),
    name: document.getElementById("f-name"),
    category: document.getElementById("f-category"),
    description: document.getElementById("f-description"),
    imagePath: document.getElementById("f-image-path"),
    imageFile: document.getElementById("f-image-file"),
    preview: document.getElementById("f-preview"),
    downloadRenamed: document.getElementById("f-download-renamed"),
    submitBtn: document.getElementById("f-submit"),
    cancelEditBtn: document.getElementById("f-cancel-edit"),
    list: document.getElementById("product-list"),
    empty: document.getElementById("product-list-empty"),
    importInput: document.getElementById("import-input"),
    exportBtn: document.getElementById("export-btn"),
    resetBtn: document.getElementById("reset-btn"),
    count: document.getElementById("product-count")
  };

  var ACCENTED = "áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ";
  var PLAIN = "aaaaaeeeeiiiiooooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN";

  function slugify(str) {
    var input = (str || "").toString();
    var out = "";
    for (var i = 0; i < input.length; i++) {
      var ch = input.charAt(i);
      var idx = ACCENTED.indexOf(ch);
      out += idx >= 0 ? PLAIN.charAt(idx) : ch;
    }
    return out
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function categoryLabel(value) {
    const found = CATEGORIES.find((c) => c.value === value);
    return found ? found.label : value;
  }

  function persist() {
    const serializable = products.map(({ id, category, name, description, image }) => ({
      id, category, name, description, image
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) products = JSON.parse(raw);
    } catch (err) {
      products = [];
    }
  }

  function render() {
    els.list.innerHTML = "";
    els.count.textContent = products.length;
    els.empty.style.display = products.length ? "none" : "block";

    products.forEach((p, index) => {
      const row = document.createElement("div");
      row.className = "product-row";
      row.innerHTML = `
        <div class="product-row-thumb">
          ${p.image ? `<img src="../${p.image}" alt="" onerror="this.style.display='none'">` : ""}
        </div>
        <div class="product-row-info">
          <span class="product-row-cat">${categoryLabel(p.category)}</span>
          <strong></strong>
          <span class="product-row-desc"></span>
        </div>
        <div class="product-row-actions">
          <button type="button" data-action="up" ${index === 0 ? "disabled" : ""} title="Mover para cima">↑</button>
          <button type="button" data-action="down" ${index === products.length - 1 ? "disabled" : ""} title="Mover para baixo">↓</button>
          <button type="button" data-action="edit">Editar</button>
          <button type="button" data-action="remove" class="danger">Remover</button>
        </div>
      `;
      row.querySelector(".product-row-info strong").textContent = p.name;
      row.querySelector(".product-row-desc").textContent = p.description || "";
      row.querySelector('[data-action="up"]').addEventListener("click", () => moveProduct(index, -1));
      row.querySelector('[data-action="down"]').addEventListener("click", () => moveProduct(index, 1));
      row.querySelector('[data-action="edit"]').addEventListener("click", () => editProduct(index));
      row.querySelector('[data-action="remove"]').addEventListener("click", () => removeProduct(index));
      els.list.appendChild(row);
    });
  }

  function moveProduct(index, dir) {
    const target = index + dir;
    if (target < 0 || target >= products.length) return;
    const tmp = products[index];
    products[index] = products[target];
    products[target] = tmp;
    persist();
    render();
  }

  function removeProduct(index) {
    if (!confirm(`Remover "${products[index].name}" do catálogo?`)) return;
    products.splice(index, 1);
    persist();
    render();
  }

  function editProduct(index) {
    const p = products[index];
    editingIndex = index;
    els.name.value = p.name;
    els.category.value = p.category;
    els.description.value = p.description || "";
    els.imagePath.value = p.image || "";
    els.preview.innerHTML = p.image ? `<img src="../${p.image}" alt="">` : "";
    els.imageFile.value = "";
    els.downloadRenamed.hidden = true;
    pendingDownload = null;
    els.formTitle.textContent = "Editar peça";
    els.submitBtn.textContent = "Salvar alterações";
    els.cancelEditBtn.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    editingIndex = null;
    els.form.reset();
    els.preview.innerHTML = "";
    els.downloadRenamed.hidden = true;
    pendingDownload = null;
    els.formTitle.textContent = "Adicionar peça";
    els.submitBtn.textContent = "Adicionar peça";
    els.cancelEditBtn.hidden = true;
  }

  els.imageFile.addEventListener("change", () => {
    const file = els.imageFile.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      els.preview.innerHTML = `<img src="${reader.result}" alt="">`;
    };
    reader.readAsDataURL(file);

    const extMatch = file.name.match(/\.[a-zA-Z0-9]+$/);
    const ext = extMatch ? extMatch[0].toLowerCase() : ".jpg";
    const base = slugify(els.name.value) || slugify(file.name.replace(/\.[^.]+$/, "")) || "peca";
    const suggested = `${base}${ext}`;
    els.imagePath.value = `assets/img/produtos/${suggested}`;

    pendingDownload = { file, suggested };
    els.downloadRenamed.hidden = false;
  });

  els.downloadRenamed.addEventListener("click", () => {
    if (!pendingDownload) return;
    const url = URL.createObjectURL(pendingDownload.file);
    const a = document.createElement("a");
    a.href = url;
    a.download = pendingDownload.suggested;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  });

  els.form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = els.name.value.trim();
    const category = els.category.value;
    const description = els.description.value.trim();
    const image = els.imagePath.value.trim();

    if (!name || !category) {
      alert("Preencha ao menos o nome e a categoria da peça.");
      return;
    }

    const id = slugify(name) || `peca-${products.length + 1}`;
    const entry = { id, category, name, description, image };

    if (editingIndex !== null) {
      products[editingIndex] = entry;
    } else {
      products.push(entry);
    }

    persist();
    render();
    resetForm();
  });

  els.cancelEditBtn.addEventListener("click", resetForm);

  els.exportBtn.addEventListener("click", () => {
    if (!products.length) {
      alert("Adicione ao menos uma peça antes de exportar.");
      return;
    }
    const body = products.map(({ id, category, name, description, image }) => ({
      id, category, name, description, image
    }));
    const json = JSON.stringify(body, null, 2);
    const content = "// Catálogo de peças da All Men.\n" +
      "// Gerado pelo painel em admin/index.html.\n" +
      `window.PRODUCTS = ${json};\n`;
    const blob = new Blob([content], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.js";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  });

  els.importInput.addEventListener("change", () => {
    const file = els.importInput.files[0];
    if (!file) return;

    if (products.length && !confirm("Importar vai substituir a lista atual do painel. Continuar?")) {
      els.importInput.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result;
        const match = text.match(/window\.PRODUCTS\s*=\s*(\[[\s\S]*\])\s*;?/);
        if (!match) throw new Error("Formato não reconhecido");
        const parsed = JSON.parse(match[1]);
        products = parsed;
        persist();
        render();
        resetForm();
        alert(`Catálogo importado: ${products.length} peça(s).`);
      } catch (err) {
        alert("Não consegui ler esse arquivo. Verifique se é um products.js válido.");
      }
    };
    reader.readAsText(file);
    els.importInput.value = "";
  });

  els.resetBtn.addEventListener("click", () => {
    if (!confirm("Isso vai apagar todas as peças do painel (rascunho local). Tem certeza?")) return;
    products = [];
    persist();
    render();
    resetForm();
  });

  loadDraft();
  render();
})();
