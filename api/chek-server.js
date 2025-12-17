// /api/check-server.js
export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ ok: false, error: 'Falta ?url=' });
  }

  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'JuegosDragDashboard/1.0' } });
    if (!r.ok) {
      return res.status(502).json({ ok: false, error: `HTTP ${r.status}` });
    }

    const ct = (r.headers.get('content-type') || '').toLowerCase();
    let servers = [];

    if (ct.includes('application/json')) {
      const data = await r.json();
      servers = Array.isArray(data) ? data : (data.servers || []);
    } else {
      const html = await r.text();
      const regex = /Servidor\s*#?\s*(\d+)?\s*\[?([^\]]+)?\]?\s*(ONLINE|OFFLINE)\s*(\d+)/gi;
      let m;
      while ((m = regex.exec(html)) !== null) {
        servers.push({
          id: m[1] ? Number(m[1]) : null,
          name: m[2] ? m[2].trim() : `Servidor ${m[1] || '?'}`,
          status: m[3].toUpperCase(),
          players: Number(m[4])
        });
      }
    }

    if (!servers.length) {
      return res.status(200).json({ ok: false, error: 'No se detectó estado en la página' });
    }

    return res.status(200).json({ ok: true, servers });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err.message || err) });
  }
}