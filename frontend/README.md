# FeedbackBridge Frontend

智能反馈转化系统的前端应用，基于 React + TypeScript + Vite 构建。

## 功能特性

- 🚀 基于 Vite 的快速开发体验
- ⚛️ React 18 + TypeScript 现代化开发
- 🎨 Ant Design 5.x 企业级 UI 组件库
- 🔄 React Query 数据状态管理
- 📱 响应式设计，支持移动端
- 🎯 组件化架构，易于维护和扩展

## 技术栈

- **框架**: React 18.2.0
- **构建工具**: Vite 5.0.8
- **语言**: TypeScript 5.2.2
- **UI库**: Ant Design 5.12.8
- **状态管理**: Zustand 4.4.7
- **数据获取**: React Query 3.39.3
- **路由**: React Router DOM 6.20.1
- **表单**: React Hook Form 7.48.2
- **样式**: CSS Modules + Ant Design

## 快速开始

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 查看应用。

### 3. 构建生产版本

```bash
npm run build
```

### 4. 预览生产版本

```bash
npm run preview
```

## 项目结构

```
frontend/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── Layout/         # 布局组件
│   │   ├── FeedbackForm/   # 反馈表单
│   │   ├── PreviewPanel/   # 预览面板
│   │   └── TemplateSelector/ # 模板选择器
│   ├── pages/              # 页面组件
│   │   ├── HomePage/       # 首页
│   │   ├── HistoryPage/    # 历史记录页
│   │   └── TemplatesPage/  # 模板管理页
│   ├── hooks/              # 自定义 Hooks
│   │   └── useFeedback.ts  # 反馈相关逻辑
│   ├── services/           # API 服务
│   │   └── api.ts          # API 客户端
│   ├── store/              # 状态管理
│   │   └── useAppStore.ts  # 全局状态
│   ├── types/              # TypeScript 类型定义
│   │   └── index.ts        # 类型声明
│   ├── utils/              # 工具函数
│   ├── App.tsx             # 根组件
│   ├── main.tsx            # 入口文件
│   └── App.css             # 全局样式
├── public/                 # 静态资源
├── index.html              # HTML 模板
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
└── package.json            # 依赖配置
```

## 开发指南

### 添加新页面

1. 在 `src/pages/` 目录下创建页面组件
2. 在 `src/App.tsx` 中添加路由
3. 在 `src/components/Layout/index.tsx` 中添加导航菜单

### 添加新组件

1. 在 `src/components/` 目录下创建组件
2. 创建对应的 CSS 文件
3. 导出组件供其他模块使用

### 添加新的 API 接口

1. 在 `src/services/api.ts` 中添加 API 方法
2. 在 `src/types/index.ts` 中添加相关类型定义
3. 在 `src/hooks/` 中创建对应的 Hook

### 状态管理

使用 Zustand 进行状态管理：

```typescript
import { useAppStore } from '@/store/useAppStore';

const MyComponent = () => {
  const { user, setUser } = useAppStore();
  
  return (
    <div>
      {user ? `Hello ${user.name}` : 'Please login'}
    </div>
  );
};
```

### 数据获取

使用 React Query 进行数据获取：

```typescript
import { useQuery } from 'react-query';
import { apiService } from '@/services/api';

const MyComponent = () => {
  const { data, isLoading, error } = useQuery(
    ['templates'],
    () => apiService.getTemplates()
  );
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{data?.map(item => <div key={item.id}>{item.name}</div>)}</div>;
};
```

## 样式指南

### CSS 类命名

使用 BEM 命名规范：

```css
.component-name {
  /* 组件根元素 */
}

.component-name__element {
  /* 组件子元素 */
}

.component-name--modifier {
  /* 组件修饰符 */
}
```

### 响应式设计

使用 CSS Grid 和 Flexbox 进行布局：

```css
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

@media (max-width: 768px) {
  .responsive-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
```

### 深色模式支持

使用 CSS 媒体查询支持深色模式：

```css
.component {
  background: #fff;
  color: #333;
}

@media (prefers-color-scheme: dark) {
  .component {
    background: #1f1f1f;
    color: #fff;
  }
}
```

## 构建和部署

### 环境变量

创建 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_TITLE=FeedbackBridge
```

### 构建优化

- 代码分割：自动按路由和组件分割
- 资源压缩：自动压缩 JS、CSS 和图片
- Tree Shaking：移除未使用的代码
- 缓存策略：文件名包含哈希值

### 部署

构建完成后，将 `dist` 目录部署到静态文件服务器：

```bash
npm run build
# 将 dist 目录内容上传到服务器
```

## 开发工具

### VS Code 推荐插件

- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Auto Rename Tag
- Bracket Pair Colorizer
- Prettier - Code formatter
- ESLint

### 调试工具

- React Developer Tools
- Redux DevTools (兼容 Zustand)
- React Query DevTools

## 性能优化

### 代码分割

```typescript
import { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./LazyComponent'));

const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <LazyComponent />
  </Suspense>
);
```

### 图片优化

使用 Vite 的图片处理功能：

```typescript
import logoUrl from '@/assets/logo.png?url';
import logoWebp from '@/assets/logo.png?webp';
```

### 缓存策略

使用 React Query 的缓存配置：

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分钟
      cacheTime: 10 * 60 * 1000, // 10分钟
    },
  },
});
```

## 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 修改 vite.config.ts 中的端口配置
   server: { port: 3000 }
   ```

2. **API 请求失败**
   - 检查后端服务是否启动
   - 确认 API 地址配置正确
   - 查看浏览器控制台错误信息

3. **样式不生效**
   - 检查 CSS 文件是否正确导入
   - 确认类名拼写正确
   - 检查 CSS 优先级

### 调试技巧

1. 使用 React Developer Tools 检查组件状态
2. 使用浏览器开发者工具查看网络请求
3. 查看控制台错误信息和警告

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License
