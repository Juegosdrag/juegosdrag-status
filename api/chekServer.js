import net from "net";
import fetch from "node-fetch";

export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Falta parámetro 'url'" });

  let host;
  try { host = new URL(url).hostname; }
  catch { return res.status(400).json({ error: "URL inválida" }); }

  // HTTP
  let http = "OFFLINE ❌";
  try {
    const r = await fetch(url, { timeout: 5000 });
    if (r.ok) http = "ONLINE ✅";
  } catch {}

  // TCP
  let tcp = "OFFLINE ❌";
  await new Promise(resolve => {
    const socket = new net.Socket();
    socket.setTimeout(5000);
    socket.on("connect", () => { tcp = "ONLINE ✅"; socket.destroy(); resolve(); });
    socket.on("error", () => resolve());
    socket.on("timeout", () => { tcp = "TIMEOUT ⚠️"; socket.destroy(); resolve(); });
    socket.connect(7666, host);
  });

  res.status(200).json({ http, tcp });
}