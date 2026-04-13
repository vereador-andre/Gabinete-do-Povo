function criarTopo(titulo){
  const topo = document.createElement("div");
  topo.className = "topo";

  topo.innerHTML = `
    <div class="voltar" onclick="history.back()">←</div>
    <div class="titulo-topo">${titulo}</div>
  `;

  document.body.prepend(topo);
}
