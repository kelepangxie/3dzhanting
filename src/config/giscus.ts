/**
 * giscus 留言板配置（基于 GitHub Discussions，免费无后端）
 *
 * 开通步骤（详见 README.md「留言板配置」一节）：
 * 1. GitHub 仓库 → Settings → General → Features → 勾选 Discussions
 * 2. 安装 giscus App：https://github.com/apps/giscus （授予本仓库权限）
 * 3. 打开 https://giscus.app/zh-CN ，填入仓库名，选 Announcements 或 General 分类，
 *    页面会生成 repo-id 与 category-id，复制到下方对应位置。
 */
export const GISCUS = {
  repo: '', // 例如 'yourname/3dzhanting'
  repoId: '', // giscus.app 生成的 data-repo-id
  category: 'Announcements', // Discussions 分类名
  categoryId: '', // giscus.app 生成的 data-category-id
}

export const GISCUS_READY =
  GISCUS.repo.length > 0 && GISCUS.repoId.length > 0 && GISCUS.categoryId.length > 0
