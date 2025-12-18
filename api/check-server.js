// api/check-server.js

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ ok: false, error: "Falta parámetro url" });
  }

  try {
    const respuesta = await fetch(url); // 👈 usar fetch global
    const texto = await respuesta.text();

    // Regex para servidores
    const regex = /Servidor\s+(.+?)\s*-\s*(ONLINE|OFFLINE)\s*-\s*(\d+)\s+jugadores/gi;
    const servers = [];
    let match;
    while ((match = regex.exec(texto)) !== null) {
      servers.push({
        name: match[1].trim(),
        status: match[2],
        players: parseInt(match[3], 10),
      });
    }

    res.status(200).json({
      ok: true,
      servers,
      raw: servers.length === 0 ? texto.slice(0, 200) + "..." : undefined,
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}