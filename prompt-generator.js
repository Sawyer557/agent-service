#!/usr/bin/env node
/**
 * AI 提示词生成器 CLI 工具
 * 用法: node prompt-generator.js [类型] [主题]
 * 
 * 示例:
 *   node prompt-generator.js 小红书 种草 iPhone15
 *   node prompt-generator.js 面试 前端工程师
 *   node prompt-generator.js 短视频 知识分享
 */

const prompts = {
  小红书: {
    种草: `你是一位小红书种草达人。请为以下产品写一篇种草文案：
产品：{topic}
目标人群：年轻人/数码爱好者/职场人士
卖点：{卖点}
风格：真实/幽默/温柔

要求：
- 开头3秒抓注意力
- 中间用真实体验+细节
- 结尾引导互动
- 适当使用emoji
- 字数300-500字`,
    
    干货: `你是一位小红书知识博主。请为以下主题写一篇干货教程：
主题：{topic}
目标人群：{人群}
难度：入门/进阶

要求：
- 语言生动有趣
- 分步骤讲解
- 关键步骤标注
- 结尾总结+互动引导
- 字数500-1000字`,
    
    测评: `你是一位小红书测评博主。请为以下产品写一篇对比测评：
产品：{topic}
对比维度：外观/性能/性价比/使用体验

要求：
- 客观公正
- 用数据说话
- 优缺点分明
- 结尾给出购买建议`
  },

  面试: {
    模拟: `你是一位资深面试官。请进行模拟面试：
职位：{topic}
工作年限：1-3年/3-5年/5年以上
面试类型：技术面/HR面/主管面

流程：
1. 自我介绍（2分钟）
2. 项目经验深挖
3. 技术问题
4. 行为问题（STAR法则）
5. 反向提问

每次回答后给出评分和改进建议。`,
    
    复习: `你是一位面试教练。请帮我准备{topic}岗位的面试：
职位：{topic}
目标公司：{公司}
我的优势：{优势}
我的弱势：{弱势}

请提供：
1. 常见问题列表
2. 必问项目问题
3. 薪资谈判技巧
4. 注意事项`
  },

  短视频: {
    脚本: `你是一位短视频编导。请为以下主题生成短视频脚本：
主题：{topic}
平台：抖音/快手/视频号
时长：15s/30s/60s
类型：剧情/干货/种草/测评

格式：
- 画面描述
- 台词/文案
- 音效/音乐建议
- 运镜方式`,
    
    口播: `你是一位口播博主。请为以下主题生成口播脚本：
主题：{topic}
风格：亲和/专业/幽默/温柔
时长：1-3分钟
目标：吸粉/转化/品牌建设

要求：
- 黄金3秒开场
- 核心内容3-5点
- 结尾引导互动`
  },

  简历: {
    优化: `你是一位简历优化专家。请优化以下简历信息：
姓名：{topic}
工作年限：{年限}
目标职位：{职位}

工作经历：
{经历}

项目经验：
{项目}

技能：{技能}

请提供：
1. 评分
2. 各部分优化建议
3. 量化成果表达
4. 关键词优化`,
    
    求职信: `你是一位求职信专家。请为以下职位写求职信：
申请职位：{topic}
公司：{公司}
个人优势：{优势}
相关经验：{经验}

要求：
- 开头表明来意
- 中间展示优势
- 结尾期待回复
- 简洁、有针对性`
  },

  邮件: {
    营销: `你是一位邮件营销专家。请生成营销邮件：
主题：{topic}
目标用户：{用户}
营销目的：品牌宣传/产品推广/促销活动

请生成：
- 主题行（5个选项）
- 预览文本
- 邮件正文
- CTA 按钮文案`,
    
    冷启动: `你是一位 cold email 专家。请生成冷启动邮件：
目标收件人：{topic}
职位：{职位}
痛点：{痛点}
你能提供的价值：{价值}

要求：
- 引起注意的开头
- 展示价值
- 具体案例/数据
- 低门槛 CTA`
  },

  电商: {
    标题: `你是一位电商标题优化专家。请优化产品标题：
产品：{topic}
核心卖点：{卖点}
目标人群：{人群}
平台：淘宝/京东/拼多多

请生成5个优化后的标题：
- 包含核心关键词
- 突出卖点
- 符合平台规则
- 30字以内`,
    
    描述: `你是一位电商文案专家。请生成产品描述：
产品：{topic}
卖点：{卖点}
适用人群：{人群}
价格：{价格}

请生成：
- 开头：痛点引入
- 中间：卖点展开
- 结尾：行动引导
- 字数300-500字`
  }
};

// 解析命令行参数
const args = process.argv.slice(2);

if (args.length < 1) {
  console.log('🤖 AI 提示词生成器\n');
  console.log('用法: node prompt-generator.js [类型] [主题] [可选参数]');
  console.log('\n可用类型:');
  Object.keys(prompts).forEach(cat => {
    console.log(`  ${cat}: ${Object.keys(prompts[cat]).join(', ')}`);
  });
  console.log('\n示例:');
  console.log('  node prompt-generator.js 小红书 种草 iPhone15');
  console.log('  node prompt-generator.js 面试 模拟 前端工程师');
  console.log('  node prompt-generator.js 简历 优化');
  process.exit(0);
}

const category = args[0];
const subType = args[1] || '默认';
const topic = args.slice(2).join(' ') || '[在此填入你的主题]';

if (!prompts[category]) {
  console.log(`❌ 未知类型: ${category}`);
  console.log(`可用类型: ${Object.keys(prompts).join(', ')}`);
  process.exit(1);
}

const template = prompts[category][subType] || prompts[category][Object.keys(prompts[category])[0]];

if (!template) {
  console.log(`❌ 未知子类型: ${subType}`);
  console.log(`可用子类型: ${Object.keys(prompts[category]).join(', ')}`);
  process.exit(1);
}

// 生成提示词
const generatedPrompt = template.replace(/{topic}/g, topic)
  .replace(/{.*?}/g, match => {
    const placeholder = match.replace(/[{}]/g, '');
    return `[在此填入${placeholder}]`;
  });

console.log('\n📝 生成的提示词:\n');
console.log(generatedPrompt);
console.log('\n✨ 将上述提示词复制到 ChatGPT/Claude 即可使用\n');
