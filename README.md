# 不急主站

Astro 静态主站，第一阶段只实现基础阅读体验。

## 已完成范围

- 首页 `/`
- 随笔列表 `/writing`
- 随笔详情 `/writing/[slug]`
- 关于页 `/about`
- RSS `/rss.xml`
- Sitemap
- 基础 SEO 与 404
- `blog` 与 `works` Content Collections

## 本阶段不做

- 正式作品页
- 搜索
- Giscus 真接入
- 联系表单真接入
- Newsletter 真接入
- 数据库、用户系统、后台管理

## 开发

```bash
npm install
npm run dev
```

## 验证

```bash
npm run astro check
npm run build
```

`SITE_URL` 未配置时使用 `https://buji.example.com` 作为本地占位。第三方服务环境变量为空时不会加载脚本或发起请求。

## 部署

当前项目是 Astro 静态站，部署到 Vercel。

Vercel 会自动识别 Astro 项目；构建配置为：

```text
Build command: npm run build
Output directory: dist
```

正式部署前，在 Vercel 项目环境变量中设置：

```text
SITE_URL=https://你的正式域名
UPSTASH_REDIS_REST_URL=你的 Upstash Redis REST URL
UPSTASH_REDIS_REST_TOKEN=你的 Upstash Redis REST Token
```

匿名留言板通过 Vercel Functions 写入 Upstash Redis。未配置 Redis 环境变量时，文章页会保留留言入口但不接受写入。

本地部署前检查：

```bash
npm ci
npm run lint
SITE_URL=https://你的正式域名 npm run build
```

不要在本项目中混用 `pnpm install` 或 `pnpm run`；项目以 `package-lock.json` 为准，默认使用 npm。
