// 简单的 API 服务 - 处理文本任务
const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3000;

// 简单的文本处理函数
const handlers = {
  // 摘要生成
  summary: (text, options = {}) => {
    const maxLength = options.maxLength || 100;
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },
  
  // 关键词提取
  keywords: (text, options = {}) => {
    const count = options.count || 5;
    const words = text.toLowerCase().match(/\w+/g) || [];
    const freq = {};
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([word]) => word);
  },
  
  // 格式化
  format: (text, options = {}) => {
    const type = options.type || 'plain';
    switch(type) {
      case 'uppercase': return text.toUpperCase();
      case 'lowercase': return text.toLowerCase();
      case 'title': return text.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase());
      default: return text;
    }
  },
  
  // 统计
  stats: (text) => {
    const words = text.split(/\s+/).filter(w => w);
    return {
      chars: text.length,
      words: words.length,
      lines: text.split('\n').length,
      paragraphs: text.split('\n\n').length
    };
  },
  
  // 代码高亮标记
  codeblock: (text, options = {}) => {
    const lang = options.lang || '';
    return `\`\`\`${lang}\n${text}\n\`\`\``;
  }
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // Health check
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }
  
  // API endpoints
  if (pathname === '/api/summary' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { text, maxLength } = JSON.parse(body);
        const result = handlers.summary(text, { maxLength });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ result }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    return;
  }
  
  if (pathname === '/api/keywords' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { text, count } = JSON.parse(body);
        const result = handlers.keywords(text, { count });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ result }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    return;
  }
  
  if (pathname === '/api/stats' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { text } = JSON.parse(body);
        const result = handlers.stats(text);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    return;
  }
  
  if (pathname === '/api/format' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { text, type } = JSON.parse(body);
        const result = handlers.format(text, { type });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ result }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    return;
  }
  
  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`AI Text API running on port ${PORT}`);
});
