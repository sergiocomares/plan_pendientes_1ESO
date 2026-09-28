(function () {
  const files = ["configuracion", "bloques", "teoria", "videos", "ejercicios", "recursos", "calendario"];

  async function load() {
    const entries = await Promise.all(files.map(async (name) => {
      const response = await fetch(`data/${name}.json`);
      if (!response.ok) throw new Error(`No se pudo cargar data/${name}.json`);
      return [name, await response.json()];
    }));
    return Object.fromEntries(entries);
  }

  window.Blocks = {
    load,
    byId(data, id) { return data.bloques.find((block) => block.id === id); },
    content(data, list, id) { return data[list].find((item) => item.bloqueId === id); }
  };
})();