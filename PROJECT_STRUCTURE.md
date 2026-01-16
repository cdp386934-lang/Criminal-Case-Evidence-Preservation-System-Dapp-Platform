# 项目结构说明

本文档详细说明了刑事案件链上存证 DApp 平台的项目结构和各目录的作用。

## 📁 项目根目录

```
Criminal-Case-Evidence-Preservation-System-Dapp-Platform/
├── frontend/              # Next.js 14 前端应用
├── backend/               # Express + TypeScript 后端服务
├── contracts/             # Solidity 智能合约
├── README.md              # 项目主文档
├── QUICK_START.md         # 快速启动指南
├── DEPLOYMENT.md          # 生产环境部署指南
└── PROJECT_STRUCTURE.md   # 项目结构说明（本文档）
```

---

## 🎨 Frontend 前端目录

### 目录结构

```
frontend/
├── src/
│   ├── api/                    # API 接口封装
│   │   ├── api-client.ts       # Axios 客户端配置
│   │   ├── auth.api.ts         # 认证相关 API
│   │   ├── case.api.ts         # 案件管理 API
│   │   ├── evidence.api.ts     # 证据管理 API
│   │   ├── correction.api.ts   # 证据补正 API
│   │   ├── objection.api.ts    # 质证意见 API
│   │   ├── defense-material.api.ts  # 反证材料 API
│   │   ├── notification.api.ts # 通知 API
│   │   ├── operation-logs.api.ts # 操作日志 API
│   │   ├── export.api.ts       # 导出功能 API
│   │   └── user-api.ts         # 用户管理 API
│   │
│   ├── components/             # React 组件
│   │   ├── layouts/            # 布局组件
│   │   │   ├── dashboard-layout.tsx    # 仪表板布局
│   │   │   ├── main-layout.tsx         # 主布局
│   │   │   ├── protect-router.tsx      # 路由保护组件
│   │   │   └── notification-bell.tsx   # 通知铃铛组件
│   │   ├── ui/                 # UI 基础组件
│   │   │   ├── button.tsx      # 按钮组件
│   │   │   ├── card.tsx        # 卡片组件
│   │   │   ├── input.tsx       # 输入框组件
│   │   │   ├── label.tsx       # 标签组件
│   │   │   └── tabs.tsx        # 标签页组件
│   │   ├── case-work-flow.tsx  # 案件工作流组件
│   │   ├── timeline-viewer.tsx # 时间线查看器
│   │   ├── wallet-connect.tsx  # 钱包连接组件
│   │   ├── role-guard.tsx      # 角色权限守卫
│   │   ├── form-input.tsx      # 表单输入组件
│   │   └── index.ts            # 组件导出入口
│   │
│   ├── hooks/                  # React Hooks
│   │   └── use-wallet.ts       # 钱包相关 Hook
│   │
│   ├── lib/                    # 工具库
│   │   ├── blockchain.ts       # 区块链交互工具
│   │   └── utils.ts            # 通用工具函数
│   │
│   ├── models/                 # 数据模型定义
│   │   ├── auth.model.ts       # 认证模型
│   │   ├── case.model.ts       # 案件模型
│   │   ├── evidence.model.ts   # 证据模型
│   │   ├── corrention.model.ts # 补正模型（注意拼写）
│   │   ├── objection.model.ts  # 质证意见模型
│   │   ├── defense-material.model.ts # 反证材料模型
│   │   ├── notification.model.ts # 通知模型
│   │   ├── operation-logs.model.ts # 操作日志模型
│   │   └── user.model.ts       # 用户模型
│   │
│   ├── pages/                  # Next.js 页面路由
│   │   ├── _app.tsx            # 应用入口
│   │   ├── index.tsx           # 首页
│   │   ├── login.tsx           # 登录页
│   │   ├── register.tsx        # 注册页
│   │   ├── dashboard.tsx       # 仪表板
│   │   ├── profile.tsx         # 用户资料页
│   │   ├── useAuth.ts          # 认证 Hook
│   │   ├── global.css          # 全局样式
│   │   │
│   │   ├── case/               # 案件相关页面
│   │   │   ├── create-case.tsx         # 创建案件
│   │   │   ├── case-list.tsx           # 案件列表
│   │   │   ├── case-detail.tsx         # 案件详情
│   │   │   ├── case-workflow.tsx       # 案件工作流
│   │   │   ├── update-case.tsx         # 更新案件
│   │   │   └── delete-case.tsx         # 删除案件
│   │   │
│   │   ├── evidence/           # 证据相关页面
│   │   │   ├── add-evidence.tsx        # 添加证据
│   │   │   ├── evidence-list.tsx       # 证据列表
│   │   │   ├── evidence-detail.tsx     # 证据详情
│   │   │   └── update-evidence.tsx     # 更新证据
│   │   │
│   │   ├── correction/         # 补正相关页面
│   │   │   ├── add-correction.tsx      # 添加补正
│   │   │   ├── correction-list.tsx     # 补正列表
│   │   │   ├── correction-detail.tsx   # 补正详情
│   │   │   └── update-correction.tsx   # 更新补正
│   │   │
│   │   ├── objection/          # 质证相关页面
│   │   │   ├── add-objection.tsx       # 添加质证意见
│   │   │   ├── objectionList.tsx       # 质证列表
│   │   │   ├── objection-detail.tsx    # 质证详情
│   │   │   └── handle-objection.tsx    # 处理质证
│   │   │
│   │   ├── defense-material/   # 反证材料页面
│   │   │   ├── add-defense-material.tsx    # 添加反证
│   │   │   ├── defense-material-list.tsx   # 反证列表
│   │   │   └── defense-material-detail.tsx # 反证详情
│   │   │
│   │   ├── notification/       # 通知相关页面
│   │   │   ├── notification-list.tsx   # 通知列表
│   │   │   ├── notification-detail.tsx # 通知详情
│   │   │   └── add-notification.tsx    # 添加通知
│   │   │
│   │   ├── operation-logs/     # 操作日志页面
│   │   │   └── operation-logs-list.tsx # 日志列表
│   │   │
│   │   └── users/              # 用户管理页面
│   │       ├── user-list.tsx           # 用户列表
│   │       └── role-management.tsx     # 角色管理
│   │
│   └── store/                  # 状态管理
│       └── authStore.ts        # 认证状态管理（Zustand）
│
├── public/                     # 静态资源文件
├── next.config.js              # Next.js 配置
├── tailwind.config.ts          # Tailwind CSS 配置
├── tsconfig.json               # TypeScript 配置
├── postcss.config.js           # PostCSS 配置
├── components.json             # UI 组件配置
└── package.json                # 依赖管理
```

