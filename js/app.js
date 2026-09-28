(function () {
  const main = document.getElementById("contenido");
  const toast = document.getElementById("toast");
  let data;
  let toastTimer;
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const blockUrl = (id) => `#/bloque/${encodeURIComponent(id)}`;

  function notify(message) {
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("visible"), 2400);
  }

  function progressPanel() {
    const summary = ProgressStore.summary(data.bloques.length);
    return `<section class="progress-panel" aria-label="Tu progreso"><div class="progress-copy"><strong>Tu progreso</strong><span>Has trabajado ${summary.completed} de ${summary.total} bloques</span></div><div class="progress-number">${summary.percent}%</div><div class="progress-track" role="progressbar" aria-label="Progreso del plan" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${summary.percent}"><div class="progress-fill" style="width:${summary.percent}%"></div></div></section>`;
  }

  function renderHome() {
    const steps = ["Conoce lo que tienes que recuperar", "Repasa la teoría", "Aprende con vídeos", "Practica", "Comprueba lo que sabes", "Prepárate para la prueba"];
    const cards = data.bloques.map((block) => {
      const complete = ProgressStore.read().completed.includes(block.id);
      return `<a class="block-card" href="${blockUrl(block.id)}" style="--block-color:${escapeHtml(block.color)}"><div class="block-topline"><span>BLOQUE ${String(block.orden).padStart(2, "0")}</span><span class="block-icon" aria-hidden="true">${escapeHtml(block.icono)}</span></div><h3>${escapeHtml(block.titulo)}</h3><p>${escapeHtml(block.descripcion)}</p><div class="card-bottom"><span>${complete ? "Ver contenido" : "Empezar bloque"} →</span><span class="status-pill ${complete ? "done" : ""}">${complete ? "TRABAJADO" : "PENDIENTE"}</span></div></a>`;
    }).join("");
    main.innerHTML = `<div class="page-enter"><section class="hero"><div><p class="eyebrow">${escapeHtml(data.configuracion.asignatura.toLocaleUpperCase("es"))} · ${escapeHtml(data.configuracion.curso)}</p><h1>${escapeHtml(data.configuracion.subtitulo)}</h1><p>Un plan claro para saber qué estudiar, practicar y repasar antes de la prueba.</p><a class="hero-link" href="${blockUrl(data.bloques.find((block) => !ProgressStore.read().completed.includes(block.id))?.id || data.bloques[0].id)}">Continuar mi plan <span aria-hidden="true">→</span></a></div><div class="hero-mark" aria-hidden="true">∑</div></section>${progressPanel()}<div class="section-heading"><div><p class="eyebrow">TU RECORRIDO</p><h2>¿Qué tengo que hacer?</h2></div><p>Sigue estos pasos en cada bloque.</p></div><section class="steps-grid" aria-label="Itinerario de recuperación">${steps.map((step, index) => `<div class="step-card"><span class="step-number">${index + 1}</span><div><strong>${escapeHtml(step)}</strong><small>Paso ${index + 1}</small></div></div>`).join("")}</section><div class="section-heading"><div><p class="eyebrow">EMPIEZA POR AQUÍ</p><h2>Mi plan de recuperación</h2></div><p>${data.bloques.length} bloques · a tu ritmo</p></div><section class="block-grid">${cards}</section></div>`;
  }

  function renderVideos(videos) {
    if (!videos?.length) return '<p class="placeholder-note">Próximamente: el profesor añadirá aquí vídeos recomendados y comprobados en <strong>data/videos.json</strong>.</p>';
    return `<div class="video-grid">${videos.map((video) => {
      const hasId = /^[\w-]{11}$/.test(video.youtubeId || "");
      const url = hasId ? `https://www.youtube.com/watch?v=${encodeURIComponent(video.youtubeId)}` : video.url;
      const thumbnail = hasId ? `https://img.youtube.com/vi/${encodeURIComponent(video.youtubeId)}/hqdefault.jpg` : "";
      return `<article class="video-card"><a class="video-thumb" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" aria-label="Ver ${escapeHtml(video.titulo)} en YouTube">${thumbnail ? `<img src="${thumbnail}" alt="Miniatura del vídeo ${escapeHtml(video.titulo)}" loading="lazy">` : '<span class="video-placeholder">▶ Ver vídeo</span>'}</a><div class="video-info"><h3>${escapeHtml(video.titulo)}</h3><p>${escapeHtml(video.descripcion)}</p><span class="source-line">Canal: ${escapeHtml(video.canal)}</span></div></article>`;
    }).join("")}</div>`;
  }

  function renderResources(resources) {
    if (!resources?.length) return '<p class="placeholder-note">Todavía no hay recursos adicionales. Aquí podrás enlazar actividades interactivas, fichas y juegos creados por el profesor.</p>';
    return `<div class="resource-grid">${resources.map((resource) => `<article class="resource-card"><span class="resource-type">${escapeHtml(resource.tipo)}</span><div class="resource-info"><h3>${escapeHtml(resource.titulo)}</h3><p>${escapeHtml(resource.descripcion)}</p>${resource.url ? `<a class="resource-link" href="${escapeHtml(resource.url)}" target="_blank" rel="noopener noreferrer" data-resource="${escapeHtml(resource.id)}">Abrir recurso →</a>` : '<span class="source-line">Enlace pendiente de añadir</span>'}</div></article>`).join("")}</div>`;
  }

  function renderBlock(id) {
    const block = Blocks.byId(data, id);
    if (!block) return renderNotFound();
    ProgressStore.markVisited(id);
    const theory = Blocks.content(data, "teoria", id);
    const videos = Blocks.content(data, "videos", id)?.items || [];
    const exerciseData = Blocks.content(data, "ejercicios", id);
    const resources = Blocks.content(data, "recursos", id)?.items || [];
    const objectives = block.objetivos.map((objective) => `<li>${escapeHtml(objective)}</li>`).join("");
    const theoryRows = theory?.apartados?.length ? theory.apartados.map((item) => `<details class="theory-item" data-theory="${escapeHtml(item.id)}"><summary>${escapeHtml(item.titulo)}</summary><div class="theory-body"><p>${escapeHtml(item.explicacion)}</p>${item.ejemplo ? `<div class="example-box">Ejemplo: ${escapeHtml(item.ejemplo)}</div>` : ""}</div></details>`).join("") : '<p class="placeholder-note">La teoría de este bloque está pendiente de preparar.</p>';
    const completed = ProgressStore.read().completed.includes(id);
    main.innerHTML = `<div class="page-enter"><a class="back-link" href="#/">← Volver a mi plan</a><section class="block-hero" style="--block-color:${escapeHtml(block.color)}"><span class="block-icon" aria-hidden="true">${escapeHtml(block.icono)}</span><div><p class="eyebrow">BLOQUE ${String(block.orden).padStart(2, "0")}</p><h1>${escapeHtml(block.titulo)}</h1><p>${escapeHtml(block.descripcion)}</p></div></section><section class="objective-panel"><h2>En este bloque aprenderás a…</h2><ul class="objective-list">${objectives}</ul></section><nav class="route-strip" aria-label="Pasos de este bloque"><button type="button" data-scroll="estudia">📚 1. Estudia</button><button type="button" data-scroll="videos">🎥 2. Mira</button><button type="button" data-scroll="practica">✏️ 3. Practica</button><button type="button" data-scroll="refuerza">🧠 4. Refuerza</button><button type="button" data-scroll="comprueba">✅ 5. Comprueba</button></nav><section class="content-section" id="estudia"><div class="section-heading"><div><p class="eyebrow">PASO 1</p><h2>Estudia</h2></div><p>Abre cada apartado y avanza poco a poco.</p></div><div class="theory-list">${theoryRows}</div></section><section class="content-section" id="videos"><div class="section-heading"><div><p class="eyebrow">PASO 2</p><h2>Vídeos para aprender</h2></div></div>${renderVideos(videos)}</section><section class="content-section" id="practica"><div class="section-heading"><div><p class="eyebrow">PASO 3</p><h2>Practica</h2></div><p>Mira la solución cuando lo hayas intentado.</p></div>${Exercises.renderExercises(exerciseData?.items || [])}</section><section class="content-section" id="refuerza"><div class="section-heading"><div><p class="eyebrow">PASO 4</p><h2>Si esto te cuesta…</h2></div><p>Prueba otra forma de practicar.</p></div>${renderResources(resources)}</section><section class="content-section" id="comprueba"><div class="section-heading"><div><p class="eyebrow">PASO 5</p><h2>¿Estoy preparado?</h2></div></div>${Exercises.renderQuiz(exerciseData?.autoevaluacion || [])}<div class="complete-panel"><div><strong>${completed ? "¡Ya has trabajado este bloque!" : "¿Has terminado este bloque?"}</strong><p>${completed ? "Puedes volver cuando quieras para repasar." : "Marca el bloque cuando hayas estudiado y practicado sus contenidos."}</p></div><button class="${completed ? "secondary-button" : "primary-button"}" data-action="complete" data-block="${escapeHtml(id)}">${completed ? "Desmarcar bloque" : "Marcar como trabajado"}</button></div></section></div>`;
    main.querySelector("#refuerza")?.remove();
    main.querySelector('[data-scroll="refuerza"]')?.remove();
    main.querySelector('[data-scroll="comprueba"]').textContent = "✅ 4. Comprueba";
    main.querySelector("#comprueba .eyebrow").textContent = "PASO 4";
    setBreadcrumb(`BLOQUE ${String(block.orden).padStart(2, "0")} / ${block.titulo.toLocaleUpperCase("es")}`);
    if (window.MathJax?.typesetPromise) window.MathJax.typesetPromise([main]);
  }

  function renderPending() {
    const missing = data.bloques.filter((block) => !ProgressStore.read().completed.includes(block.id));
    main.innerHTML = `<div class="page-enter"><p class="eyebrow">TU SIGUIENTE PASO</p><h1>Lo que me falta</h1><p class="lead">Aquí tienes los bloques que todavía no has marcado como trabajados. Elige uno y continúa desde ahí.</p>${missing.length ? `<div class="pending-list">${missing.map((block) => `<article class="pending-item"><span class="pending-icon" aria-hidden="true">${escapeHtml(block.icono)}</span><div class="pending-copy"><strong>${escapeHtml(block.titulo)}</strong><small>BLOQUE ${String(block.orden).padStart(2, "0")}</small></div><a class="small-button" href="${blockUrl(block.id)}">Ir al tema →</a></article>`).join("")}</div>` : '<div class="empty-state"><h2>Has trabajado todos los bloques.</h2><p>Vuelve a cualquier tema para repasar antes de la prueba.</p><a class="primary-button" href="#/">Ver mi plan</a></div>'}${progressPanel()}</div>`;
  }

  function renderSchedule() {
    const weeks = data.calendario.semanas || [];
    main.innerHTML = `<div class="page-enter"><p class="eyebrow">A TU RITMO</p><h1>Organiza tu estudio</h1><p class="lead">Una propuesta flexible. Las semanas no tienen fechas: adapta el ritmo al tiempo que tienes.</p>${weeks.length ? `<div class="schedule-list">${weeks.map((week) => `<article class="week-row"><strong>${escapeHtml(week.titulo)}</strong><p>${escapeHtml(week.contenido)}</p>${week.bloqueId ? `<a class="small-button" href="${blockUrl(week.bloqueId)}">Ver tema →</a>` : ""}</article>`).join("")}</div>` : '<p class="placeholder-note">El calendario orientativo está pendiente de completar en <strong>data/calendario.json</strong>.</p>'}</div>`;
  }

  function renderDocuments() {
    const docs = data.documentos.documentos || [];
    main.innerHTML = `<div class="page-enter"><p class="eyebrow">INFORMACIÓN DEL CENTRO</p><h1>Documentación</h1><p class="lead">Aquí encontrarás instrucciones y documentos oficiales del plan de recuperación. El material de estudio está en los bloques.</p>${docs.length ? `<div class="doc-grid">${docs.map((doc) => `<article class="doc-card"><span class="doc-icon" aria-hidden="true">▤</span><div><strong>${escapeHtml(doc.titulo)}</strong><small>${escapeHtml(doc.descripcion)}</small>${doc.url ? `<br><a class="resource-link" href="${escapeHtml(doc.url)}" target="_blank" rel="noopener noreferrer">Abrir documento →</a>` : ""}</div></article>`).join("")}</div>` : '<p class="placeholder-note">El centro podrá añadir el programa, los criterios, las instrucciones y las fichas en <strong>data/documentos.json</strong>.</p>'}</div>`;
  }

  function renderSearch(query) {
    const results = SearchContent.search(data, query);
    main.innerHTML = `<div class="page-enter"><p class="eyebrow">BUSCAR EN MI PLAN</p><h1>¿Qué necesitas repasar?</h1><p class="lead">Resultados para «${escapeHtml(query)}».</p>${results.length ? `<div class="search-results">${results.map((block) => {
      const theory = Blocks.content(data, "teoria", block.id)?.apartados || [];
      const exercises = Blocks.content(data, "ejercicios", block.id)?.items || [];
      const videos = Blocks.content(data, "videos", block.id)?.items || [];
      const resources = Blocks.content(data, "recursos", block.id)?.items || [];
      const kinds = [theory.length && "Teoría", videos.length && "Vídeos", exercises.length && "Ejercicios", resources.length && "Refuerzo"].filter(Boolean);
      return `<article class="search-result"><h3>${escapeHtml(block.titulo)}</h3><p>${escapeHtml(block.descripcion)}</p><div class="search-result-tags">${(kinds.length ? kinds : ["Contenido por preparar"]).map((kind) => `<span>${kind}</span>`).join("")}</div><a class="small-button" href="${blockUrl(block.id)}">Abrir bloque →</a></article>`;
    }).join("")}</div>` : '<div class="empty-state"><h2>No encuentro ese contenido todavía.</h2><p>Prueba con otra palabra o revisa todos los bloques.</p><a class="primary-button" href="#/">Ver mi plan</a></div>'}</div>`;
  }

  function renderNotFound() {
    main.innerHTML = '<div class="error-panel"><h2>Este bloque no existe en el plan.</h2><p>Vuelve al inicio para ver los contenidos disponibles.</p><a class="primary-button" href="#/">Ir a mi plan</a></div>';
  }

  function setBreadcrumb(label) {
    document.getElementById("breadcrumb").innerHTML = `TU ESPACIO <span>/</span> ${escapeHtml(label)}`;
  }

  function route() {
    if (!data) return;
    const path = decodeURIComponent(location.hash.slice(1) || "/");
    document.querySelectorAll("[data-nav]").forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${path}` || (path.startsWith("/bloque/") && link.dataset.nav === "home")));
    if (path === "/") { setBreadcrumb("MI PLAN"); renderHome(); }
    else if (path.startsWith("/bloque/")) renderBlock(path.slice("/bloque/".length));
    else if (path === "/pendiente") { setBreadcrumb("LO QUE ME FALTA"); renderPending(); }
    else if (path === "/organiza") { setBreadcrumb("ORGANIZA TU ESTUDIO"); renderSchedule(); }
    else if (path.startsWith("/buscar/")) { setBreadcrumb("BÚSQUEDA"); renderSearch(path.slice("/buscar/".length)); }
    else renderNotFound();
    window.scrollTo(0, 0);
  }

  document.addEventListener("click", (event) => {
    const scrollButton = event.target.closest("[data-scroll]");
    if (scrollButton) document.getElementById(scrollButton.dataset.scroll)?.scrollIntoView({ behavior: "smooth", block: "start" });
    const solutionButton = event.target.closest('[data-action="solution"]');
    if (solutionButton) {
      const card = solutionButton.closest(".exercise-card");
      const solution = card.querySelector(".solution");
      const visible = solution.hidden;
      solution.hidden = !visible;
      solution.classList.toggle("visible", visible);
      solutionButton.textContent = visible ? "Ocultar solución" : "Ver solución";
      solutionButton.setAttribute("aria-expanded", String(visible));
      if (visible) { ProgressStore.markExercise(card.dataset.exercise); notify("Ejercicio trabajado. ¡Buen trabajo!"); }
    }
    if (event.target.closest('[data-action="complete"]')) {
      const button = event.target.closest('[data-action="complete"]');
      const state = ProgressStore.toggleCompleted(button.dataset.block);
      notify(state.completed.includes(button.dataset.block) ? "Bloque marcado como trabajado." : "Bloque pendiente de repasar.");
      route();
    }
  });

  document.addEventListener("toggle", (event) => {
    if (event.target.matches("details[data-theory]") && event.target.open) {
      const blockId = location.hash.slice("#/bloque/".length);
      ProgressStore.markTheory(`${decodeURIComponent(blockId)}:${event.target.dataset.theory}`);
    }
  }, true);

  document.addEventListener("click", (event) => {
    const resource = event.target.closest("[data-resource]");
    if (resource) ProgressStore.markResource(resource.dataset.resource);
  });

  document.addEventListener("submit", (event) => {
    if (event.target.id !== "quiz-form") return;
    event.preventDefault();
    const form = event.target;
    if (!form.reportValidity()) return;
    const questions = [...form.querySelectorAll(".quiz-question")];
    const missed = [];
    let correct = 0;
    questions.forEach((question) => {
      const answer = question.querySelector("input:checked");
      if (Number(answer.value) === Number(question.dataset.correctIndex)) correct += 1;
      else missed.push({ topic: question.dataset.skill, detail: question.dataset.recommendation });
    });
    const percent = correct / questions.length;
    const heading = percent >= .75 ? "Vas bien. Puedes continuar." : percent >= .45 ? "Necesitas repasar algunos contenidos." : "Te recomendamos volver a estudiar este bloque.";
    const missing = [...new Set(missed.map((item) => item.topic))];
    const recommendations = missed.length ? `<p>Antes de seguir, vuelve sobre:</p><ul>${missing.map((topic) => `<li class="needs-review">${escapeHtml(topic)}</li>`).join("")}</ul><div class="exercise-actions">${missed.map((item) => `<button class="small-button" type="button" data-review="${escapeHtml(item.detail)}">Repasar ${escapeHtml(item.topic)}</button>`).join("")}</div>` : "<p>Has respondido correctamente a todas. Puedes seguir con el siguiente bloque.</p>";
    const result = document.getElementById("quiz-result");
    result.innerHTML = `<section class="quiz-result"><h3>${heading}</h3>${recommendations}</section>`;
    ProgressStore.markQuiz(location.hash.slice("#/bloque/".length));
    result.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  document.addEventListener("click", (event) => {
    const review = event.target.closest("[data-review]");
    if (!review) return;
    const theory = [...document.querySelectorAll(".theory-item")].find((item) => item.dataset.theory === review.dataset.review);
    if (theory) { theory.open = true; theory.scrollIntoView({ behavior: "smooth", block: "center" }); }
  });

  document.querySelector(".skip-link").addEventListener("click", (event) => {
    event.preventDefault();
    main.focus({ preventScroll: true });
    main.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.getElementById("search-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const query = document.getElementById("search-input").value.trim();
    if (query) location.hash = `/buscar/${encodeURIComponent(query)}`;
  });
  document.getElementById("search-input").addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.target.value = ""; event.target.blur(); }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
      event.preventDefault();
      document.getElementById("search-input").focus();
    }
  });
  document.getElementById("reset-progress").addEventListener("click", () => {
    if (window.confirm("¿Borrar todo el progreso guardado en este dispositivo?")) {
      ProgressStore.clear();
      route();
      notify("Progreso borrado.");
    }
  });
  window.addEventListener("hashchange", route);

  Blocks.load().then((loaded) => {
    data = loaded;
    document.title = data.configuracion.titulo;
    document.querySelector(".brand strong").textContent = data.configuracion.marca;
    document.querySelector(".brand small").textContent = data.configuracion.etiqueta;
    document.querySelector(".sidebar-foot").textContent = `${data.configuracion.asignatura.toLocaleUpperCase("es")} · ${data.configuracion.curso.toLocaleUpperCase("es")}`;
    route();
  }).catch((error) => {
    main.innerHTML = `<section class="error-panel"><h2>No se ha podido cargar el plan</h2><p>${escapeHtml(error.message)}. Abre el proyecto con Live Server o desde un servidor web para que los archivos JSON puedan cargarse.</p></section>`;
  });
})();