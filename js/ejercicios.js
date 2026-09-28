(function () {
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

  function renderExercises(items) {
    if (!items?.length) return '<p class="placeholder-note">Este bloque todavía no tiene ejercicios. El profesor puede añadirlos en <strong>data/ejercicios.json</strong>.</p>';
    const levels = [...new Set(items.map((item) => item.nivel))];
    return levels.map((level) => {
      const label = { 1: "🟢 NIVEL 1 · EMPIEZO", 2: "🟡 NIVEL 2 · PRACTICO", 3: "🔴 NIVEL 3 · ME PREPARO" }[level] || `NIVEL ${level}`;
      const cards = items.filter((item) => item.nivel === level).map((item) => `<article class="exercise-card" data-exercise="${escapeHtml(item.id)}">
        <p>${escapeHtml(item.enunciado)}</p><div class="exercise-actions"><button class="secondary-button" type="button" data-action="solution" aria-expanded="false">Ver solución</button><span class="source-line">${escapeHtml(item.tema)}</span></div>
        <div class="solution" hidden><strong>Solución:</strong> ${escapeHtml(item.solucion)}</div></article>`).join("");
      return `<h3 class="level-label">${label}</h3><div class="exercise-list">${cards}</div>`;
    }).join("");
  }

  function renderQuiz(questions) {
    if (!questions?.length) return '<p class="placeholder-note">La autoevaluación de este bloque está pendiente de preparar.</p>';
    const fields = questions.map((question, index) => `<fieldset class="quiz-question" data-skill="${escapeHtml(question.tema)}" data-correct-index="${Number(question.correcta)}" data-recommendation="${escapeHtml(question.recomendacion)}"><legend>${index + 1}. ${escapeHtml(question.pregunta)}</legend><div class="quiz-options">${question.opciones.map((option, optionIndex) => `<label class="quiz-option"><input type="radio" name="q-${index}" value="${optionIndex}" required> ${escapeHtml(option)}</label>`).join("")}</div></fieldset>`).join("");
    return `<form class="quiz-card" id="quiz-form"><p>Responde para descubrir qué te conviene repasar. No es una nota.</p>${fields}<button class="primary-button" type="submit">Ver qué necesito repasar <span aria-hidden="true">→</span></button><div id="quiz-result" aria-live="polite"></div></form>`;
  }

  window.Exercises = { renderExercises, renderQuiz };
})();