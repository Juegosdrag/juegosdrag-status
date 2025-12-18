// api/check-server.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ ok: false, error: 'Falta parámetro url' });
  }

  try {
    const respuesta = await fetch(url);
    const texto = await respuesta.text(); // 👈 leer como texto, no JSON

    // Regex para extraer servidores con formato: "Servidor X - ONLINE/OFFLINE - Y jugadores"
    const regex = /Servidor\s+(.+?)\s*-\s*(ONLINE|OFFLINE)\s*-\s*(\d+)\s+jugadores/gi;
    const servers = [];
    let match;
    while ((match = regex.exec(texto)) !== null) {
      servers.push({
        name: match[1].trim(),
        status: match[2],
        players: parseInt(match[3], 10)
      });
    }

    res.status(200).json({ ok: true, servers });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}