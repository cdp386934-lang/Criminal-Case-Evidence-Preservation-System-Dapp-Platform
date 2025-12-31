# 快速启动指南

## 一键安装所有依赖

```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd frontend && npm install && cd ..

# 安装后端依赖
cd backend && npm install && cd ..

# 安装合约依赖
cd contracts && npm install && cd ..
```

## 快速启动（开发环境）

### 1. 启动 MongoDB
确保 MongoDB 服务正在运行。

### 2. 启动本地区块链节点（可选）
```bash
cd contracts
npx hardhat node
```
保持此终端窗口打开。

### 3. 部署智能合约
在新的终端窗口：
```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.ts --network localhost
```
复制输出的合约地址。

### 4. 配置环境变量

**backend/.env**:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/evidence_db
JWT_SECRET=dev-secret-key-change-in-production
NODE_ENV=development
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=524288000
BLOCKCHAIN_RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=你的合约地址
PRIVATE_KEY=你的私钥（从 hardhat node 获取）
FRONTEND_URL=http://localhost:3000
```

**frontend/.env.local**:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_BLOCKCHAIN_RPC_URL=http://localhost:8545
NEXT_PUBLIC_CONTRACT_ADDRESS=你的合约地址
```

### 5. 启动后端
```bash
cd backend
npm run dev
```

### 6. 启动前端
```bash
cd frontend
npm run dev
```

### 7. 访问应用
打开浏览器访问 http://localhost:3000

## 测试账号

注册新账号时选择角色：
- **检察官**: 可以创建案件和上传证据
- **法官**: 可以审核证据和处理质证意见
- **律师**: 可以查看证据和提交质证意见
- **公安机关**:可以创建案件和上传证据
- **管理员**:可以管理用户权限

## 常见问题

### 1. MongoDB 连接失败
- 检查 MongoDB 服务是否运行
- 检查 MONGODB_URI 配置

### 2. 合约调用失败
- 检查合约地址是否正确
- 检查私钥是否有足够的余额（本地节点会自动提供测试账户）
- 检查 RPC URL 是否可访问

### 3. 文件上传失败
- 检查 uploads 目录权限
- 检查文件大小是否超过限制

### 4. 前端无法连接后端
- 检查后端服务是否运行
- 检查 CORS 配置
- 检查 API_URL 配置

## 下一步

1. 阅读 `PROJECT_STRUCTURE.md` 了解项目结构
2. 阅读 `DEPLOYMENT.md` 了解生产环境部署
3. 开始使用系统进行测试

