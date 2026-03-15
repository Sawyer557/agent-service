#!/usr/bin/env node
/**
 * 提示词模板打包工具
 * 将所有提示词打包成一个压缩包或单个文件
 */

const fs = require('fs');
const path = require('path');

const PROMPTS_DIR = path.join(__dirname, 'prompts');
const OUTPUT_FILE = path.join(__dirname, 'prompts-all-in-one.md');

// 读取所有提示词文件
function getAllPrompts() {
  const files = fs.readdirSync(PROMPTS_DIR).filter(f => f.endsWith('.md'));
  let content = '# AI 提示词模板大全\n\n';
  content += '> 打包日期：' + new Date().toLocaleDateString('zh-CN') + '\n\n';
  content += '---\n\n';
  
  for (const file of files) {
    if (file === 'README.md') continue;
    const filePath = path.join(PROMPTS_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    content += `## ${file.replace('.md', '')}\n\n`;
    content += fileContent;
    content += '\n\n---\n\n';
  }
  
  return content;
}

// 生成索引
function generateIndex() {
  const files = fs.readdirSync(PROMPTS_DIR).filter(f => f.endsWith('.md'));
  let index = '# 提示词模板索引\n\n';
  
  const categories = {
    '内容创作': ['xiaohongshu', 'short-video', 'linkedin', 'email'],
    '职业发展': ['interview', 'resume'],
    '商业服务': ['ecommerce', 'chatbot'],
    '技术开发': ['coding']
  };
  
  for (const [cat, keywords] of Object.entries(categories)) {
    index += `## ${cat}\n\n`;
    for (const file of files) {
      if (keywords.some(k => file.includes(k))) {
        const name = file.replace('.md', '');
        index += `- [${name}](./prompts/${file})\n`;
      }
    }
    index += '\n';
  }
  
  return index;
}

console.log('📦 正在打包提示词模板...\n');

// 打包所有提示词
const allPrompts = getAllPrompts();
fs.writeFileSync(OUTPUT_FILE, allPrompts);
console.log(`✅ 已生成: ${OUTPUT_FILE}`);

// 生成索引
const index = generateIndex();
fs.writeFileSync(path.join(__dirname, 'INDEX.md'), index);
console.log('✅ 已生成: INDEX.md');

// 统计
const files = fs.readdirSync(PROMPTS_DIR).filter(f => f.endsWith('.md'));
console.log(`\n📊 统计：共 ${files.length} 个模板文件`);
console.log(`📝 共 ${allPrompts.length} 字符`);

console.log('\n✨ 完成！');
