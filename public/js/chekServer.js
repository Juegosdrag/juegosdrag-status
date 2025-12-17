// /public/js/checkServer.js
async function consultarEstado(linkMacDirect) {
  const el = document.querySelector('#estado-ao');
  el.textContent = 'Consultando estado…';
  el.className = 'status status-loading';

  const endpoint = `/api/check-server?url=${encodeURIComponent(linkMacDirect)}`;

  try {
    const r = await fetch(endpoint, { cache: 'no-store' });
    const data = await r.json();

    if (!data.ok) {
      el.textContent = `Error consultando estado: ${data.error || 'desconocido'}`;
      el.className = 'status status-error';
      return;
    }

    el.innerHTML = data.servers.map(s => `
      <div class="server ${s.status === 'ONLINE' ? 'on' : 'off'}">
        <span class="name">${s.name}</span>
        <span class="state">${s.status}</span>
        <span class="players">${s.players} jugadores</span>
      </div>
    `).join('');
    el.className = 'status';
  } catch (e) {
    el.textContent = `Error consultando estado: ${e.message}`;
    el.className = 'status status-error';
  }
}

// Llama con tu placeholder
consultarEstado('$LINK_MAC_DIRECT$');