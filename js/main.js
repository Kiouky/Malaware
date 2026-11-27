/* =====================================================================
   MalAware · js/main.js
   ---------------------------------------------------------------------
   1. Animations du site (apparitions, bandeau, en-tête, illustration)
   2. Outils d’affichage partagés (icônes, fenêtres factices, indices…)
   3. Moteur commun des simulations interactives

   Chaque page de malware charge ce fichier, puis son propre scénario :
   js/sim-trojan.js, js/sim-keylogger.js, js/sim-ransomware.js.
   Tout se passe dans la page : rien n’est envoyé, rien n’est enregistré.
   Le style des animations est défini dans style/main.css :
   ce fichier se contente d’ajouter des classes au bon moment.
   ===================================================================== */

const REDUIT = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------------------------------------------------------------
   1. Animations du site
   --------------------------------------------------------------------- */
(() => {
  const racine = document.documentElement;
  racine.classList.add("js");

  // Apparitions au défilement : chaque élément .rv reçoit .vu quand il
  // entre à l’écran (le décalage vient de la variable CSS --i).
  const aReveler = document.querySelectorAll(".rv");
  if (REDUIT || !("IntersectionObserver" in window)) {
    aReveler.forEach((el) => el.classList.add("vu"));
  } else {
    const obs = new IntersectionObserver(
      (entrees) =>
        entrees.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add("vu");
          obs.unobserve(en.target);
        }),
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    aReveler.forEach((el) => obs.observe(el));
  }

  // Bandeau défilant : on double son contenu pour une boucle sans à-coup
  document.querySelectorAll(".tk").forEach((tk) => tk.insertAdjacentHTML("beforeend", tk.innerHTML));

  // En-tête : change d’aspect dès qu’on fait défiler la page
  const entete = document.querySelector(".site-h");
  if (entete) {
    const maj = () => entete.classList.toggle("scrolled", scrollY > 8);
    maj();
    addEventListener("scroll", maj, { passive: true });
  }

  // Illustration de l’accueil : suit légèrement la souris (variables --mx, --my)
  const art = document.querySelector(".hero-art");
  if (art && !REDUIT && matchMedia("(pointer: fine)").matches) {
    const hero = art.closest(".hero");
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      art.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      art.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    });
    hero.addEventListener("pointerleave", () => {
      art.style.setProperty("--mx", 0);
      art.style.setProperty("--my", 0);
    });
  }

  // Nom géant du pied de page : le halo blanc suit la souris (--x, --y)
  const geant = document.querySelector(".f-giant");
  if (geant && matchMedia("(pointer: fine)").matches) {
    geant.addEventListener("pointermove", (e) => {
      const r = geant.getBoundingClientRect();
      geant.style.setProperty("--x", Math.round(e.clientX - r.left) + "px");
      geant.style.setProperty("--y", Math.round(e.clientY - r.top) + "px");
    });
  }
})();

/* ---------------------------------------------------------------------
   2. Outils d’affichage partagés par les scénarios
   --------------------------------------------------------------------- */

/** Échappe un texte avant de l’afficher (indispensable pour les saisies). */
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

/** Heure actuelle, pour les journaux. */
const heure = () => new Date().toLocaleTimeString("fr-FR");

/** Liste à puces. */
const liste = (items = []) => `<ul>${items.map((x) => `<li>${x}</li>`).join("")}</ul>`;

/** Indice jaune : visible seulement quand le bouton « Indices » est activé. */
const indice = (texte) =>
  `<span class="ind" role="note"><b aria-hidden="true">!</b><span>${texte}</span></span>`;

/** Fenêtre d’application factice. */
const uiFenetre = (titre, contenu) => `
  <div class="ui">
    <div class="ui-bar"><span class="d"></span><span class="d"></span><span class="d"></span><span class="ui-titre">${titre}</span></div>
    <div class="ui-body">${contenu}</div>
  </div>`;

