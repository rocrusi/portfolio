(() => {
  "use strict";

  const PT = {
    menuAbrir: "Abrir menu", menuFechar: "Fechar menu",
    erroNome: "Digite seu nome com pelo menos 2 letras.",
    erroEmail: "Digite um e-mail válido, como nome@exemplo.com.",
    erroMensagem: "Escreva uma mensagem com pelo menos 10 caracteres.",
    erroForm: "Não foi possível enviar. Corrija os campos destacados e tente novamente.",
    enviado: "Mensagem enviada. Obrigado pelo contato!",
    projetoUm: "projeto exibido", projetoVarios: "projetos exibidos",
  };
  const t = (k) => (window.i18n ? window.i18n.t(k) : PT[k]);


  /* ============================================================
     FORMULÁRIO DE CONTATO
     Fica no topo de propósito: se qualquer outro trecho do script
     der erro, a validação continua funcionando e a página não
     recarrega.
     ============================================================ */
  const form = document.getElementById("form-contato");
  const formStatus = document.getElementById("form-status");
  const formErro = document.getElementById("form-erro");

  if (form) {
    const mostrarErroForm = (show) => {
      if (!formErro) return;
      formErro.hidden = !show;
      formErro.textContent = show ? t("erroForm") : "";
      if (show) {
        // reinicia a animação de tremida a cada novo erro
        formErro.style.animation = "none";
        void formErro.offsetWidth;
        formErro.style.animation = "";
      }
    };

    const rules = {
      nome: (v) => (v.trim().length < 2 ? t("erroNome") : ""),
      email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : t("erroEmail")),
      mensagem: (v) => (v.trim().length < 10 ? t("erroMensagem") : ""),
    };

    const validateField = (input) => {
      const message = rules[input.name](input.value);
      const alvo = document.getElementById(`erro-${input.name}`);
      if (alvo) alvo.textContent = message;
      input.setAttribute("aria-invalid", String(Boolean(message)));
      // quando todos os campos estiverem válidos, some o aviso geral
      if (!form.querySelector('[aria-invalid="true"]')) mostrarErroForm(false);
      return !message;
    };

    const inputs = Object.keys(rules).map((name) => form.elements[name]);

    inputs.forEach((input) => {
      input.addEventListener("blur", () => validateField(input));
      input.addEventListener("input", () => {
        if (input.getAttribute("aria-invalid") === "true") validateField(input);
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault(); // impede o recarregamento da página

      if (formStatus) {
        formStatus.textContent = "";
        delete formStatus.dataset.ok;
      }

      const results = inputs.map(validateField);
      const firstInvalid = inputs[results.indexOf(false)];

      if (firstInvalid) {
        mostrarErroForm(true);
        firstInvalid.focus();
        return;
      }

      mostrarErroForm(false);
      form.reset();
      inputs.forEach((i) => i.removeAttribute("aria-invalid"));
      if (formStatus) {
        formStatus.textContent = t("enviado");
        formStatus.dataset.ok = "1";
      }
    });

    // troca de idioma: atualiza as mensagens que já estão na tela
    document.addEventListener("idiomachange", () => {
      inputs.forEach((input) => {
        if (input.getAttribute("aria-invalid") === "true") validateField(input);
      });
      if (formErro && !formErro.hidden) formErro.textContent = t("erroForm");
      if (formStatus && formStatus.dataset.ok && formStatus.textContent) {
        formStatus.textContent = t("enviado");
      }
    });
  }


  /* ============================================================
     ANIMAÇÃO DE ENTRADA (reveal)
     ============================================================ */
  if ("IntersectionObserver" in window) {
    document.documentElement.classList.add("js");

    const targets = document.querySelectorAll(
      ".section > :not(.cards):not(.visually-hidden), .card, .site-footer > p"
    );

    targets.forEach((el) => {
      el.classList.add("reveal");

      if (el.classList.contains("card")) {
        const index = [...el.parentElement.children].indexOf(el);
        el.style.setProperty("--d", `${index * 120}ms`);
      }
    });

    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target); // anima só uma vez
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });

    targets.forEach((el) => revealObserver.observe(el));
  }


  /* ============================================================
     NOME DIGITANDO
     ============================================================ */
  (() => {
    const typed = document.querySelector(".hero .typed");
    const rest = document.querySelector(".hero .rest");
    const cursor = document.querySelector(".hero .cursor");
    if (!typed || !rest || !cursor) return;

    const full = typed.textContent;
    let i = 0;
    typed.textContent = "";
    rest.textContent = full;
    cursor.classList.add("digitando"); // cursor fixo enquanto digita

    const next = () => {
      i++;
      typed.textContent = full.slice(0, i);
      rest.textContent = full.slice(i);
      if (i < full.length) {
        setTimeout(next, 90 + Math.random() * 90); // ritmo levemente irregular, como digitação real
      } else {
        cursor.classList.remove("digitando");      // termina: cursor volta a piscar
      }
    };
    setTimeout(next, 700);
  })();


  /* ============================================================
     MENU
     ============================================================ */
  const navToggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("menu");

  const setMenu = (open) => {
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.querySelector(".visually-hidden").textContent = open ? t("menuFechar") : t("menuAbrir");
    menu.dataset.open = String(open);
  };
  setMenu(false);

  navToggle.addEventListener("click", () => {
    setMenu(navToggle.getAttribute("aria-expanded") !== "true");
  });
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.dataset.open === "true") { setMenu(false); navToggle.focus(); }
  });


  /* ============================================================
     LINK ATIVO NO MENU
     ============================================================ */
  const links = [...menu.querySelectorAll("a")];
  const sections = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => {
          const active = a.getAttribute("href") === `#${entry.target.id}`;
          if (active) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach((s) => observer.observe(s));
  }


  /* ============================================================
     FILTRO DE PROJETOS
     ============================================================ */
  const filterBtns = document.querySelectorAll(".filter");
  const cards = document.querySelectorAll(".card");
  const status = document.getElementById("filtro-status");

  const applyFilter = (category) => {
    let visible = 0;
    cards.forEach((card) => {
      const show = category === "all" || card.dataset.category === category;
      card.hidden = !show;
      if (show) visible++;
    });
    filterBtns.forEach((btn) => {
      const on = btn.dataset.filter === category;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", String(on));
    });
    status.textContent = `${visible} ${visible === 1 ? t("projetoUm") : t("projetoVarios")}.`;
  };

  filterBtns.forEach((btn) => btn.addEventListener("click", () => applyFilter(btn.dataset.filter)));

  document.querySelectorAll("[data-go]").forEach((a) =>
    a.addEventListener("click", () => applyFilter(a.dataset.go))
  );

  // troca de idioma: menu e filtro
  document.addEventListener("idiomachange", () => {
    setMenu(navToggle.getAttribute("aria-expanded") === "true");
    if (status.textContent) applyFilter(document.querySelector(".filter.is-active").dataset.filter);
  });


  /* ============================================================
     DIÁLOGO DAS ATIVIDADES
     ============================================================ */
  const dialog = document.getElementById("atividade-dialog");
  if (dialog && typeof dialog.showModal === "function") {
    const media = dialog.querySelector(".dialog-media");
    const dTitulo = dialog.querySelector("#atividade-titulo");
    const dData = dialog.querySelector(".dialog-data");
    const dDescricao = dialog.querySelector(".dialog-descricao");

    document.querySelectorAll(".foto-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const foto = btn.querySelector("img, .foto-vazia");
        media.replaceChildren(foto ? foto.cloneNode(true) : "");
        dTitulo.textContent = btn.dataset.titulo || "";
        dDescricao.textContent = btn.dataset.descricao || "";
        dData.textContent = btn.dataset.data || "";
        dData.hidden = !btn.dataset.data;
        if (!dialog.open) dialog.showModal();
      });
    });

    dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); }); // clicar fora fecha
  }
})();
