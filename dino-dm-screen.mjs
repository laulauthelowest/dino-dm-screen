// =============================================================
// DINO ISLAND – DM Screen Modul (ApplicationV2 für V14)
// =============================================================

let DinoDMScreen;

Hooks.once("init", () => {
  const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

  DinoDMScreen = class DinoDMScreen extends HandlebarsApplicationMixin(ApplicationV2) {

  static DEFAULT_OPTIONS = {
    id: "dino-dm-screen",
    window: {
      title: "🦕 Dino Master Screen",
      resizable: true,
      minimizable: true,
    },
    position: { width: 860, height: 900 },
  };

  static PARTS = {
    main: { template: "modules/dino-dm-screen/templates/dm-screen.html" },
  };

  async _prepareContext(options) {
    return {};
  }

  _onRender(context, options) {
    super._onRender(context, options);
    const el = this.element;

    // Tabs
    el.querySelectorAll(".dsn-tab-btn").forEach(btn => {
      btn.addEventListener("click", ev => {
        const tab = ev.currentTarget.dataset.tab;
        el.querySelectorAll(".dsn-tab-btn").forEach(b => b.classList.remove("active"));
        el.querySelectorAll(".dsn-tab-content").forEach(c => c.classList.remove("active"));
        ev.currentTarget.classList.add("active");
        el.querySelector(`#dsn-tab-${tab}`)?.classList.add("active");
      });
    });

    // Würfel-Buttons
    el.querySelectorAll(".dsn-roll-btn").forEach(btn => {
      btn.addEventListener("click", ev => {
        this._rollTable(el, ev.currentTarget.dataset.table);
      });
    });

    // Mystery-Selects
    el.querySelectorAll(".dsn-mystery-select").forEach(sel => {
      sel.addEventListener("change", ev => {
        this._showClue(el, ev.currentTarget.dataset.type, ev.currentTarget.value);
      });
    });

    // Extinction Select
    el.querySelector("#dsn-extinction-select")?.addEventListener("change", ev => {
      this._showExtinction(el, ev.currentTarget.value);
    });

    // Countdown Boxen
    el.querySelectorAll(".dsn-box").forEach(box => {
      box.addEventListener("click", ev => {
        ev.currentTarget.classList.toggle("checked");
        ev.currentTarget.textContent = ev.currentTarget.classList.contains("checked") ? "☑" : "☐";
        this._updateCountdownStatus(ev.currentTarget.closest(".dsn-countdown-section"));
      });
    });

    // Reset-Buttons
    el.querySelectorAll(".dsn-reset-btn").forEach(btn => {
      btn.addEventListener("click", ev => {
        const section = ev.currentTarget.closest(".dsn-countdown-section");
        section.querySelectorAll(".dsn-box").forEach(b => { b.classList.remove("checked"); b.textContent = "☐"; });
        this._updateCountdownStatus(section);
      });
    });

    // Neuen Countdown hinzufügen
    el.querySelector("#dsn-add-countdown")?.addEventListener("click", () => {
      this._addCountdown(el);
    });

    // Obstacle Checkboxen
    el.querySelectorAll(".dsn-obstacle-check").forEach(cb => {
      cb.addEventListener("change", ev => {
        const input = ev.currentTarget.closest(".dsn-obstacle-row").querySelector("input[type='text']");
        if (ev.currentTarget.checked) input.classList.add("dsn-solved");
        else input.classList.remove("dsn-solved");
      });
    });
  }

  _rollTable(el, key) {
    const arr = TABLES[key];
    if (!arr) return;
    const idx = Math.floor(Math.random() * arr.length);
    el.querySelectorAll(`[data-result="${key}"]`).forEach(box => {
      box.innerHTML = `<span class="dsn-result-number">${idx + 1}</span>${arr[idx]}`;
      box.classList.add("show");
    });
  }

  _showClue(el, type, val) {
    const box = el.querySelector(`#dsn-clue-${type}`);
    if (!box) return;
    if (!val) { box.classList.remove("show"); return; }
    const parts = val.split("|");
    box.innerHTML = `<div class="dsn-clue-label">Antwort:</div>${parts[0]}` +
      (parts[1] ? `<br><br><div class="dsn-clue-label">Erster Hinweis:</div>${parts[1]}` : "");
    box.classList.add("show");
  }

  _showExtinction(el, key) {
    const card = el.querySelector("#dsn-ext-card");
    if (!card) return;
    if (!key) { card.classList.remove("show"); return; }
    const d = EXTINCTION[key];
    card.innerHTML = `<h4>${d.title}</h4>
      <p><strong>Warnsignal:</strong> ${d.warning}</p>
      <p style="margin-top:6px"><strong>Neue Moves:</strong> ${d.moves}</p>`;
    card.classList.add("show");
  }

  _updateCountdownStatus(section) {
    const checked = section.querySelectorAll(".dsn-box.checked").length;
    const status  = section.querySelector(".dsn-status");
    if (!status) return;
    if (checked === 0) { status.textContent = "Noch kein Kästchen abgehakt."; status.style.color = ""; }
    else if (checked === 1) { status.textContent = "⚠️ Eins abgehakt – Spannung steigt!"; status.style.color = ""; }
    else if (checked === 2) { status.textContent = "🔴 Zwei abgehakt – es wird kritisch!"; status.style.color = ""; }
    else { status.textContent = "💥 ALLE DREI – Das Schlimmste passiert jetzt!"; status.style.color = "#c0392b"; }
  }

  _addCountdown(el) {
    const list = el.querySelector("#dsn-countdown-list");
    const div  = document.createElement("div");
    div.className = "dsn-countdown-section";
    div.innerHTML = `
      <div class="dsn-countdown-title">
        <input type="text" placeholder="Name des Countdowns" />
        <button class="dsn-reset-btn">↺</button>
      </div>
      <div class="dsn-boxes">
        <div class="dsn-box">☐</div>
        <div class="dsn-box">☐</div>
        <div class="dsn-box">☐</div>
      </div>
      <div class="dsn-status">Noch kein Kästchen abgehakt.</div>`;
    list.appendChild(div);

    div.querySelectorAll(".dsn-box").forEach(b => {
      b.addEventListener("click", ev => {
        ev.currentTarget.classList.toggle("checked");
        ev.currentTarget.textContent = ev.currentTarget.classList.contains("checked") ? "☑" : "☐";
        this._updateCountdownStatus(ev.currentTarget.closest(".dsn-countdown-section"));
      });
    });
    div.querySelector(".dsn-reset-btn").addEventListener("click", ev => {
      const section = ev.currentTarget.closest(".dsn-countdown-section");
      section.querySelectorAll(".dsn-box").forEach(b => { b.classList.remove("checked"); b.textContent = "☐"; });
      this._updateCountdownStatus(section);
    });
  }
  };
});