### 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **表单**: React Hook Form
- **HTTP 客户端**: Axios
- **区块链**: Ethers.js v6
- **UI 组件**: Lucide React (图标库)
- **PDF 生成**: jsPDF, pdf-lib

### 核心功能模块

1. **认证系统** (`api/auth.api.ts`, `pages/login.tsx`, `store/authStore.ts`)
   - 用户登录/注册
   - JWT Token 管理
   - 状态持久化

2. **案件管理** (`pages/case/`)
   - 案件 CRUD 操作
   - 案件工作流可视化
   - 案件时间线

3. **证据管理** (`pages/evidence/`)
   - 证据上传（支持最大 500MB）
   - 证据详情查看
   - 区块链哈希验证

4. **质证系统** (`pages/objection/`)
   - 质证意见提交
   - 质证状态跟踪
   - 质证处理

5. **区块链集成** (`lib/blockchain.ts`, `components/wallet-connect.tsx`)
   - 钱包连接（MetaMask）
   - 智能合约交互
   - 交易状态监控

---

## ⚙️ Backend 后端目录

### 目录结构

```
backend/
├── src/
│   ├── controllers/            # 控制器层（处理 HTTP 请求）
│   │   ├── auth.controller.ts          # 认证控制器
│   │   ├── case.controller.ts          # 案件控制器
│   │   ├── evidence.controller.ts      # 证据控制器
│   │   ├── correction.controller.ts    # 补正控制器
│   │   ├── objection.controller.ts     # 质证控制器
│   │   ├── defense-material.controller.ts # 反证控制器
│   │   ├── notification.controller.ts  # 通知控制器
│   │   ├── operation-logs.controller.ts # 操作日志控制器
│   │   └── users.controller.ts         # 用户管理控制器
│   │
│   ├── services/               # 业务逻辑层
│   │   ├── case.service.ts             # 案件业务逻辑
│   │   ├── case.helper.service.ts      # 案件辅助服务
│   │   ├── evidence.service.ts         # 证据业务逻辑
│   │   ├── correction.service.ts       # 补正业务逻辑
│   │   └── defense-material.service.ts # 反证业务逻辑
│   │
│   ├── models/                 # 数据模型（MongoDB Schema）
│   │   ├── users.model.ts              # 用户模型
│   │   ├── auth.model.ts               # 认证模型
│   │   ├── case.model.ts               # 案件模型
│   │   ├── case-timeline.model.ts      # 案件时间线模型
│   │   ├── evidence.model.ts           # 证据模型
│   │   ├── correction.model.ts         # 补正模型
│   │   ├── objection.model.ts          # 质证意见模型
│   │   ├── defense-material.model.ts   # 反证材料模型
│   │   ├── notification.model.ts       # 通知模型
│   │   ├── operation-logs.model.ts     # 操作日志模型
│   │   └── role-assignment.model.ts    # 角色分配模型
│   │
│   ├── routes/                 # 路由定义
│   │   ├── auth.router.ts              # 认证路由
│   │   ├── auth-signature.router.ts    # 签名认证路由
│   │   ├── case.router.ts              # 案件路由
│   │   ├── evidence.router.ts          # 证据路由
│   │   ├── correction.router.ts        # 补正路由
│   │   ├── objection.router.ts         # 质证路由
│   │   ├── defense-material.router.ts  # 反证路由
│   │   ├── notifications.router.ts     # 通知路由
│   │   ├── operation-logs.router.ts    # 操作日志路由
│   │   ├── users.router.ts             # 用户路由
│   │   └── export.router.ts            # 导出路由
│   │
│   ├── middleware/             # 中间件
│   │   ├── auth.ts                     # JWT 认证中间件
│   │   ├── rbac.ts                     # 基于角色的访问控制
│   │   └── operation-logs.ts           # 操作日志记录中间件
│   │
│   ├── dto/                    # 数据传输对象（验证）
│   │   ├── case.dto.ts                 # 案件 DTO
│   │   ├── evidence.dto.ts             # 证据 DTO
│   │   ├── correction.dto.ts           # 补正 DTO
│   │   └── defense-material.dto.ts     # 反证 DTO
│   │
│   ├── utils/                  # 工具函数
│   │   ├── jwt.ts                      # JWT 工具
│   │   ├── hash.ts                     # 哈希计算（SHA-256）
│   │   ├── blockchain.ts               # 区块链交互工具
│   │   ├── file-upload.ts              # 文件上传处理
│   │   ├── avatar-upload.ts            # 头像上传
│   │   ├── pdf-export.ts               # PDF 导出
│   │   ├── notification.ts             # 通知工具
│   │   ├── response.ts                 # 响应格式化
│   │   ├── errors.ts                   # 错误处理
│   │   └── cookies.ts                  # Cookie 工具
│   │
│   ├── lib/                    # 第三方库封装
│   │   ├── abi/                        # 智能合约 ABI
│   │   │   └── EvidenceStorage.json    # 存证合约 ABI
│   │   └── contract.ts                 # 合约实例封装
│   │
│   └── app.ts                  # Express 应用入口
│
├── uploads/                    # 文件上传目录
│   └── YYYY/MM/DD/             # 按日期组织的上传文件
│
├── tsconfig.json               # TypeScript 配置
└── package.json                # 依赖管理
```

