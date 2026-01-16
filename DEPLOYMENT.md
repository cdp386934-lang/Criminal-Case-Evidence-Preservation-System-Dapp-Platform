# 部署指南

## 前置要求

- Node.js 18+
- MongoDB 4.4+
- 区块链节点（本地 Hardhat 或测试网）

## 1. 安装依赖

```bash
# 根目录
npm install

# 前端
cd frontend
npm install

# 后端
cd ../backend
npm install

# 智能合约
cd ../contracts
npm install
```

## 2. 配置环境变量

### 后端配置 (backend/.env)

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/evidence_db
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=524288000
BLOCKCHAIN_RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=你的合约地址
PRIVATE_KEY=你的私钥（用于合约调用）
FRONTEND_URL=http://localhost:3000
```

### 前端配置 (frontend/.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_BLOCKCHAIN_RPC_URL=http://localhost:8545
NEXT_PUBLIC_CONTRACT_ADDRESS=你的合约地址
```

**重要**: `NEXT_PUBLIC_API_URL` 必须包含 `/api` 后缀，或者代码会自动添加。

### 合约配置 (contracts/.env)

```env
SEPOLIA_RPC_URL=你的测试网RPC（如使用测试网）
PRIVATE_KEY=部署账户私钥
```

## 3. 启动本地区块链节点（可选）

```bash
cd contracts
npx hardhat node
```

这将启动一个本地 Hardhat 节点，默认在 http://localhost:8545

## 4. 部署智能合约

```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.ts --network localhost
```

复制输出的合约地址，更新到后端和前端的 .env 文件中。

## 5. 启动 MongoDB

确保 MongoDB 服务正在运行：

```bash
# macOS/Linux
mongod

# Windows
# 启动 MongoDB 服务
```

## 6. 启动后端服务

```bash
cd backend
npm run dev
```

后端将在 http://localhost:3001 启动

## 7. 启动前端应用

```bash
cd frontend
npm run dev
```

前端将在 http://localhost:3000 启动

## 8. 访问应用

打开浏览器访问 http://localhost:3000

## 生产环境部署

### 后端部署

1. 构建后端：
```bash
cd backend
npm run build
```

2. 使用 PM2 或其他进程管理器：
```bash
pm2 start dist/index.js --name evidence-backend
```

### 前端部署

1. 构建前端：
```bash
cd frontend
npm run build
```

2. 使用 Next.js 生产服务器：
```bash
npm start
```

或部署到 Vercel/Netlify 等平台。

### 智能合约部署到测试网

```bash
cd contracts
npx hardhat run scripts/deploy.ts --network sepolia
```

## 注意事项

1. **安全**：
   - 生产环境必须更改 JWT_SECRET
   - 私钥必须妥善保管，不要提交到代码仓库
   - 使用环境变量管理敏感信息

2. **数据库**：
   - 生产环境建议使用 MongoDB Atlas 或自建 MongoDB 集群
   - 定期备份数据库

3. **文件存储**：
   - 生产环境建议使用对象存储（如 AWS S3、阿里云 OSS）
   - 修改 `backend/src/utils/fileUpload.ts` 以支持云存储

4. **区块链**：
   - 生产环境建议使用联盟链或私有链
   - 确保有足够的 gas 费用

