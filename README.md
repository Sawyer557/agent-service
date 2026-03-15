# AI Agent Service

提供 AI 自动化服务的 API 接口。

## 服务

- `/health` - 健康检查
- `/webhook` - 通用 Webhook 处理器

## 使用

```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "process",
    "input": "Hello",
    "operation": "uppercase"
  }'
```

## 联系
- Email: tbd
