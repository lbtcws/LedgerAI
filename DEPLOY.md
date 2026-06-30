# GitHub Pages 部署指南

## 已完成配置

1. **vite.config.ts** - 已添加 `base: '/LedgerAI/'` 配置
2. **src/manifest.json** - 已配置 H5 hash 路由模式（GitHub Pages 不支持 history 模式）
3. **dist/build/h5/.nojekyll** - 已创建，防止 GitHub Pages 忽略下划线开头的文件
4. **.github/workflows/deploy.yml** - GitHub Actions 一键部署工作流

## 一键发布（推荐）

### 步骤 0：提交修复（重要！）

已修复问题：
- 删除了 `pnpm-workspace.yaml`（导致 packages field missing 错误）
- 更新 pnpm 版本为 8（兼容 Node.js v20）
- 重新生成 pnpm-lock.yaml（lockfileVersion 6.0）

```bash
cd /root/code/LedgerAI
git add .
git commit -m "Fix: pnpm v8 compatibility for GitHub Actions"
git push origin main
```

### 步骤 1：首次设置 GitHub Pages

1. 打开 GitHub 仓库 → **Settings** → **Pages**
2. **Source** 选择 **GitHub Actions**
3. 保存后，页面会显示 "No deployments configured"

### 步骤 2：推送代码到 GitHub

```bash
cd /root/code/LedgerAI
git add .
git commit -m "Setup GitHub Pages deployment"
git push origin main
```

### 步骤 3：触发一键部署

1. 打开 GitHub 仓库 → **Actions** 标签
2. 点击左侧 **"Deploy to GitHub Pages"** 工作流
3. 点击 **"Run workflow"** 按钮
4. 选择分支（main），点击 **"Run workflow"**
5. 等待部署完成（约 1-2 分钟）

### 步骤 4：访问网站

部署成功后，访问：
```
https://YOUR_USERNAME.github.io/LedgerAI/
```

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
