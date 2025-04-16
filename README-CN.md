<p align="center">
  <a href="https://www.icoolgo.com" target="_blank">
    <img src="public/icon/logo.svg" width="318px" alt="爱酷搜索" />
  </a>
</p>


<h3 align="center">开源产品经理导航 · 标签页 · 搜索 · 自定义导航 </h3>
<p align="center">使用Cursor开发的网址导航网站，支持自定义首页样式、网址、接口等</p>

<p align="center"> 中文 |  <a href="README.md">English</a> | <a href="https://www.icoolgo.com/" target="_blank">演示</a></p>

## 简介

使用AI编程开发工具Cursor开发的网址导航网站，内置导航API，支持自定义首页样式，搜索引擎、网站收藏等。

<p align="center">
  <a href="" >
    <img src="public/screenshot_1.png" alt="演示" />
  </a>
</p>

<p align="center">
  <a href="" >
    <img src="public/screenshot_2.png" alt="演示" />
  </a>
</p>

<p align="center">
  <a href="" >
    <img src="public/screenshot_3.png" alt="演示" />
  </a>
</p>

### 特点

1. **简洁实用**：默认网址导航功能，可通过自定义添加自己的网址收藏。
2. **多种布局方式**：自定义页面风格，以及导航卡片布局方式。
3. **功能完善**：除了导航功能，还支持页面元素的自定义，模式切换等。

## 🚀已有功能

- 内置多个搜索引擎切换
- 我的收藏（支持添加收藏）
- 网址导航（内置产品经理常用导航API）
- 友情连接/版本信息（通过API自定义）
- 模式切换（系统/明亮/暗黑）
- 设置页（背景壁纸/搜索引擎/导航风格）
- 三种背景壁纸风格（纯色/渐变/壁纸支持设置遮罩、壁纸模糊）
- 搜索引擎设置（默认搜索、图标/文字显示、搜索引擎开关、搜索框样式）
- 导航图标样式（大图标、小图标、卡片式）

### 后续功能计划

- 增加搜索关键词历史记录，可以一键清除搜索历史
- 增加网址导航管理功能，登录后直接管理API里常用网址导航
- 增加搜索引擎添加功能，添加自定义搜索引擎
- 增加批量导入网址功能，支持常见的浏览器书签html文件一键导入
- 增加热搜列表，通过API调用最新热搜【微博、虎扑、知乎、百度、360】

## 🛠️ 技术栈

- [Next.js](https://nextjs.org/) - React生产级框架
- [TailwindCSS](https://tailwindcss.com/) - 实用优先的CSS框架
- [TypeScript](https://www.typescriptlang.org/) - 类型安全的JavaScript

## 📦 安装与部署

### 使用Node.js部署

用于本地开发或在Node.js服务器上部署：

克隆仓库:

```
git clone https://github.com/xmsumi/icoolgo-pm-navigator.git
cd icoolgo-pm-navigator
```

安装依赖:

```
npm install
# 或者
yarn install
# 或者
pnpm install
```

运行开发服务器:

```
npm run dev
# 或者
yarn dev
# 或者
pnpm dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000/) 查看应用。

生产环境部署:

```
# 构建应用
npm run build

# 启动生产服务器
npm start
```

## License

Licensed under the [MIT](./LICENSE) License.