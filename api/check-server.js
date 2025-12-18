export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { url } = req.query;
  if (!url) return res.status(400).json({ ok: false, error: "Falta URL" });

  try {
    // Añadimos un User-Agent para que la web no nos bloquee por parecer un bot
    const respuesta = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const texto = await respuesta.text();

    // --- NUEVA LÓGICA DE DETECCIÓN ---
    const servers = [];
    
    // 1. Buscamos si aparece "ONLINE" u "OFFLINE"
    const isOnline = /ONLINE/i.test(texto);
    const isOffline = /OFFLINE/i.test(texto);
    
    // 2. Buscamos números que suelan indicar usuarios (ej: "Usuarios: 15" o "15 jugadores")
    // Este regex busca un número seguido de palabras clave
    const userMatch = texto.match(/(\d+)\s*(usuarios|jugadores|online|users)/i) 
                   || texto.match(/(usuarios|jugadores|online|users)\D*(\d+)/i);

    if (isOnline || isOffline) {
      let numJugadores = 0;
      if (userMatch) {
        // Extraemos el número del grupo que lo haya capturado
        numJugadores = parseInt(userMatch[1] || userMatch[2], 10);
      }

      servers.push({
        name: "AO Forever",
        status: isOnline ? "ONLINE" : "OFFLINE",
        players: numJugadores
      });
    }

    res.status(200).json({
      ok: servers.length > 0,
      servers,
      // Si no encuentra nada, nos manda un trozo limpio de texto para ver qué hay
      debug: servers.length === 0 ? texto.replace(/<[^>]*>?/gm, ' ').slice(0, 300) : undefined
    });

  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
}