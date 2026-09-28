(function () {
  function search(data, query) {
    const normalized = query.trim().toLocaleLowerCase("es");
    if (!normalized) return [];
    return data.bloques.filter((block) => {
      const related = [block.titulo, block.descripcion, ...(block.objetivos || [])];
      for (const listName of ["teoria", "videos", "ejercicios", "recursos"]) {
        const content = Blocks.content(data, listName, block.id);
        if (content) related.push(JSON.stringify(content));
      }
      return related.join(" ").toLocaleLowerCase("es").includes(normalized);
    });
  }
  window.SearchContent = { search };
})();