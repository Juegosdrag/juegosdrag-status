import fetch from "node-fetch";

export default async function handler(req, res) {
  const { url } = req.query;

  try {
    const response = await fetch(url);
    const html = await response.text();

    // Regex más estricta: busca líneas con formato "número - ONLINE/OFFLINE - jugadores"
    const regex = /(\d+)\s*-\s*(ONLINE|OFFLINE)\s*-\s*(\d+)\s*jugadores/gi;
    let servers = [];
    let match;

    while ((match = regex.exec(html)) !== null) {
      servers.push({
        name: match[1],
        status: match[2],
        players: parseInt(match[3], 10)
      });
    }

    // Filtrar duplicados y entradas irrelevantes
    servers = servers.filter(
      (s, i, arr) =>
        arr.findIndex(x => x.name === s.name) === i && s.name !== "0" && s.name !== "000"
    );

    res.status(200).json({ ok: true, servers });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}