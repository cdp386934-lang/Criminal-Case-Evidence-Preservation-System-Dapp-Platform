# 刑事案件链上存证 DApp 平台

基于 Next.js 14 和区块链技术的刑事案件证据存证系统，支持公安机关、检察官、法官、律师三种角色的完整工作流程。

## 技术栈

- **前端**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Ethers.js
- **后端**: Node.js, Express, TypeScript, MongoDB
- **区块链**: Solidity 0.8+, Hardhat
- **认证**: JWT, RBAC

## 项目结构

```
.
├── frontend/          # Next.js 14 前端应用
├── backend/           # Express 后端服务
├── contracts/         # Solidity 智能合约
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
cd ../contracts && npm install
```

### 2. 配置环境变量

#### 前端 (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_BLOCKCHAIN_RPC_URL=http://localhost:8545
NEXT_PUBLIC_CONTRACT_ADDRESS=你的合约地址
```

#### 后端 (.env)
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/evidence_db
JWT_SECRET=your-secret-key
NODE_ENV=development
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=524288000
BLOCKCHAIN_RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=你的合约地址
PRIVATE_KEY=你的私钥（用于合约调用）
```

#### 合约 (hardhat.config.ts)
```typescript
// 配置你的网络和账户
```

### 3. 部署智能合约

```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.ts --network localhost
```

复制部署后的合约地址，更新到前端和后端的 .env 文件中。

### 4. 启动服务

#### 启动后端
```bash
cd backend
npm run dev
```

#### 启动前端
```bash
cd frontend
npm run dev
```

访问 http://localhost:3000

## 功能模块

### 用户角色
- **检察官**: 上传证据、生成哈希、存证上链
- **法官**: 审核证据、处理质证意见、生成证据清单
- **律师**: 查看证据、提交质证意见、上传反证

### 核心功能
1. 证据上传与存证（支持最大 500MB）
2. 区块链哈希验证
3. 证据补正与追溯
4. 质证意见管理
5. 案件权限隔离
6. 操作日志记录

## 开发指南

详见各子目录的 README.md

## 项目结构

详细的项目结构说明请查看 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

## 快速开始

详细的快速启动指南请查看 [QUICK_START.md](./QUICK_START.md)

## 部署

生产环境部署指南请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 核心功能

### ✅ 已实现功能

1. **用户认证系统**
   - 注册/登录
   - JWT Token 认证
   - 角色权限控制（RBAC）

2. **案件管理**
   - 案件创建（检察官）
   - 案件查询（所有角色）
   - 案件关联人员管理

3. **证据存证**
   - 文件上传（支持最大 500MB）
   - SHA-256 哈希计算
   - 区块链存证
   - 证据补正
   - 证据核验（法官）

4. **质证系统**
   - 质证意见提交（律师）
   - 质证处理（法官）
   - 质证状态跟踪

5. **区块链集成**
   - Solidity 智能合约
   - 证据上链
   - 补正记录
   - 哈希验证

6. **操作日志**
   - 完整的操作记录
   - 审计追踪

## 技术特点

- ✅ Next.js 14 App Router
- ✅ TypeScript 全栈
- ✅ MongoDB 数据库
- ✅ Solidity 智能合约
- ✅ JWT 认证
- ✅ RBAC 权限控制
- ✅ 文件上传与存储
- ✅ 区块链集成