// ===== Tabellen-Daten =====
const TABLES = {
  rumor: [
    "Meeresströmungen machen es fast unmöglich, die Insel per Boot zu erreichen.",
    "Jemand erschafft auf der Insel neue Pflanzen- und Tierarten.",
    "Kein Mensch hat die Insel vor letztem Jahr betreten.",
    "Die chinesische Regierung hat ihre Hand im Spiel.",
    "Es gibt Einheimische, die Dinosaurier als Götter verehren.",
    "Manchmal gibt es seltsame lila Sturmwolken über der Insel.",
    "Ein betrunkener Freund erzählte was er auf der Insel gesehen hat – er starb kurz danach.",
    "Du hast ein Familienmitglied das auf diese Insel gegangen ist und nie zurückkam.",
    "Leute machen Zwei-Jahres-Touren und selbst die Hausmeister werden siebenstellig bezahlt.",
    "Kompasse funktionieren nicht ganz richtig.",
    "Es gibt Spinnen so groß wie eine Kokosnuss.",
    "Das Naturkundemuseum hat eine neue Ausstellung die so geheim ist, dass die meisten Kuratoren nicht mal wissen was drin ist."
  ],
  weather: ["Paradiesisch", "Heiß & schwül", "Neblig", "Schauer", "Sintflutartiger Regen", "Gewitterstürme"],
  npcgoal: [
    "Zu einem Liebsten an einem anderen Ort der Insel gelangen",
    "Bleiben bis alles vorüber ist",
    "Dinosaurier um jeden Preis vermeiden",
    "Rache an der Person die sie für das Chaos verantwortlich machen",
    "Bezahlt werden – in bar",
    "Niemand kann die Insel verlassen",
    "Backups aller Daten wiederherstellen",
    "Die Forschung abschließen",
    "Alles wieder in Gang bringen",
    "Ein persönliches Geheimnis um jeden Preis schützen"
  ],
  npcoffer: [
    "Zugang zu einem Bereich (Keycards, Passwörter…)",
    "Führung zu einem Ort oder einer Person",
    "Eine Waffe und/oder die Fähigkeit sie zu benutzen",
    "Wissen über einen Dinosaurier",
    "Wissen über einen Vorrat (Waffen, Treibstoff, Artefakte…)",
    "Fähigkeit mit einem Fahrzeug",
    "Fähigkeit mit einem technischen System",
    "Medizinische Versorgung"
  ],
  dinoname: ["MMDs (Menschengemachte Dinosaurier)", "APAs (Künstliche Prähistorische Tiere)", "Crichtons", "Paleys", "Waybacks", "FIDOs"],
  org: ["Das Hallet Institut", "恐龙 (Kǒnglóng)", "Mantell Industries", "Hilltop", "SynGen", "D.R.I (Dinosaurier-Forschungsinstitut)"],
  gimmick: [
    "Sehschärfe – Kann nur Bewegung wahrnehmen",
    "Giftsäcke – Hat einen giftigen Biss oder spuckt tödliche Toxine",
    "Gifthaut – Haut ist toxisch (Schmerz, Lähmung, Blindheit oder Halluzinationen)",
    "Tarnung – Kann Farbe wechseln um sich einzufügen",
    "Intelligent – Fähig zu komplexer Problemlösung",
    "Rudeljäger – Arbeitet zusammen um Beute zu jagen",
    "Arboreal – Lebt in Bäumen",
    "Territorial – Markiert und verteidigt spezifische Grenzen",
    "Kannibalisch – Frisst die eigene Art",
    "Mimikry – Kann Geräusche imitieren (Dinos, Menschen, Maschinen)",
    "Elektrisch – Speichert und entlädt mächtige elektrische Entladungen",
    "Regeneration – Kann verlorene Gliedmaßen schnell heilen",
    "Sonar – Jagt mit Echos von Geräuschen",
    "Klettern – Geschickt im Klettern, klebt vielleicht an Oberflächen",
    "Catnip – Obsessiv von einer modernen Substanz angezogen",
    "Fallenbauer – Baut eine natürliche Falle (Netz, Grube…)",
    "Schallschrei – Macht ein Geräusch das verletzen oder desorientieren kann",
    "Fruchtbar – Vermehrt sich schnell",
    "Gefahrenzeichen – Signalisiert wenn es nahe ist (Rassel, Heulen, leuchtende Farben)",
    "Greifwerkzeug – Benutzt Schwanz oder Rüssel um Dinge zu halten"
  ],
  location: [
    "Die Brutanlage", "Die Triceratops-Gehege", "Hastig verlassene Schlafsäle",
    "Eine Einschienenbahn hoch über dem Dschungel", "Ein trümmerdurchsetzter Strand", "Eine Höhle – ihr wartet den Regen ab"
  ],
  escape: [
    "Rettung über die Radiostation rufen", "Das versteckte Propellerflugzeug eines Schmugglers",
    "Der Hubschrauber mit dem ihr gekommen seid", "Ein militärisches U-Boot",
    "Ein Segelboot vor der Küste", "Ein Kreuzfahrtschiff das einmal pro Woche vorbeifährt"
  ],
  obstacle: [
    "Die einzige Route führt durch die Deinonychus-Gehege",
    "Die Einschienenbahn ist der einzige Weg – und sie ist offline",
    "Wir müssen diesen verdammten Sturm abwarten",
    "Wir können nicht gehen ohne unsere Mission abzuschließen",
    "Wir müssen in den Komplex, aber er ist abgeriegelt",
    "Unser Fluchtweg ist beschädigt oder noch nicht angekommen"
  ],
  mysteryq: [
    "Warum habt ihr den Kontakt mit der Außenwelt verloren?",
    "Wer hat eure Mission sabotiert? (und warum?)",
    "Warum ist euer Kontakt nicht erschienen, und wo sind sie?",
    "Was ist die Quelle des seltsamen Signals das eure Kommunikation stört?",
    "Warum funktionieren eure Kompasse nicht... und wo ist Norden?",
    "Wer sind die schattenhaften Figuren die euch aus dem Gebüsch beobachten?"
  ]
};