/** Petites icônes dessinées (24 × 24), utilisées à la place des emojis. */
const ICO = {
  cadenas: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  image: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5-5-8 8"/>',
  tableur: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M4 15h16M10 3v18"/>',
  audio: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
  archive: '<path d="M6 3h8l4 4v14H6z"/><path d="M11 3v2h2v2h-2v2h2v2h-2v2"/>',
  video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/>',
  attention: '<path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4M12 17h.01"/>',
  bouclier: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  trombone: '<path d="M20 11.5l-8 8a5 5 0 01-7-7l8.5-8.5a3.5 3.5 0 015 5L10 17.5a2 2 0 01-3-3l7.5-7.5"/>',
  wifi: '<path d="M2.5 9a14 14 0 0119 0M5.5 12.5a9.5 9.5 0 0113 0M8.8 16a5 5 0 016.4 0"/><path d="M12 19.5h.01"/>',
  cle: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="M11 12l9-9M16 7l3 3M14 9l2 2"/>',
  appli: '<path d="M12 2.5l8.5 4.8v9.4L12 21.5l-8.5-4.8V7.3z"/><path d="M3.5 7.3L12 12l8.5-4.7M12 12v9.5"/>',
  telecharger: '<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>',
};
const ico = (nom) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICO[nom]}</svg>`;

/** Fenêtre de navigateur factice, avec sa barre d’adresse. */
const uiNavigateur = (url, contenu, cadenas = true) => `
  <div class="ui">
    <div class="ui-bar"><span class="d"></span><span class="d"></span><span class="d"></span>
      <span class="ui-url">${cadenas ? `<span title="Connexion chiffrée (HTTPS)">${ico("cadenas")}</span>` : ""}${url}</span></div>
    <div class="ui-body">${contenu}</div>
  </div>`;

/**
 * Console de l’attaquant. lignes = [["clé", "valeur"], …] ;
 * une ligne peut aussi être du HTML brut (par exemple un indice).
 */
const terminal = (titre, lignes = [], attente = "") => `
  <div class="term">
    <p class="term-h">${titre}</p>
    ${lignes.map((l) => (Array.isArray(l) ? `<div class="kv"><span>${l[0]}</span><b>${l[1]}</b></div>` : l)).join("")}
    ${attente ? `<p class="wait">${attente}</p>` : ""}
  </div>`;

const ICONES = {
  ampoule:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0012 3z"/></svg>',
  rejouer:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 108-8 8.4 8.4 0 00-6 2.6L4 8.5"/><path d="M4 4v4.5h4.5"/></svg>',
  fleche: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
};

/* ---------------------------------------------------------------------
   3. Moteur de simulation
   ---------------------------------------------------------------------
   monterSimulation(nom, def) remplit l’élément [data-sim="nom"].

   def = {
     titre: "Trojan",
     etapes: ["Recherche", …, "Bilan"],       // la frise du haut
     autres: "liens HTML vers les autres simulations",
     etatInitial: () => ({ … }),            // données de la partie (remises à zéro)
     scenes: { intro: (etat, sim) => ({ … }), … }
   }

   Une scène renvoie un objet :
     etape     numéro de l’étape dans la frise (0, 1, 2…)
     ton       "info" | "alerte" | "danger" | "ok"   (couleur de l’explication)
     titre, texte, consigne                          (le bandeau d’explication)
     choix     [{ texte, go: "scène" | act: "action", style }]
     ecran     HTML de « Votre écran »               (gauche)
     espion    HTML de « Côté attaquant »            (droite)
     stMoi, stEux  [texte, classe]  pastilles d’état des deux écrans
     flux      "" | "on" | "on rev" | "cut"          (données qui circulent)
     journal   [[texte, classe], …]                  (journal technique)
     actions   { nom: (sim, bouton) => … }           (boutons data-act="nom")
     entree    (sim) => …                             (minuteurs, écouteurs…)
     bilan     { stats, passe, indices, proteger, reagir }  (écran de fin)

   Dans le HTML d’une scène :
     data-go="scène"    → change de scène au clic
     data-act="action"  → appelle actions.action(sim, bouton)
     data-champ="nom"   → enregistre la valeur du champ dans etat.nom
   --------------------------------------------------------------------- */
function monterSimulation(nom, def) {
  const racine = document.querySelector(`[data-sim="${nom}"]`);
  if (!racine) return null;

  racine.innerHTML = `
    <div class="sim-top">
      <b class="mono">Simulation · ${def.titre}</b>
      <div class="tools">
        <button class="tool" type="button" data-outil="indices" aria-pressed="false">${ICONES.ampoule}Indices</button>
        <button class="tool" type="button" data-outil="recommencer">${ICONES.rejouer}Recommencer</button>
      </div>
    </div>
    <ol class="track" aria-label="Étapes de l’attaque"></ol>
    <div class="narr" tabindex="-1" aria-live="polite"></div>
    <div class="split" data-zone="split">
      <section class="pane moi" aria-label="Votre écran">
        <div class="pane-h"><span><i></i>Votre écran</span><span class="pane-st" data-zone="st-moi"></span></div>
        <div class="pane-b" data-zone="ecran"></div>
      </section>
      <div class="flux" aria-hidden="true"><i></i><i></i><i></i></div>
      <section class="pane eux" aria-label="Côté attaquant">
        <div class="pane-h"><span><i></i>Côté attaquant</span><span class="pane-st" data-zone="st-eux"></span></div>
        <div class="pane-b" data-zone="espion"></div>
      </section>
    </div>
    <div class="bilan" data-zone="bilan" hidden></div>
    <details class="journal">
      <summary>Journal technique <small>· pour les curieux</small> <span class="jn">0</span></summary>
      <div class="log" role="log" data-zone="log"></div>
    </details>`;

  const $ = (sel) => racine.querySelector(sel);
  const zone = (n) => $(`[data-zone="${n}"]`);
  const narr = $(".narr");
  let minuteurs = [];
  let actions = {};
  let nbJournal = 0;

  const sim = { etat: {}, vus: new Set(), indices: false, racine, zone };

  /* --- Minuteurs : tous arrêtés automatiquement au changement de scène --- */
  sim.apres = (ms, fn) => {
    const id = setTimeout(fn, ms);
    minuteurs.push(id);
    return id;
  };
  sim.chaque = (ms, fn) => {
    const id = setInterval(fn, ms);
    minuteurs.push(id);
    return id;
  };
  sim.stop = (id) => clearInterval(id);
  const arreterMinuteurs = () => {
    minuteurs.forEach((id) => {
      clearTimeout(id);
      clearInterval(id);
    });
    minuteurs = [];
  };

  /* --- Petites mises à jour de l’affichage --- */
  sim.journal = (texte, classe = "") => {
    const log = zone("log");
    log.insertAdjacentHTML("beforeend", `<div class="${classe}"><span class="t">${heure()}</span> ${texte}</div>`);
    log.scrollTop = log.scrollHeight;
    $(".jn").textContent = ++nbJournal;
  };

  sim.statut = (qui, texte = "", classe = "") => {
    const z = zone(qui === "eux" ? "st-eux" : "st-moi");
    z.textContent = texte;
    z.className = "pane-st " + classe;
    z.hidden = !texte;
  };

  sim.flux = (mode = "") => {
    $(".flux").className = "flux " + mode;
  };

  sim.maj = (nomZone, html) => {
    zone(nomZone).innerHTML = html;
    majIndices();
  };

  const bouton = (c) =>
    `<button class="btn ${c.style ?? "s"}" type="button"${c.go ? ` data-go="${c.go}"` : ""}${c.act ? ` data-act="${c.act}"` : ""}${c.off ? " disabled" : ""}>${c.texte}</button>`;

  sim.choix = (liste = []) => {
    const z = narr.querySelector(".choix");
    z.innerHTML = liste.map(bouton).join("");
    z.hidden = !liste.length;
  };

  /* --- Mode « Indices » --- */
  const majIndices = () => {
    racine.classList.toggle("voir-ind", sim.indices);
    $('[data-outil="indices"]').setAttribute("aria-pressed", sim.indices);
    const p = narr.querySelector(".ind-n");
    if (!p) return;
    const n = racine.querySelectorAll('[data-zone="split"]:not([hidden]) .ind').length;
    const s = n > 1 ? "s" : "";
    p.hidden = !n;
    p.innerHTML = sim.indices
      ? `${n} indice${s} signalé${s} en jaune sur les écrans.`
      : `${n} indice${s} suspect${s} à repérer ici. Activez <b>Indices</b> pour ${n > 1 ? "les" : "le"} voir.`;
  };
  sim.majIndices = majIndices;

  /* --- Dessin de la frise, de l’explication et du bilan --- */
  let etapeAvant = -1; // pour animer seulement les étapes qui viennent d’être franchies

  const dessinerEtapes = (sc) => {
    const fin = !!sc.bilan;
    $(".track").innerHTML = def.etapes
      .map((label, k) => {
        let c = "",
          n = k + 1,
          etat = "à venir";
        if (k === sc.etape) {
          c = fin ? "fin " + sc.ton : "now";
          etat = fin ? "terminé" : "en cours";
          if (fin) n = sc.ton === "ok" ? "✓" : "!";
        } else if (k < sc.etape && sim.vus.has(k)) {
          c = k >= etapeAvant ? "done new" : "done";
          n = "✓";
          etat = "passée";
        } else if (k < sc.etape) {
          c = "skip";
          n = "–";
          etat = "évitée";
        }
        return `<li class="${c}"><span class="n" aria-hidden="true">${n}</span><span class="l">${label}<span class="sr"> (${etat})</span></span></li>`;
      })
      .join("");
    etapeAvant = sc.etape;
  };

  // Relance l’animation d’entrée d’un bloc (style : .swap dans main.css)
  const rejouer = (el) => {
    el.classList.remove("swap");
    void el.offsetWidth;
    el.classList.add("swap");
  };

  const dessinerNarration = (sc) => {
    const k = sc.bilan
      ? "Bilan de la simulation"
      : `Étape ${sc.etape + 1} sur ${def.etapes.length} · ${def.etapes[sc.etape]}`;
    narr.className = "narr " + (sc.ton || "info");
    narr.innerHTML = `
      <p class="narr-k">${k}</p>
      <h3>${sc.titre}</h3>
      ${sc.texte ? `<div class="narr-t">${sc.texte}</div>` : ""}
      ${sc.consigne ? `<p class="consigne">${ICONES.fleche}<span>${sc.consigne}</span></p>` : ""}
      <p class="ind-n" hidden></p>
      <div class="choix" hidden></div>`;
    sim.choix(sc.choix);
  };

  const dessinerBilan = (b) => `
    ${b.stats ? `<div class="bl-stats">${b.stats.map(([l, v, c = ""]) => `<div class="${c}"><small>${l}</small><b>${v}</b></div>`).join("")}</div>` : ""}
    <div class="bl-grid">
      <div class="bl-card"><h4>Ce qui s’est passé</h4>${liste(b.passe)}</div>
      <div class="bl-card am"><h4>${b.titreIndices || "Les indices qui devaient alerter"}</h4>${liste(b.indices)}</div>
      <div class="bl-card ok"><h4>Comment se protéger</h4>${liste(b.proteger)}</div>
      <div class="bl-card rd"><h4>Si cela vous arrive</h4>${liste(b.reagir)}</div>
    </div>
    <div class="bl-act">
      <button class="btn" type="button" data-outil="recommencer">Rejouer en faisant d’autres choix</button>
      <a class="btn s" href="#info">Lire la fiche complète</a>
    </div>
    ${def.autres ? `<p class="bl-autres">Essayer une autre simulation : ${def.autres}</p>` : ""}`;

  /* --- Changer de scène --- */
  sim.aller = (id, { focus = true, scroll = true } = {}) => {
    arreterMinuteurs();
    const sc = def.scenes[id](sim.etat, sim);
    sim.scene = id;
    actions = sc.actions || {};
    sim.vus.add(sc.etape);

    dessinerEtapes(sc);
    dessinerNarration(sc);

    const split = zone("split"),
      bilan = zone("bilan");
    if (sc.bilan) {
      split.hidden = true;
      bilan.hidden = false;
      bilan.innerHTML = dessinerBilan(sc.bilan);
    } else {
      split.hidden = false;
      bilan.hidden = true;
      if (sc.ecran !== undefined) {
        zone("ecran").innerHTML = sc.ecran;
        if (focus) rejouer(zone("ecran"));
      }
      if (sc.espion !== undefined) {
        zone("espion").innerHTML = sc.espion;
        if (focus) rejouer(zone("espion"));
      }
      if (sc.stMoi) sim.statut("moi", ...sc.stMoi);
      if (sc.stEux) sim.statut("eux", ...sc.stEux);
      sim.flux(sc.flux || "");
    }
    if (focus) rejouer(narr);
    (sc.journal || []).forEach(([t, c]) => sim.journal(t, c));
    majIndices();
    if (sc.entree) sc.entree(sim);

    // Accessibilité : on place le focus sur l’explication de la nouvelle étape
    if (focus) narr.focus({ preventScroll: true });
    if (scroll) {
      const r = narr.getBoundingClientRect();
      if (r.top < 80 || r.top > innerHeight * 0.55)
        scrollBy({ top: r.top - 90, behavior: REDUIT ? "auto" : "smooth" });
    }
  };

  const recommencer = (focus) => {
    arreterMinuteurs();
    sim.etat = def.etatInitial ? def.etatInitial() : {};
    sim.vus = new Set();
    etapeAvant = -1;
    zone("log").innerHTML = "";
    nbJournal = 0;
    $(".jn").textContent = "0";
    sim.aller(def.debut || "intro", { focus, scroll: focus });
  };

  /* --- Un seul écouteur pour tous les boutons de la simulation --- */
  racine.addEventListener("click", (e) => {
    const b = e.target.closest("[data-go], [data-act], [data-outil]");
    if (!b || b.disabled) return;
    if (b.dataset.outil === "indices") {
      sim.indices = !sim.indices;
      majIndices();
      return;
    }
    if (b.dataset.outil === "recommencer") {
      recommencer(true);
      return;
    }
    if (b.dataset.act && actions[b.dataset.act]) actions[b.dataset.act](sim, b);
    if (b.dataset.go) sim.aller(b.dataset.go);
  });

  racine.addEventListener("change", (e) => {
    const c = e.target.closest("[data-champ]");
    if (c) sim.etat[c.dataset.champ] = c.type === "checkbox" ? c.checked : c.value;
  });

  recommencer(false);
  return sim;
}
