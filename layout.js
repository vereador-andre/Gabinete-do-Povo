function criarTopo(titulo) {
  // Evita duplicar o topo caso a função seja chamada duas vezes
  if (document.querySelector(".topo")) return;

  const topo = document.createElement("div");
  topo.className = "topo";

  topo.innerHTML = `
    <div class="voltar" onclick="history.back()" aria-label="Voltar">
      <i class="material-icons">arrow_back_ios_new</i>
    </div>
    <div class="titulo-topo">${titulo}</div>
  `;

  // Adiciona como primeiro elemento do body
  document.body.prepend(topo);
}