const EXTINCTION = {
  volcano: {
    title: "🌋 Der Vulkan bricht aus!",
    warning: "Der Boden bebt",
    moves: "Vulkan bricht aus • Aschewolke • Felsen fallen • Lavafluss versperrt den Weg • Stampede fliehender Pflanzenfresser"
  },
  monsoon: {
    title: "🌧️ Ein Monsun!",
    warning: "Dunkle Wolken am Horizont • Donner und Blitze",
    moves: "Regenguss beginnt • Blitz trifft etwas Wichtiges • Boden glitschig • Überschwemmung • Flugzeuge am Boden • Generatoren versagen • Der Xenosaurus ist frei"
  },
  evolved: {
    title: "🧬 Die Dinosaurier haben sich entwickelt!",
    warning: "Seltsame Fußabdrücke • Unbekannter Dino-Ruf",
    moves: "Dino zeigt unmögliche neue Eigenschaft (Gimmick würfeln!) • Dino zeigt menschliche Intelligenz • Dino ist unmöglich groß • Die alten Tricks funktionieren nicht • Sie treffen den Xenosaurus"
  },
  killteam: {
    title: "💀 Kill-Team geschickt!",
    warning: "Präzise niedergeschossene Leichen • Unbekannte Stimmen auf dem Walkie • Maschinengewehrfeuer",
    moves: "Kugel pfeift vorbei • NPC stirbt • Granate landet • Kill-Team erscheint • Kill-Team setzt Atombombe ein"
  },
  mainland: {
    title: "🚢 Dinos erreichen das Festland!",
    warning: "Fluchtweg für Dinos enthüllt • Söldner mit Fangausrüstung",
    moves: "Massenvernichtungswaffe enthüllen • Erste Lieferung steht bevor • Dinos mögen Boote/Flugzeuge nicht"
  },
  timerift: {
    title: "⚡ Zeit-Anomalie kollabiert!",
    warning: "Lila Wolken • Jemand bekommt Nasenbluten",
    moves: "Heroes in andere Ära transportiert • Portal saugt alles ein • Bizarres Wesen aus der Vergangenheit • Zeit bewegt sich rückwärts"
  }
};

// ===== Init =====
Hooks.once("ready", () => {
  game.dinoDMScreen = new DinoDMScreen();
  console.log("DinoDMScreen | Modul geladen. Shift+D öffnet den DM Screen.");
});

Hooks.on("renderSceneControls", () => {
  document.addEventListener("keydown", ev => {
    if (ev.shiftKey && ev.key === "D" && game.user.isGM) {
      game.dinoDMScreen?.render(true);
    }
  }, { once: false });
});
