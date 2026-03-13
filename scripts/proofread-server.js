const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3847;
const ROOT = path.join(__dirname, '..');

function send(res, status, body, contentType) {
  res.writeHead(status, { 'Content-Type': contentType || 'application/json' });
  res.end(body);
}

function getQuestionBankPath(subject) {
  const p = path.join(ROOT, subject, 'questionBank.json');
  if (!path.relative(ROOT, p).startsWith('..') && !path.isAbsolute(path.relative(ROOT, p))) return p;
  return path.join(ROOT, subject, 'questionBank.json');
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;
  const apiMatch = pathname.match(/^\/api\/(physics|chemistry|biology)\/questions(?:\/(\d+))?$/);

  const subjectStatic = pathname.match(/^\/(physics|chemistry|biology)\/(.*)$/);
  if (subjectStatic) {
    const sub = subjectStatic[1];
    const rest = subjectStatic[2];
    const filePath = path.join(ROOT, sub, rest);
    if (!path.resolve(filePath).startsWith(path.resolve(ROOT, sub))) {
      send(res, 404, 'Not found', 'text/plain');
      return;
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        send(res, err.code === 'ENOENT' ? 404 : 500, err.message, 'text/plain');
        return;
      }
      const ext = path.extname(filePath);
      const types = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.pdf': 'application/pdf' };
      res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
      res.end(data);
    });
    return;
  }

  if (apiMatch) {
    const subject = apiMatch[1];
    const index = apiMatch[2] == null ? null : parseInt(apiMatch[2], 10);
    const bankPath = getQuestionBankPath(subject);

    if (req.method === 'GET' && index === null) {
      try {
        const data = fs.readFileSync(bankPath, 'utf8');
        send(res, 200, data);
      } catch (e) {
        send(res, 500, JSON.stringify({ error: e.message }));
      }
      return;
    }

    if (req.method === 'PUT' && typeof index === 'number' && index >= 0) {
      let body = '';
      for await (const chunk of req) body += chunk;
      let question;
      try {
        question = JSON.parse(body);
      } catch (e) {
        send(res, 400, JSON.stringify({ error: 'Invalid JSON' }));
        return;
      }
      try {
        const raw = fs.readFileSync(bankPath, 'utf8');
        const list = JSON.parse(raw);
        if (!Array.isArray(list) || index >= list.length) {
          send(res, 400, JSON.stringify({ error: 'Invalid index' }));
          return;
        }
        list[index] = question;
        fs.writeFileSync(bankPath, JSON.stringify(list, null, 2), 'utf8');
        send(res, 200, JSON.stringify({ ok: true }));
      } catch (e) {
        send(res, 500, JSON.stringify({ error: e.message }));
      }
      return;
    }
  }

  let filePath = path.join(__dirname, pathname === '/' ? 'proofread.html' : pathname);
  if (pathname === '/proofread.html' || pathname === '/') {
    filePath = path.join(__dirname, 'proofread.html');
  }
  if (!path.resolve(filePath).startsWith(path.resolve(__dirname))) {
    send(res, 404, 'Not found', 'text/plain');
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      send(res, err.code === 'ENOENT' ? 404 : 500, 'Not found', 'text/plain');
      return;
    }
    const ext = path.extname(filePath);
    const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json' };
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('Proofread server: http://localhost:' + PORT + '/proofread.html');
});
