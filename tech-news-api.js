#!/usr/bin/env node
/**
 * 每日科技资讯 API
 * 聚合多个来源的科技新闻
 */

const https = require('https');

// 获取 Hacker News 科技新闻
function getHackerNews() {
  return new Promise((resolve) => {
    https.get('https://hacker-news.firebaseio.com/v0/topstories.json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', async () => {
        try {
          const ids = JSON.parse(data).slice(0, 10);
          const stories = await Promise.all(ids.map(id => {
            return new Promise((resolve2) => {
              https.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, (res2) => {
                let d = '';
                res2.on('data', c => d += c);
                res2.on('end', () => {
                  try {
                    resolve2(JSON.parse(d));
                  } catch(e) { resolve2(null); }
                });
              }).on('error', () => resolve2(null));
            });
          }));
          resolve(stories.filter(s => s && s.title));
        } catch(e) { resolve([]); }
      });
    }).on('error', () => resolve([]));
  });
}

// 获取 Dev.to 文章
function getDevTo() {
  return new Promise((resolve) => {
    https.get('https://dev.to/api/articles?per_page=10&tag=tech', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const articles = JSON.parse(data);
          resolve(articles.map(a => ({
            title: a.title,
            url: a.url,
            author: a.user?.name,
            likes: a.positive_reactions_count,
            comments: a.comments_count,
            tags: a.tag_list
          })));
        } catch(e) { resolve([]); }
      });
    }).on('error', () => resolve([]));
  });
}

const http = require('http');
const PORT = process.env.PORT || 3002;

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  if (url.pathname === '/health') {
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }
  
  if (url.pathname === '/api/tech-news') {
    try {
      const [hn, devto] = await Promise.all([getHackerNews(), getDevTo()]);
      
      res.end(JSON.stringify({
        success: true,
        sources: {
          hackernews: hn.slice(0, 5).map(s => ({
            title: s.title,
            url: s.url || `https://news.ycombinator.com/item?id=${s.id}`,
            score: s.score,
            comments: s.descendants
          })),
          devto: devto.slice(0, 5)
        },
        updated: new Date().toISOString()
      }));
    } catch(e) {
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }
  
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`📰 Tech News API running on port ${PORT}`);
  console.log(`   - GET /api/tech-news   获取科技资讯`);
});
