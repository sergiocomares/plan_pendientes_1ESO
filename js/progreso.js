(function () {
  const KEY = "mate-en-marcha-progress-v1";

  function read() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || { visited: [], theory: [], exercises: [], quizzes: [], resources: [], completed: [] };
    } catch {
      return { visited: [], theory: [], exercises: [], quizzes: [], resources: [], completed: [] };
    }
  }

  function add(list, value) {
    const state = read();
    if (!state[list].includes(value)) state[list].push(value);
    localStorage.setItem(KEY, JSON.stringify(state));
    return state;
  }

  window.ProgressStore = {
    read,
    markVisited: (id) => add("visited", id),
    markTheory: (id) => add("theory", id),
    markExercise: (id) => add("exercises", id),
    markQuiz: (id) => add("quizzes", id),
    markResource: (id) => add("resources", id),
    toggleCompleted(id) {
      const state = read();
      state.completed = state.completed.includes(id) ? state.completed.filter((item) => item !== id) : [...state.completed, id];
      localStorage.setItem(KEY, JSON.stringify(state));
      return state;
    },
    clear() {
      localStorage.removeItem(KEY);
    },
    summary(total) {
      const state = read();
      return { state, total, completed: state.completed.length, percent: total ? Math.round(state.completed.length / total * 100) : 0 };
    }
  };
})();