### 技术栈

- **运行时**: Node.js
- **框架**: Express.js
- **语言**: TypeScript
- **数据库**: MongoDB (Mongoose ODM)
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcryptjs
- **文件上传**: Multer
- **区块链**: Ethers.js v6
- **安全**: Helmet, CORS, Rate Limiting
- **验证**: express-validator
- **PDF**: pdf-lib

### API 架构

采用 **MVC 架构模式**:

```
Request → Route → Middleware → Controller → Service → Model → Database
                              ↓
                          Response
```

1. **Routes** (`routes/`): 定义 API 端点
2. **Middleware** (`middleware/`): 
   - `auth.ts`: JWT 验证
   - `rbac.ts`: 角色权限检查
   - `operation-logs.ts`: 自动记录操作日志
3. **Controllers** (`controllers/`): 处理 HTTP 请求/响应
4. **Services** (`services/`): 业务逻辑处理
5. **Models** (`models/`): MongoDB Schema 定义
6. **DTOs** (`dto/`): 请求数据验证

### 核心功能模块

1. **认证系统** (`controllers/auth.controller.ts`, `middleware/auth.ts`)
   - 用户注册/登录
   - JWT Token 生成与验证
   - 密码加密（bcrypt）

2. **权限控制** (`middleware/rbac.ts`)
   - 基于角色的访问控制（RBAC）
   - 角色：检察官、法官、律师、公安机关、管理员

