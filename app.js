(() => {
  const form = document.getElementById("lookup-form");
  const input = document.getElementById("reference");
  const statusEl = document.getElementById("status");
  const studyEl = document.getElementById("study");
  const siteHeader = document.getElementById("site-header");
  const backTop = document.getElementById("back-top");
  const analyses = window.BIBLE_ANALYSES || {};

  const PD_VERSIONS = [
    { id: "kjv", label: "KJV" },
    { id: "web", label: "WEB" },
    { id: "asv", label: "ASV" }
  ];

  const LICENSED = ["NIV", "ESV", "NLT"];

  function normalizeRef(value) {
    return value.trim().replace(/\s+/g, " ").toLowerCase();
  }

  function encodeRef(value) {
    return encodeURIComponent(value.trim().replace(/\s+/g, "+"));
  }

  function gatewayUrl(reference, version) {
    const q = encodeURIComponent(reference.trim());
    return `https://www.biblegateway.com/passage/?search=${q}&version=${version}`;
  }

  function setStatus(message, show = true) {
    statusEl.hidden = !show;
    statusEl.textContent = message || "";
  }

  function escapeHtml(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function paragraphs(lines) {
    return (lines || []).map((line) => `<p>${escapeHtml(line)}</p>`).join("");
  }

  async function fetchVersion(reference, versionId) {
    const url = `https://bible-api.com/${encodeRef(reference)}?translation=${versionId}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Could not load ${versionId.toUpperCase()}`);
    }
    const data = await response.json();
    const verses = Array.isArray(data.verses)
      ? data.verses.map((verse) => ({
          chapter: verse.chapter,
          verse: verse.verse,
          text: (verse.text || "").replace(/\s+/g, " ").trim()
        }))
      : [];
    const text =
      verses.length > 0
        ? verses.map((verse) => verse.text).join(" ")
        : (data.text || "").replace(/\s+/g, " ").trim();
    return {
      label: versionId.toUpperCase(),
      text,
      verses,
      formalRef: data.reference || reference
    };
  }

  function genericGuide(reference, primaryText) {
    return {
      reference,
      language: "Original language varies by testament",
      primaryText,
      sense: [
        `Start with a slow reading of ${reference}: who is speaking, to whom, and what claim or command stands at the center?`,
        "Write one sentence in your own words that captures the plain sense before you chase word studies. That sentence becomes your baseline."
      ],
      original: {
        text: "Open an interlinear or reverse-interlinear for this reference.",
        transliteration: "",
        notes: [
          "Identify whether the passage is Hebrew (most of the Old Testament), Aramaic (a few OT sections), or Greek (New Testament).",
          "Note the main verb: tense/aspect, voice, and mood often carry the theological weight English readers miss.",
          "Watch articles, prepositions, and word order—small grammar choices frequently decide whether a phrase means relation, identity, purpose, or result."
        ],
        chips: ["Interlinear", "Grammar first", "Context next"]
      },
      words: [
        {
          lemma: "Key nouns",
          gloss: "people, places, titles",
          note: "List titles for God, covenant terms, and repeated nouns. Ask what each term means in this book, not only in a glossary."
        },
        {
          lemma: "Key verbs",
          gloss: "action / state",
          note: "Mark the controlling verb(s). Is the stress on a completed act, an ongoing state, a command, or a purpose?"
        },
        {
          lemma: "Connectors",
          gloss: "for / therefore / but / that",
          note: "Conjunctions reveal logic: cause, contrast, result. Many “deep” meanings are simply careful attention to connectors."
        }
      ],
      versionNotes: {
        compare:
          "Read KJV (formal tradition), then NIV/ESV (essentially literal to mediating), then NLT (more dynamic). Ask: where do they diverge—vocabulary, sentence structure, or interpretive smoothing?"
      },
      expressions: [
        {
          title: "Repeated phrases",
          body: "If a phrase echoes earlier in the book or in Scripture, the echo is part of the meaning—not ornament."
        },
        {
          title: "Images and idioms",
          body: "Metaphors (shepherd, vine, rock, path) invite you to ask what mapping the author intends, and what limits the image has."
        },
        {
          title: "Emphatic lines",
          body: "Short clauses, sudden questions, or stacked “and” statements often mark the emotional or theological peak of the verse."
        }
      ],
      historical: [
        "Place the passage on a timeline: kingdom period, exile, return, or New Testament church age? Dating shapes what “urgent” meant.",
        "Ask what political pressures, wars, or covenant crises surround the book. History is often the silent second speaker."
      ],
      author: [
        "Identify the human voice Scripture names (or the tradition attached to the book). What is this writer’s burden—law, wisdom, prophecy, gospel, or letter?",
        "Notice tone: narrative report, poetic prayer, courtroom charge, pastoral comfort. Authorial aim controls how words should land."
      ],
      audience: [
        "Who first needed this word—Israel assembled, a suffering remnant, a local church, or disciples under pressure?",
        "Name their likely questions or fears. A text comforts, warns, or commissions someone in particular before it speaks to everyone."
      ],
      culture: [
        "List everyday institutions in the passage: family, flock, temple, court, patronage, purity, meals, honor/shame.",
        "Translate images into their ancient sense before modernizing them. Shepherd, covenant, and exile language carried thick social meaning."
      ],
      surrounding: {
        overview:
          "Read at least a paragraph before and after. Meaning often hangs on the turn of the argument or the next scene.",
        before: [
          {
            ref: "Immediate context before",
            note: "What claim, story beat, or question sets up this passage? Isolate the hinge sentence that makes this line necessary."
          }
        ],
        after: [
          {
            ref: "Immediate context after",
            note: "What follows—explanation, command, story consequence, or contrasting voice? Let the next lines police over-reading."
          }
        ]
      },
      application: [
        "Ask what obedience, trust, repentance, or comfort this passage calls for in ordinary life this week.",
        "Name one relationship, habit, fear, or hope where the text should reshape your response—and take one concrete step."
      ],
      questions: [
        {
          prompt: "In your own words, what is this passage mainly saying?",
          answer:
            "A strong answer restates the plain sense without importing later theology too early: speaker, audience, and central claim or action."
        },
        {
          prompt: "What does the historical or cultural setting add that a quick modern reading might miss?",
          answer:
            "Look for institutions, images, and pressures (temple, exile, patronage, purity, empire) that thicken the words beyond a generic moral."
        },
        {
          prompt: "Where does this press on your life now—and what is one faithful response?",
          answer:
            "Application should grow from the text’s own aim (comfort, warning, worship, mission), not from a slogan detached from context."
        }
      ],
      isGeneric: true
    };
  }

  function renderSense(analysis) {
    document.getElementById("sense-content").innerHTML = paragraphs(analysis.sense);
  }

  function renderWords(analysis) {
    document.getElementById("words-content").innerHTML = analysis.words
      .map(
        (word) => `
        <article class="word-card">
          <p class="lemma">${escapeHtml(word.lemma)}</p>
          <p class="gloss">${escapeHtml(word.gloss)}</p>
          <p>${escapeHtml(word.note)}</p>
        </article>`
      )
      .join("");
  }

  function formatVersionText(row) {
    if (Array.isArray(row.verses) && row.verses.length) {
      return `<div class="version-text">${row.verses
        .map(
          (verse) => `
          <p class="verse-line">
            <sup class="verse-num">${escapeHtml(String(verse.verse))}</sup>
            <span>${escapeHtml(verse.text)}</span>
          </p>`
        )
        .join("")}</div>`;
    }

    return `<p class="version-text">${escapeHtml(row.text)}</p>`;
  }

  function renderVersions(reference, rows, analysis) {
    const notes = analysis.versionNotes || {};
    const versionHtml = rows
      .map((row) => {
        const note = notes[row.label.toLowerCase()]
          ? `<p class="version-note">${escapeHtml(notes[row.label.toLowerCase()])}</p>`
          : "";
        return `
          <div class="version-row">
            <div class="version-name">${escapeHtml(row.label)}</div>
            <div>
              ${formatVersionText(row)}
              ${note}
            </div>
          </div>`;
      })
      .join("");

    const compare = notes.compare
      ? `<p class="version-note" style="margin-top:1rem">${escapeHtml(notes.compare)}</p>`
      : "";

    document.getElementById("versions-content").innerHTML = versionHtml + compare;

    document.getElementById("licensed-links").innerHTML = LICENSED.map((version) => {
      return `<a href="${gatewayUrl(reference, version)}" target="_blank" rel="noopener noreferrer">Compare ${version} on Bible Gateway</a>`;
    }).join("");
  }

  function renderExpressions(analysis) {
    const items = analysis.expressions
      .map(
        (item) => `
        <div class="expression-item">
          <h4>${escapeHtml(item.title)}</h4>
          <p>${escapeHtml(item.body)}</p>
        </div>`
      )
      .join("");

    const guide = analysis.isGeneric
      ? `<div class="guide-box" style="margin-top:1.25rem">
          <h4>Study checklist</h4>
          <ul>
            <li>Write the plain sense in one sentence.</li>
            <li>Identify language (Hebrew / Aramaic / Greek) and the main verb.</li>
            <li>Open 3–5 key words with range of meaning in context.</li>
            <li>Compare KJV, NIV, ESV, and NLT; note real differences.</li>
            <li>Ask what the loaded phrases do in the argument or poem.</li>
            <li>Sketch historical setting, author, audience, and cultural images.</li>
            <li>Read the surrounding verses and name the hinge before/after.</li>
            <li>Write a concrete modern application and answer the study questions.</li>
          </ul>
        </div>`
      : "";

    document.getElementById("expressions-content").innerHTML =
      `<div class="expression-list">${items}</div>${guide}`;
  }

  function renderTextSection(elementId, lines) {
    document.getElementById(elementId).innerHTML = paragraphs(lines);
  }

  function surroundItemsHtml(items) {
    return (items || [])
      .map((item) => {
        const text = item.text
          ? `<p class="surround-text">${escapeHtml(item.text)}</p>`
          : "";
        return `
          <div class="surround-item">
            <p class="surround-ref">${escapeHtml(item.ref)}</p>
            ${text}
            <p class="surround-note">${escapeHtml(item.note || "")}</p>
          </div>`;
      })
      .join("");
  }

  async function enrichSurrounding(surrounding) {
    if (!surrounding) return surrounding;
    const slots = [...(surrounding.before || []), ...(surrounding.after || [])];
    const lookups = await Promise.all(
      slots.map(async (item) => {
        if (!item.ref || /immediate context/i.test(item.ref)) {
          return { ...item };
        }
        try {
          const row = await fetchVersion(item.ref, "kjv");
          return { ...item, text: row.text, ref: row.formalRef || item.ref };
        } catch {
          return { ...item };
        }
      })
    );

    const beforeCount = (surrounding.before || []).length;
    return {
      ...surrounding,
      before: lookups.slice(0, beforeCount),
      after: lookups.slice(beforeCount)
    };
  }

  function renderSurrounding(surrounding) {
    if (!surrounding) {
      document.getElementById("surrounding-content").innerHTML =
        "<p>Read the verses immediately before and after this passage.</p>";
      return;
    }

    const overview = surrounding.overview
      ? `<p>${escapeHtml(surrounding.overview)}</p>`
      : "";

    document.getElementById("surrounding-content").innerHTML = `
      <div class="context-stack">
        ${overview}
        <div class="surround-group">
          <h4>Before</h4>
          ${surroundItemsHtml(surrounding.before)}
        </div>
        <div class="surround-group">
          <h4>After</h4>
          ${surroundItemsHtml(surrounding.after)}
        </div>
      </div>
    `;
  }

  const ARCHIVE_KEY = "open-text-answer-archive";

  function answerStorageKey(reference, index) {
    return `open-text-answer:${normalizeRef(reference)}:${index}`;
  }

  function loadAnswer(reference, index) {
    try {
      return localStorage.getItem(answerStorageKey(reference, index)) || "";
    } catch {
      return "";
    }
  }

  function saveAnswer(reference, index, value) {
    try {
      localStorage.setItem(answerStorageKey(reference, index), value);
    } catch {
      // Ignore quota / private-mode failures.
    }
  }

  function loadArchive() {
    try {
      const raw = localStorage.getItem(ARCHIVE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeArchive(entries) {
    try {
      localStorage.setItem(ARCHIVE_KEY, JSON.stringify(entries));
    } catch {
      // Ignore quota / private-mode failures.
    }
  }

  function formatArchiveDate(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "Unknown date";
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  function formatArchiveTime(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function dateKey(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "unknown";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function archiveAnswer(entry) {
    const entries = loadArchive();
    entries.unshift({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      reference: entry.reference,
      prompt: entry.prompt,
      answer: entry.answer,
      recordedAt: new Date().toISOString()
    });
    writeArchive(entries);
    renderArchive();
  }

  function deleteArchiveEntry(id) {
    writeArchive(loadArchive().filter((entry) => entry.id !== id));
    renderArchive();
  }

  function renderArchive() {
    const root = document.getElementById("archive-content");
    if (!root) return;

    const entries = loadArchive();
    if (!entries.length) {
      root.innerHTML = `<p class="empty-note">No archived answers yet. Save an answer from the Questions section to record it with today’s date.</p>`;
      return;
    }

    const groups = new Map();
    entries.forEach((entry) => {
      const key = dateKey(entry.recordedAt);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(entry);
    });

    const daysHtml = [...groups.entries()]
      .map(([key, dayEntries]) => {
        const label = formatArchiveDate(dayEntries[0].recordedAt);
        const items = dayEntries
          .map(
            (entry) => `
            <article class="archive-entry" data-archive-id="${escapeHtml(entry.id)}">
              <p class="archive-meta">${escapeHtml(entry.reference)} · ${escapeHtml(formatArchiveTime(entry.recordedAt))}</p>
              <p class="archive-prompt">${escapeHtml(entry.prompt)}</p>
              <p class="archive-answer">${escapeHtml(entry.answer)}</p>
              <div class="archive-entry-actions question-actions">
                <button type="button" data-delete-archive="${escapeHtml(entry.id)}">Delete</button>
              </div>
            </article>`
          )
          .join("");
        return `
          <div class="archive-day" data-date="${escapeHtml(key)}">
            <p class="archive-date">${escapeHtml(label)}</p>
            ${items}
          </div>`;
      })
      .join("");

    root.innerHTML = `
      <p class="archive-status">${entries.length} saved answer${entries.length === 1 ? "" : "s"}</p>
      ${daysHtml}`;

    root.querySelectorAll("[data-delete-archive]").forEach((button) => {
      button.addEventListener("click", () => {
        deleteArchiveEntry(button.getAttribute("data-delete-archive"));
      });
    });
  }

  function buildCommentsSummary(item) {
    if (item.commentsSummary) return item.commentsSummary;
    if (!Array.isArray(item.comments) || !item.comments.length) return "";

    const points = item.comments.map((comment) => {
      const first = comment.body.split(/(?<=\.)\s+/)[0] || comment.body;
      return `${comment.name}: ${first}`;
    });
    return points.join(" ");
  }

  function revealContentHtml(item, index) {
    if (Array.isArray(item.comments) && item.comments.length) {
      const notes = item.comments
        .map(
          (comment) => `
          <div class="theologian-note">
            <p class="theologian-name">${escapeHtml(comment.name)}</p>
            <p>${escapeHtml(comment.body)}</p>
          </div>`
        )
        .join("");
      const summary = buildCommentsSummary(item);
      return `
        <p class="suggested-label">Theologian comments</p>
        <div class="theologian-list">${notes}</div>
        <div class="question-actions comments-summary-actions">
          <button type="button" data-summarize-comments="${index}">Summarize these comments</button>
        </div>
        <div class="comments-summary" id="comments-summary-${index}" hidden>
          <p class="suggested-label">Summary of these comments</p>
          <p>${escapeHtml(summary)}</p>
        </div>`;
    }

    return `
      <p class="suggested-label">Suggested answer</p>
      <p>${escapeHtml(item.answer || "")}</p>`;
  }

  function revealButtonLabel(item, revealed) {
    const showLabel = item.revealLabel || "Show suggested answer";
    const hideLabel = item.comments
      ? "Hide theologian comments"
      : "Hide suggested answer";
    return revealed ? hideLabel : showLabel;
  }

  function renderQuestions(analysis) {
    const questions = analysis.questions || [];
    const root = document.getElementById("questions-content");

    if (!questions.length) {
      root.innerHTML = "<p>No study questions yet for this passage.</p>";
      return;
    }

    root.innerHTML = `<div class="question-list">${questions
      .map((item, index) => {
        const saved = loadAnswer(analysis.reference, index);
        const needsAnswer = item.requireAnswer || Boolean(item.comments);
        return `
          <article class="question-card" data-question-index="${index}">
            <p class="question-prompt">${escapeHtml(item.prompt)}</p>
            <label for="answer-${index}">Your answer</label>
            <textarea id="answer-${index}" data-answer-input="${index}" placeholder="Write your thoughts here…">${escapeHtml(saved)}</textarea>
            <div class="question-actions">
              <button type="button" data-toggle-answer="${index}" data-require-answer="${needsAnswer ? "true" : "false"}">${escapeHtml(revealButtonLabel(item, false))}</button>
              <button type="button" data-archive-answer="${index}">Save answer</button>
              <button type="button" data-clear-answer="${index}">Clear my answer</button>
            </div>
            <p class="question-hint" id="hint-${index}" hidden>Write your answer first, then reveal the comments.</p>
            <p class="question-hint" id="archive-hint-${index}" hidden>Write an answer before saving it to the archive.</p>
            <p class="archive-status" id="archive-saved-${index}" hidden>Saved to archive with today’s date.</p>
            <div class="suggested-answer" id="suggested-${index}" hidden>
              ${revealContentHtml(item, index)}
            </div>
          </article>`;
      })
      .join("")}</div>`;

    root.querySelectorAll("[data-answer-input]").forEach((textarea) => {
      textarea.addEventListener("input", () => {
        const index = textarea.dataset.answerInput;
        saveAnswer(analysis.reference, index, textarea.value);
        const hint = document.getElementById(`hint-${index}`);
        if (hint) hint.hidden = true;
      });
    });

    root.querySelectorAll("[data-toggle-answer]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = button.dataset.toggleAnswer;
        const item = questions[Number(index)];
        const panel = document.getElementById(`suggested-${index}`);
        const hint = document.getElementById(`hint-${index}`);
        const textarea = document.getElementById(`answer-${index}`);
        const summary = document.getElementById(`comments-summary-${index}`);
        const summarizeBtn = root.querySelector(`[data-summarize-comments="${index}"]`);
        const open = panel.hasAttribute("hidden");
        const requiresAnswer = button.dataset.requireAnswer === "true";

        if (open && requiresAnswer && !textarea.value.trim()) {
          if (hint) hint.hidden = false;
          textarea.focus();
          return;
        }

        if (hint) hint.hidden = true;

        if (open) {
          panel.removeAttribute("hidden");
          button.textContent = revealButtonLabel(item, true);
        } else {
          panel.setAttribute("hidden", "");
          button.textContent = revealButtonLabel(item, false);
          if (summary) summary.setAttribute("hidden", "");
          if (summarizeBtn) summarizeBtn.textContent = "Summarize these comments";
        }
      });
    });

    root.querySelectorAll("[data-summarize-comments]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = button.dataset.summarizeComments;
        const summary = document.getElementById(`comments-summary-${index}`);
        if (!summary) return;
        const open = summary.hasAttribute("hidden");
        if (open) {
          summary.removeAttribute("hidden");
          button.textContent = "Hide summary";
          summary.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } else {
          summary.setAttribute("hidden", "");
          button.textContent = "Summarize these comments";
        }
      });
    });

    root.querySelectorAll("[data-archive-answer]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = button.dataset.archiveAnswer;
        const item = questions[Number(index)];
        const textarea = document.getElementById(`answer-${index}`);
        const hint = document.getElementById(`archive-hint-${index}`);
        const savedNote = document.getElementById(`archive-saved-${index}`);
        const answer = textarea.value.trim();

        if (!answer) {
          if (hint) hint.hidden = false;
          if (savedNote) savedNote.hidden = true;
          textarea.focus();
          return;
        }

        if (hint) hint.hidden = true;
        archiveAnswer({
          reference: analysis.reference,
          prompt: item.prompt,
          answer
        });

        const recorded = new Date().toISOString();
        if (savedNote) {
          savedNote.hidden = false;
          savedNote.textContent = `Answer saved to the archive · ${formatArchiveDate(recorded)}.`;
        }

        const archivePanel = document.getElementById("archive-panel");
        const archiveButton = document.querySelector('[data-reveal-target="archive-panel"]');
        if (archivePanel && archiveButton) {
          archivePanel.removeAttribute("hidden");
          archiveButton.setAttribute("aria-expanded", "true");
          archiveButton.textContent = "Hide archive";
        }
      });
    });

    root.querySelectorAll("[data-clear-answer]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = button.dataset.clearAnswer;
        const item = questions[Number(index)];
        const textarea = document.getElementById(`answer-${index}`);
        const panel = document.getElementById(`suggested-${index}`);
        const summary = document.getElementById(`comments-summary-${index}`);
        const toggle = root.querySelector(`[data-toggle-answer="${index}"]`);
        const summarizeBtn = root.querySelector(`[data-summarize-comments="${index}"]`);
        const archiveHint = document.getElementById(`archive-hint-${index}`);
        const savedNote = document.getElementById(`archive-saved-${index}`);
        textarea.value = "";
        saveAnswer(analysis.reference, index, "");
        panel.setAttribute("hidden", "");
        if (summary) summary.setAttribute("hidden", "");
        if (toggle) toggle.textContent = revealButtonLabel(item, false);
        if (summarizeBtn) summarizeBtn.textContent = "Summarize these comments";
        if (archiveHint) archiveHint.hidden = true;
        if (savedNote) savedNote.hidden = true;
        textarea.focus();
      });
    });
  }

  function setRevealState(button, panel, open) {
    const isArchive = button.getAttribute("data-reveal-target") === "archive-panel";
    const hideLabel = isArchive ? "Hide archive" : "Hide text";
    const showLabel = isArchive ? "Reveal archive" : "Reveal text";

    if (open) {
      panel.removeAttribute("hidden");
      button.setAttribute("aria-expanded", "true");
      button.textContent = hideLabel;
    } else {
      panel.setAttribute("hidden", "");
      button.setAttribute("aria-expanded", "false");
      button.textContent = showLabel;
    }
  }

  function resetPanelReveals() {
    studyEl.querySelectorAll(".panel-reveal").forEach((panel) => {
      panel.setAttribute("hidden", "");
    });
    studyEl.querySelectorAll(".reveal-panel-btn").forEach((button) => {
      button.setAttribute("aria-expanded", "false");
      button.textContent = "Reveal text";
    });
    setStudyGroup("language-meaning-group", false);
    setStudyGroup("historical-context-group", false);
    syncGroupButtons();
  }

  function setStudyGroup(groupId, open) {
    const group = document.getElementById(groupId);
    if (!group) return;
    if (open) group.removeAttribute("hidden");
    else group.setAttribute("hidden", "");
  }

  function studyGroupOpen(groupId) {
    const group = document.getElementById(groupId);
    return Boolean(group && !group.hasAttribute("hidden"));
  }

  function syncGroupButtons() {
    const pairs = [
      ["language-meaning-btn", "language-meaning-group"],
      ["historical-context-btn", "historical-context-group"]
    ];
    pairs.forEach(([buttonId, groupId]) => {
      const button = document.getElementById(buttonId);
      if (!button) return;
      button.setAttribute(
        "aria-expanded",
        studyGroupOpen(groupId) ? "true" : "false"
      );
    });
  }

  function toggleStudyGroup(groupId, scrollId) {
    const open = !studyGroupOpen(groupId);
    setStudyGroup(groupId, open);
    syncGroupButtons();
    if (open) {
      document.getElementById(scrollId)?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-reveal-target]");
    if (!button) return;

    const panel = document.getElementById(button.getAttribute("data-reveal-target"));
    if (!panel) return;

    const open = panel.hasAttribute("hidden");
    setRevealState(button, panel, open);
  });

  document
    .getElementById("language-meaning-btn")
    ?.addEventListener("click", () => toggleStudyGroup("language-meaning-group", "sense"));
  document
    .getElementById("historical-context-btn")
    ?.addEventListener("click", () =>
      toggleStudyGroup("historical-context-group", "historical")
    );

  window.addEventListener(
    "scroll",
    () => {
      if (siteHeader) {
        siteHeader.classList.toggle("is-scrolled", window.scrollY > 12);
      }
      if (backTop) {
        backTop.classList.toggle("is-visible", window.scrollY > 500);
      }
    },
    { passive: true }
  );

  backTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  renderArchive();

  async function studyReference(rawReference) {
    const reference = rawReference.trim();
    if (!reference) {
      setStatus("Enter a Bible reference to begin.");
      return;
    }

    setStatus(`Loading ${reference}…`);
    studyEl.hidden = true;
    resetPanelReveals();

    try {
      const versionResults = await Promise.allSettled(
        PD_VERSIONS.map((version) => fetchVersion(reference, version.id))
      );

      const rows = versionResults
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);

      if (!rows.length) {
        throw new Error("No public-domain translations returned for that reference.");
      }

      const requested = normalizeRef(reference);
      const key = normalizeRef(rows[0].formalRef || reference);

      function findCurated(candidate) {
        if (analyses[candidate]) return analyses[candidate];
        return Object.entries(analyses).find(([refKey]) => {
          if (candidate === refKey) return true;
          return (
            candidate.startsWith(`${refKey}:`) ||
            candidate.startsWith(`${refKey} `)
          );
        })?.[1];
      }

      const curated = findCurated(requested) || findCurated(key);

      const analysis =
        curated ||
        genericGuide(rows[0].formalRef || reference, rows[0].text);

      const surrounding = await enrichSurrounding(analysis.surrounding);

      document.getElementById("study-reference").textContent = analysis.reference;
      document.getElementById("primary-text").textContent = analysis.primaryText;

      const visual = document.getElementById("study-visual");
      const studyImage = document.getElementById("study-image");
      const isJobPassage = /^job\s*[12]\b/i.test(normalizeRef(analysis.reference));
      if (visual && studyImage) {
        if (isJobPassage) {
          studyImage.src = "job.jpg";
          studyImage.alt =
            "Job sitting in ashes among ruins after loss, looking upward in grief";
          visual.hidden = false;
        } else {
          visual.hidden = true;
        }
      }

      renderSense(analysis);
      renderWords(analysis);
      renderVersions(analysis.reference, rows, analysis);
      renderExpressions(analysis);
      renderTextSection("historical-content", analysis.historical);
      renderTextSection("author-content", analysis.author);
      renderTextSection("audience-content", analysis.audience);
      renderTextSection("culture-content", analysis.culture);
      renderSurrounding(surrounding);
      renderTextSection("application-content", analysis.application);
      renderQuestions(analysis);

      studyEl.hidden = false;
      setStatus(
        curated
          ? `Curated study for ${analysis.reference}.`
          : `Live versions loaded for ${analysis.reference}. Use the study guide for language, context, and application.`,
        true
      );

      studyEl.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      studyEl.hidden = true;
      setStatus(
        error.message ||
          "Could not load that reference. Try a form like Job 1 or Job 2."
      );
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    studyReference(input.value);
  });

  document.querySelectorAll("[data-ref]").forEach((button) => {
    button.addEventListener("click", () => {
      input.value = button.getAttribute("data-ref");
      studyReference(input.value);
    });
  });
})();
