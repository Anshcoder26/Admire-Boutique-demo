// Local stand-ins: SMTP sink on :2525 and fake Meta Graph API on :4010.
import net from "node:net";
import http from "node:http";
import fs from "node:fs";

const OUT = process.argv[2] || "/tmp/notify-e2e";
fs.mkdirSync(OUT, { recursive: true });
let n = 0;

net.createServer((sock) => {
  let data = false, buf = "";
  sock.write("220 sink ESMTP\r\n");
  sock.on("data", (chunk) => {
    buf += chunk.toString("binary");
    if (data) {
      const end = buf.indexOf("\r\n.\r\n");
      if (end === -1) return;
      const msg = buf.slice(0, end);
      buf = buf.slice(end + 5);
      data = false;
      const file = `${OUT}/mail-${++n}.eml`;
      fs.writeFileSync(file, msg, "binary");
      const to = (msg.match(/^To: (.*)$/m) || [])[1];
      const subj = (msg.match(/^Subject: (.*)$/m) || [])[1];
      const pdf = /application\/pdf/.test(msg);
      console.log(`[SMTP] to=${to} subject=${subj} pdf=${pdf} -> ${file}`);
      sock.write("250 OK queued\r\n");
    }
    let i;
    while (!data && (i = buf.indexOf("\r\n")) !== -1) {
      const line = buf.slice(0, i); buf = buf.slice(i + 2);
      const cmd = line.slice(0, 4).toUpperCase();
      if (cmd === "EHLO") sock.write("250-sink\r\n250 AUTH PLAIN LOGIN\r\n");
      else if (cmd === "HELO") sock.write("250 sink\r\n");
      else if (cmd === "AUTH") sock.write("235 ok\r\n");
      else if (cmd === "DATA") { sock.write("354 go\r\n"); data = true; }
      else if (cmd === "QUIT") { sock.write("221 bye\r\n"); sock.end(); }
      else sock.write("250 OK\r\n");
    }
  });
}).listen(2525, () => console.log("SMTP sink :2525"));

http.createServer((req, res) => {
  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => {
    const body = Buffer.concat(chunks);
    res.setHeader("Content-Type", "application/json");
    if (req.url.endsWith("/media")) {
      const isPdf = body.includes(Buffer.from("%PDF"));
      console.log(`[GRAPH] media upload ${req.url} bytes=${body.length} pdf=${isPdf} auth=${!!req.headers.authorization}`);
      return res.end(JSON.stringify({ id: `media-${Date.now()}` }));
    }
    const json = JSON.parse(body.toString() || "{}");
    fs.writeFileSync(`${OUT}/wa-${++n}.json`, JSON.stringify(json, null, 2));
    const params = json.template?.components?.find((c) => c.type === "body")?.parameters?.map((p) => p.text);
    const header = json.template?.components?.find((c) => c.type === "header")?.parameters?.[0]?.document;
    console.log(`[GRAPH] message to=${json.to} template=${json.template?.name} lang=${json.template?.language?.code} body=${JSON.stringify(params)} doc=${header ? header.filename : "none"}`);
    res.end(JSON.stringify({ messaging_product: "whatsapp", contacts: [{ wa_id: json.to }], messages: [{ id: "wamid.TEST" }] }));
  });
}).listen(4010, () => console.log("Graph stub :4010"));
