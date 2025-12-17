// /api/check-server.js
export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ ok: false, error: 'Falta ?url=' });
  }

  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'JuegosDragDashboard/1.0',
        'Accept': '*/*'
      },
      redirect: 'follow'
    });

    if (!r.ok) {
      return res.status(502).json({ ok: false, error: `HTTP ${r.status}` });
    }

    const ct = (r.headers.get('content-type') || '').toLowerCase();

    // Siempre devolveremos JSON
    if (ct.includes('application/json')) {
      const data = await r.json();
      const servers = Array.isArray(data) ? data : (data.servers || []);
      if (!servers.length) {
        return res.status(200).json({ ok: false, error: 'JSON sin servidores' });
      }
      return res.status(200).json({ ok: true, servers });
    } else {
      const html = await r.text();

      // Patrones básicos para páginas tipo estado
      const servers = [];
      const rxList = [
        /Servidor\s*#\s*(\d+)\s*\[([^\]]+)\]\s*(ONLINE|OFFLINE)\s*(\d+)/gi,
        /(Argentina|Internacional|Battle\s*server|Servidor\s*\w+)\s*(ONLINE|OFFLINE)\s*(\d+)/gi,
        /(ONLINE|OFFLINE)[^0-9]*(\d+)\s*(jugadores|players)?/gi
      ];

      for (const rx of rxList) {
        let m;
        while ((m = rx.exec(html)) !== null) {
          const status = (m[3] || m[1]).toString().toUpperCase().includes('ONLINE') ? 'ONLINE' : 'OFFLINE';
          const players = Number((m[4] || m[2]) || 0);
          const name =
            (m[2] || m[1] || '').toString().trim() ||
            (m[1] && `Servidor #${m[1]}`) ||
            'Servidor';

          servers.push({ name, status, players });
        }
      }

      // Quitar duplicados por solapamiento de regex
      const unique = [];
      for (const s of servers) {
        if (!unique.find(u => u.name === s.name && u.status === s.status && u.players === s.players)) {
          unique.push(s);
        }
      }

      if (!unique.length) {
        return res.status(200).json({ ok: false, error: 'No se detectó estado en la página' });
      }

      return res.status(200).json({ ok: true, servers: unique });
    }
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err.message || err) });
  }
}