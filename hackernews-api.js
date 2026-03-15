#!/usr/bin/env node
/**
 * Hacker News 热门新闻 API 服务
 * 可以对外提供热门新闻摘要服务
 */

const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 3001;

// 获取 Hacker News 热门故事
function getTopStories() {
  return new Promise((resolve, reject) => {
    https.get('https://hacker-news.firebaseio.com/v0/topstories.json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const ids = JSON.parse(data).slice(0, 30);
          resolve(ids);
        } catch(e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// 获取单个故事详情
function getStory(id) {
  return new Promise((resolve, reject) => {
    https.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch(e) {
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

// 批量获取故事
async function getTopStoriesDetailed(limit = 10) {
  const ids = await getTopStories();
  const stories = await Promise.all(ids.slice(0, limit).map(id => getStory(id)));
  return stories.filter(s => s !== null);
}

// 格式化为中文摘要
function formatSummary(stories) {
  return stories.map((s, i) => {
    const domain = s.url ? new URL(s.url).hostname.replace('www.', '') : 'news.ycombinator.com';
    return {
      排名: i + 1,
      标题: s.title,
      来源: domain,
      分数: s.score,
      评论数: s.descendants || 0,
      作者: s.by,
      链接: s.url || `https://news.ycombinator.com/item?id=${s.id}`
    };
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  // Health check
  if (url.pathname === '/health') {
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }
  
  // API: 获取热门新闻
  if (url.pathname === '/api/news' || url.pathname === '/') {
    try {
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const stories = await getTopStoriesDetailed(Math.min(limit, 30));
      
      // 简单版（不含URL，减小体积）
      const simple = url.searchParams.get('simple') === 'true';
      const result = simple 
        ? stories.map(s => ({ title: s.title, score: s.score, comments: s.descendants }))
        : formatSummary(stories);
      
      res.end(JSON.stringify({
        success: true,
        count: result.length,
        data: result,
        updated: new Date().toISOString()
      }));
    } catch (e) {
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }
  
  // 404
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`📰 Hacker News API running on port ${PORT}`);
  console.log(`   - GET /api/news           获取热门新闻 (limit参数可调整)`);
  console.log(`   - GET /api/news?simple=true  简洁版`);
  console.log(`   - GET /health            健康检查`);
});