3. **案件管理** (`controllers/case.controller.ts`, `services/case.service.ts`)
   - 案件 CRUD
   - 案件关联人员管理
   - 案件时间线追踪

4. **证据存证** (`controllers/evidence.controller.ts`, `services/evidence.service.ts`)
   - 文件上传（最大 500MB）
   - SHA-256 哈希计算
   - 区块链存证调用

5. **区块链集成** (`utils/blockchain.ts`, `lib/contract.ts`)
   - 与智能合约交互
   - 证据上链
   - 补正记录上链

6. **操作日志** (`middleware/operation-logs.ts`, `controllers/operation-logs.controller.ts`)
   - 自动记录所有操作
   - 审计追踪

---

## 🔗 Contracts 智能合约目录

### 目录结构

```
contracts/
├── contracts/                 # Solidity 合约源码
│   └── EvidenceStorage.sol   # 存证主合约（包含所有角色功能）
│
├── scripts/                   # 部署脚本
│   └── deploy.ts             # 合约部署脚本
│
├── artifacts/                 # 编译产物
│   ├── build-info/           # 构建信息
│   └── contracts/            # 编译后的合约
│       └── EvidenceStorage.sol/
│           ├── EvidenceStorage.json      # 主合约 ABI
│           ├── AdminFunctions.json       # 管理员功能接口
│           ├── PoliceFunctions.json      # 公安机关功能接口
│           ├── ProsecutorFunctions.json  # 检察官功能接口
│           ├── JudgeFunctions.json       # 法官功能接口
│           └── LawyerFunctions.json      # 律师功能接口
│
├── typechain-types/          # TypeScript 类型定义（自动生成）
│   ├── EvidenceStorage.ts
│   ├── AdminFunctions.ts
│   ├── PoliceFunctions.ts
│   ├── ProsecutorFunctions.ts
│   ├── JudgeFunctions.ts
│   ├── LawyerFunctions.ts
│   └── factories/            # 合约工厂类
│
├── cache/                     # Hardhat 缓存
│   └── solidity-files-cache.json
│
├── hardhat.config.ts         # Hardhat 配置
├── tsconfig.json             # TypeScript 配置
└── package.json              # 依赖管理
```

### 技术栈

- **开发框架**: Hardhat
- **语言**: Solidity 0.8+
- **类型生成**: TypeChain
- **测试**: Mocha/Chai（可选）

### 合约架构

**EvidenceStorage.sol** 是主合约，采用接口分离设计：

- `AdminFunctions`: 管理员功能（用户管理、权限分配）
- `PoliceFunctions`: 公安机关功能（案件创建、证据上传）
- `ProsecutorFunctions`: 检察官功能（案件创建、证据上传、补正）
- `JudgeFunctions`: 法官功能（证据审核、质证处理）
- `LawyerFunctions`: 律师功能（查看证据、提交质证）

### 核心功能

1. **证据存证** (`storeEvidence`)
   - 存储证据哈希到区块链
   - 记录存证时间戳
   - 关联案件 ID

2. **补正记录** (`recordCorrection`)
   - 记录证据补正信息
   - 维护补正链

