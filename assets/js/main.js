// ALL MEN — comportamento compartilhado do site

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const body = document.body;

  // Header muda de aparência ao rolar a página
  if (header) {
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Menu mobile
  if (navToggle) {
    navToggle.addEventListener("click", () => {
      body.classList.toggle("nav-open");
    });

    document.querySelectorAll(".main-nav a").forEach((link) => {
      link.addEventListener("click", () => body.classList.remove("nav-open"));
    });
  }

  // Revela elementos suavemente conforme entram na tela
  const revealEls = document.querySelectorAll(".reveal");
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

  // Botão "voltar ao topo"
  const backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    const toggleBackToTop = () => {
      backToTop.classList.toggle("is-visible", window.scrollY > 600);
    };
    toggleBackToTop();
    window.addEventListener("scroll", toggleBackToTop, { passive: true });
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Leve parallax no fundo do hero (o zoom Ken Burns fica na <img>, então o
  // parallax é aplicado no container .hero-media para não competir pela
  // mesma propriedade transform). Ignorado se o usuário prefere menos animação.
  const heroMedia = document.querySelector(".hero-media");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (heroMedia && !prefersReducedMotion) {
    const onHeroScroll = () => {
      if (window.scrollY > window.innerHeight) return;
      heroMedia.style.transform = `translateY(${window.scrollY * 0.08}px)`;
    };
    onHeroScroll();
    window.addEventListener("scroll", onHeroScroll, { passive: true });
  }
});
