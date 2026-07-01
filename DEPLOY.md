# GitHub Pages 部署指南

## 已完成配置

1. **vite.config.ts** - 已配置 `base: '/LedgerAI/'` 路径
2. **src/manifest.json** - 已配置 H5 hash 路由模式（GitHub Pages 不支持 history 模式）
3. **public/landing.html** - 现代化落地页，作为 GitHub Pages 首页
4. **dist/build/h5/.nojekyll** - 已创建，防止 GitHub Pages 忽略下划线开头的文件
5. **.github/workflows/deploy.yml** - GitHub Actions 自动部署工作流
6. **i18n 国际化** - 全页面支持中英文切换
7. **主题系统** - 支持深色/浅色/跟随系统三种主题

## 新功能

### 现代化落地页
- Apple 风格极简设计，渐变色彩
- 响应式布局，支持移动端和桌面端
- 深色模式自动适配
- 流畅动画效果
- 功能介绍、应用预览、CTA 引导

### 自动化部署
- 推送到 main 分支自动触发构建部署
- 支持手动触发工作流
- 自动处理并发构建

### 国际化（i18n）
- 点击设置页面可切换语言（简体中文 / English）
- 所有页面内容已支持多语言翻译

### 主题切换
- 深色主题（默认）
- 浅色主题
- 跟随系统

## 一键发布（推荐）

### 步骤 1：首次设置 GitHub Pages

1. 打开 GitHub 仓库 → **Settings** → **Pages**
2. **Source** 选择 **GitHub Actions**
3. 保存后，页面会显示 "No deployments configured"

### 步骤 2：推送代码到 GitHub

```bash
cd /root/code/LedgerAI
git add .
git commit -m "Setup GitHub Pages with modern landing page"
git push origin main
```

### 步骤 3：等待自动部署

推送后 GitHub Actions 会自动触发构建和部署：
- 访问仓库 **Actions** 标签
- 查看 "Deploy to GitHub Pages" 工作流运行状态
- 等待部署完成（约 1-2 分钟）

> 💡 也可以手动触发：Actions → Deploy to GitHub Pages → Run workflow

### 步骤 4：访问网站

部署成功后，访问：
```
https://YOUR_USERNAME.github.io/LedgerAI/
```

你将看到现代化的落地页，点击 "立即体验" 即可进入应用。

## 手动部署（备选）

如果不想用 GitHub Actions，可以手动推送：

```bash
cd /root/code/LedgerAI
pnpm run build:h5
cd dist/build/h5
git init
git add .
git commit -m "Deploy to GitHub Pages"
git remote add origin https://github.com/YOUR_USERNAME/LedgerAI.git
git push -f origin master:gh-pages
```

## 后续发布

每次代码更新后：

```bash
# 1. 提交代码
git add .
git commit -m "Your changes"
git push origin main

# 2. 去 GitHub Actions 手动触发部署
# Actions → Deploy to GitHub Pages → Run workflow
```

## 注意事项

1. **Hash 路由**：URL 会包含 `#` 符号，如 `https://xxx.github.io/LedgerAI/#/pages/record/record`
2. **base 路径**：如果更改仓库名，需要同步修改 `vite.config.ts` 中的 `base` 配置
3. **首次部署**：需要先在 GitHub Settings → Pages 启用 GitHub Actions 作为部署源
4. **.nojekyll 文件**：每次构建后会自动创建，确保 GitHub Pages 正确处理资源文件

## 自动化部署脚本

项目已配置 GitHub Actions 工作流，每次推送到 main 分支后自动部署：

```yaml
# .github/workflows/deploy.yml
- 使用 Node.js v20 + pnpm v8
- 自动执行 pnpm install && pnpm run build:h5
- 自动部署 dist/build/h5 到 GitHub Pages
```

如需手动触发，可前往 GitHub Actions 页面运行 "Deploy to GitHub Pages" 工作流。
