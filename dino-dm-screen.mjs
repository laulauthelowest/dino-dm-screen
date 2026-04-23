// =============================================================
// DINO ISLAND – DM Screen Modul
// =============================================================

// DM Screen Application
class DinoDMScreen extends Application {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "dino-dm-screen",
      title: "🦕 Dino Master Screen",
      template: "modules/dino-dm-screen/templates/dm-screen.html",
      width: 860,
      height: 900,
      resizable: true,
      minimizable: true,
    });
  }

  // Daten für das Template
  async getData() {
    return {};
  }

  // Event-Listener
  activateListeners(html) {
    super.activateListeners(html);

    // Tab-Buttons
    html.find(".dsn-tab-btn").on("click", ev => {
      const tab = ev.currentTarget.dataset.tab;
      html.find(".dsn-tab-btn").removeClass("active");
      html.find(".dsn-tab-content").removeClass("active");
      ev.currentTarget.classList.add("active");
      html.find(`#dsn-tab-${tab}`).addClass("active");
    });

    // Würfel-Buttons
    html.find(".dsn-roll-btn").on("click", ev => {
      const key = ev.currentTarget.dataset.table;
      this._rollTable(html, key);
    });

    // Mystery-Selects
    html.find(".dsn-mystery-select").on("change", ev => {
      const type = ev.currentTarget.dataset.type;
      const val  = ev.currentTarget.value;
      this._showClue(html, type, val);
    });

    // Extinction Select
    html.find("#dsn-extinction-select").on("change", ev => {
      this._showExtinction(html, ev.currentTarget.value);
    });

    // Countdown Boxen
    html.find(".dsn-box").on("click", ev => {
      ev.currentTarget.classList.toggle("checked");
      ev.currentTarget.textContent = ev.currentTarget.classList.contains("checked") ? "☑" : "☐";
      this._updateCountdownStatus(html, ev.currentTarget.closest(".dsn-countdown-section"));
    });

    // Reset-Buttons
    html.find(".dsn-reset-btn").on("click", ev => {
      const section = ev.currentTarget.closest(".dsn-countdown-section");
      section.querySelectorAll(".dsn-box").forEach(b => {
        b.classList.remove("checked");
        b.textContent = "☐";
      });
      this._updateCountdownStatus(html, section);
    });

    // Neuen Countdown hinzufügen
    html.find("#dsn-add-countdown").on("click", () => {
      this._addCountdown(html);
    });

    // Obstacle Checkboxen
    html.find(".dsn-obstacle-check").on("change", ev => {
      const input = ev.currentTarget.closest(".dsn-obstacle-row").querySelector("input[type='text']");
      if (ev.currentTarget.checked) input.classList.add("dsn-solved");
      else input.classList.remove("dsn-solved");
    });
  }

  _rollTable(html, key) {
    const arr = TABLES[key];
    if (!arr) return;
    const idx = Math.floor(Math.random() * arr.length);
    const result = arr[idx];
    // Update alle Result-Boxen mit diesem Key
    html.find(`[data-result="${key}"]`).each((_, el) => {
      el.innerHTML = `<span class="dsn-result-number">${idx + 1}</span>${result}`;
      el.classList.add("show");
    });
  }

  _showClue(html, type, val) {
    const box = html.find(`#dsn-clue-${type}`)[0];
    if (!val) { box.classList.remove("show"); return; }
    const parts = val.split("|");
    box.innerHTML = `<div class="dsn-clue-label">Antwort:</div>${parts[0]}` +
      (parts[1] ? `<br><br><div class="dsn-clue-label">Erster Hinweis:</div>${parts[1]}` : "");
    box.classList.add("show");
  }

  _showExtinction(html, key) {
    const card = html.find("#dsn-ext-card")[0];
    if (!key) { card.classList.remove("show"); return; }
    const d = EXTINCTION[key];
    card.innerHTML = `<h4>${d.title}</h4>
      <p><strong>Warnsignal:</strong> ${d.warning}</p>
      <p style="margin-top:6px"><strong>Neue Moves:</strong> ${d.moves}</p>`;
    card.classList.add("show");
  }

  _updateCountdownStatus(html, section) {
    const checked = section.querySelectorAll(".dsn-box.checked").length;
    const status  = section.querySelector(".dsn-status");
    if (checked === 0) { status.textContent = "Noch kein Kästchen abgehakt."; status.style.color = ""; }
    else if (checked === 1) { status.textContent = "⚠️ Eins abgehakt – Spannung steigt!"; status.style.color = ""; }
    else if (checked === 2) { status.textContent = "🔴 Zwei abgehakt – es wird kritisch!"; status.style.color = ""; }
    else { status.textContent = "💥 ALLE DREI – Das Schlimmste passiert jetzt!"; status.style.color = "#c0392b"; }
  }

  _addCountdown(html) {
    const list = html.find("#dsn-countdown-list")[0];
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

    // Neue Listener für die neuen Elemente
    div.querySelectorAll(".dsn-box").forEach(b => {
      b.addEventListener("click", ev => {
        ev.currentTarget.classList.toggle("checked");
        ev.currentTarget.textContent = ev.currentTarget.classList.contains("checked") ? "☑" : "☐";
        this._updateCountdownStatus(html, ev.currentTarget.closest(".dsn-countdown-section"));
      });
    });
    div.querySelector(".dsn-reset-btn").addEventListener("click", ev => {
      const section = ev.currentTarget.closest(".dsn-countdown-section");
      section.querySelectorAll(".dsn-box").forEach(b => { b.classList.remove("checked"); b.textContent = "☐"; });
      this._updateCountdownStatus(html, section);
    });
  }
}

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

// ===== Init: Makro-Button zur Szenenleiste hinzufügen =====
Hooks.once("ready", () => {
  // Globale Instanz
  game.dinoDMScreen = new DinoDMScreen();

  // Makro in die Welt eintragen falls noch nicht vorhanden
  console.log("DinoDMScreen | Modul geladen. Nutze game.dinoDMScreen.render(true) oder das Makro.");
});

// Tastenkürzel: Shift+D öffnet den DM Screen
Hooks.on("renderSceneControls", () => {
  document.addEventListener("keydown", ev => {
    if (ev.shiftKey && ev.key === "D" && game.user.isGM) {
      game.dinoDMScreen?.render(true);
    }
  }, { once: false });
});