3. **质证记录** (`recordObjection`)
   - 记录质证意见
   - 记录质证处理结果

4. **权限管理**
   - 角色分配
   - 权限验证

---

## 🔄 数据流

### 证据存证流程

```
用户上传文件
    ↓
前端 (frontend/pages/evidence/add-evidence.tsx)
    ↓
后端 API (backend/routes/evidence.router.ts)
    ↓
控制器 (backend/controllers/evidence.controller.ts)
    ↓
业务逻辑 (backend/services/evidence.service.ts)
    ├─→ 文件存储 (backend/uploads/)
    ├─→ 计算哈希 (backend/utils/hash.ts)
    ├─→ 保存到 MongoDB (backend/models/evidence.model.ts)
    └─→ 调用智能合约 (backend/utils/blockchain.ts)
        ↓
    智能合约 (contracts/contracts/EvidenceStorage.sol)
    ↓
    区块链网络
```

### 用户认证流程

```
用户登录
    ↓
前端 (frontend/pages/login.tsx)
    ↓
API (backend/routes/auth.router.ts)
    ↓
控制器 (backend/controllers/auth.controller.ts)
    ├─→ 验证密码 (bcryptjs)
    ├─→ 生成 JWT (backend/utils/jwt.ts)
    └─→ 返回 Token
    ↓
前端存储 Token (frontend/store/authStore.ts)
    ↓
后续请求携带 Token (frontend/api/api-client.ts)
    ↓
中间件验证 (backend/middleware/auth.ts)
    ↓
RBAC 权限检查 (backend/middleware/rbac.ts)
```

---

## 📝 环境变量配置

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_BLOCKCHAIN_RPC_URL=http://localhost:8545
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

### Backend (.env)

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/evidence_db
JWT_SECRET=your-secret-key
NODE_ENV=development
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=524288000
BLOCKCHAIN_RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=0x...
PRIVATE_KEY=0x...
FRONTEND_URL=http://localhost:3000
```

---

## 🗂️ 关键文件说明

### 前端关键文件

- `frontend/src/pages/_app.tsx`: Next.js 应用入口，配置全局状态
- `frontend/src/store/authStore.ts`: 认证状态管理
- `frontend/src/lib/blockchain.ts`: 区块链交互封装
- `frontend/src/components/layouts/protect-router.tsx`: 路由守卫

### 后端关键文件

- `backend/src/app.ts`: Express 应用配置和路由注册
- `backend/src/middleware/rbac.ts`: 角色权限控制逻辑
- `backend/src/utils/blockchain.ts`: 区块链交互工具
- `backend/src/utils/file-upload.ts`: 文件上传处理

### 合约关键文件

- `contracts/contracts/EvidenceStorage.sol`: 主智能合约
- `contracts/scripts/deploy.ts`: 部署脚本

---

## 🚀 开发建议

1. **前端开发**:
   - 遵循 Next.js 14 App Router 规范
   - 使用 TypeScript 严格模式
   - 组件采用函数式组件 + Hooks
   - 状态管理使用 Zustand

2. **后端开发**:
   - 遵循 RESTful API 设计规范
   - 使用 TypeScript 严格模式
   - 所有数据库操作使用 Service 层
   - 错误处理统一使用 `utils/errors.ts`

3. **合约开发**:
   - 使用 Solidity 0.8+ 版本
   - 遵循 OpenZeppelin 安全实践
   - 合约部署后更新环境变量

4. **代码规范**:
   - 使用 ESLint 进行代码检查
   - 遵循 TypeScript 最佳实践
   - 注释关键业务逻辑

---

## 📚 相关文档

- [README.md](./README.md) - 项目概述和快速开始
- [QUICK_START.md](./QUICK_START.md) - 详细启动指南
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 生产环境部署指南

---

## 🔍 常见目录说明

- `uploads/`: 后端文件上传存储目录（按日期组织）
- `artifacts/`: Hardhat 编译生成的合约文件
- `typechain-types/`: TypeChain 自动生成的 TypeScript 类型
- `node_modules/`: npm 依赖包（不应提交到版本控制）

---

最后更新：2025年1月

