import { ethers } from 'ethers'

// ABI 定义（应与合约保持一致）
const EvidenceStorageABI = [
  "function addEvidence(string memory caseId, string memory hash) public returns (uint256)",
  "function addCorrection(uint256 originalEvidenceId, string memory caseId, string memory newHash, string memory reason) public returns (uint256)",
  "function uploadMaterial(string memory caseId, string memory hash) public returns (uint256)",
  "function isJudge(address account) public view returns (bool)",
  "function isProsecutor(address account) public view returns (bool)",
  "function isLawyer(address account) public view returns (bool)",
  "function getEvidence(uint256 evidenceId) public view returns (string memory hash, address uploader, uint256 timestamp)",
  "function getEvidenceHistory(uint256 evidenceId) public view returns (uint256[] memory, string[] memory, address[] memory, uint256[] memory)",
  "function getCaseEvidences(string memory caseId) public view returns (uint256[] memory)",
  "function verifyEvidence(uint256 evidenceId, string memory hash) public view returns (bool)",
  "event EvidenceAdded(uint256 indexed evidenceId, string indexed caseId, string hash, address indexed uploader, uint256 timestamp)",
  "event CorrectionAdded(uint256 indexed originalEvidenceId, uint256 indexed correctionEvidenceId, address indexed corrector, uint256 timestamp)",
  "event MaterialUploaded(uint256 indexed materialId, string indexed caseId, string hash, address indexed uploader, uint256 timestamp)"
]

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ''
const RPC_URL = process.env.NEXT_PUBLIC_BLOCKCHAIN_RPC_URL || 'http://localhost:8545'

// 获取合约实例
export const getContract = async () => {
  if (typeof window === 'undefined') return null

  if (!window.ethereum) {
    throw new Error('请安装 MetaMask 或其他 Web3 钱包')
  }

  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  return new ethers.Contract(CONTRACT_ADDRESS, EvidenceStorageABI, signer)
}

// 连接钱包
export const connectWallet = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('请安装 MetaMask 或其他 Web3 钱包')
  }

  try {
    // 请求账户访问权限
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    })
    
    if (!accounts || accounts.length === 0) {
      throw new Error('未获取到账户，请授权访问')
    }

    const address = accounts[0]
    console.log('✅ [钱包] 连接成功，当前地址:', address)
    return address
  } catch (error: any) {
    console.error('❌ [钱包] 连接失败:', error)
    
    // 处理用户拒绝的情况
    if (error.code === 4001) {
      throw new Error('用户拒绝了钱包连接请求')
    }
    
    throw new Error(error.message || '钱包连接失败')
  }
}

// 获取当前账户
export const getCurrentAccount = async () => {
  if (typeof window === 'undefined' || !window.ethereum) return null

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    })
    return accounts && accounts.length > 0 ? accounts[0] : null
  } catch (error) {
    console.error('❌ [钱包] 获取当前账户失败:', error)
    return null
  }
}

// 断开钱包连接
export const disconnectWallet = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    return
  }

  try {
    // 清除 localStorage 中的钱包信息（如果有）
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('walletAddress')
      localStorage.removeItem('walletConnected')
    }

    // 注意：MetaMask 本身不支持程序化断开连接
    // 但我们可以清除本地状态
    // 如果钱包支持 disconnect 方法，可以调用它
    if (window.ethereum.disconnect && typeof window.ethereum.disconnect === 'function') {
      await window.ethereum.disconnect()
    }

    console.log('✅ [钱包] 已清除本地钱包状态')
  } catch (error) {
    console.error('❌ [钱包] 断开钱包时出错:', error)
    // 即使出错也继续，因为我们主要是清除本地状态
  }
}

// 添加证据到区块链
export const addEvidence = async (caseId: string, hash: string) => {
  const contract = await getContract()
  if (!contract) throw new Error('合约未初始化')

  const tx = await contract.addEvidence(caseId, hash)
  const receipt = await tx.wait()

  // 从事件中获取证据ID
  const event = receipt.logs.find((log: any) => {
    try {
      const parsed = contract.interface.parseLog(log)
      return parsed?.name === 'EvidenceAdded'
    } catch {
      return false
    }
  })

  if (event) {
    const parsed = contract.interface.parseLog(event)
    return {
      evidenceId: Number(parsed?.args[0]),
      txHash: receipt.hash,
    }
  }

  return { evidenceId: 0, txHash: receipt.hash }
}

// 添加补正到区块链
export const addCorrection = async (
  originalEvidenceId: number,
  caseId: string,
  newHash: string,
  reason: string
) => {
  const contract = await getContract()
  if (!contract) throw new Error('合约未初始化')

  const tx = await contract.addCorrection(originalEvidenceId, caseId, newHash, reason)
  const receipt = await tx.wait()

  // 从事件中获取补正证据ID
  const event = receipt.logs.find((log: any) => {
    try {
      const parsed = contract.interface.parseLog(log)
      return parsed?.name === 'CorrectionAdded'
    } catch {
      return false
    }
  })

  if (event) {
    const parsed = contract.interface.parseLog(event)
    return {
      correctionEvidenceId: Number(parsed?.args[1]),
      txHash: receipt.hash,
    }
  }

  return { correctionEvidenceId: 0, txHash: receipt.hash }
}

// 获取证据信息
export const getEvidence = async (evidenceId: number) => {
  const contract = await getContract()
  if (!contract) throw new Error('合约未初始化')

  const evidence = await contract.getEvidence(evidenceId)
  return {
    hash: evidence[0],
    uploader: evidence[1],
    timestamp: Number(evidence[2]),
  }
}

// 上传材料（仅律师）
export const uploadMaterial = async (caseId: string, hash: string) => {
  const contract = await getContract()
  if (!contract) throw new Error('合约未初始化')

  const tx = await contract.uploadMaterial(caseId, hash)
  const receipt = await tx.wait()

  // 从事件中获取材料ID
  const event = receipt.logs.find((log: any) => {
    try {
      const parsed = contract.interface.parseLog(log)
      return parsed?.name === 'MaterialUploaded'
    } catch {
      return false
    }
  })

  if (event) {
    const parsed = contract.interface.parseLog(event)
    return {
      materialId: Number(parsed?.args[0]),
      txHash: receipt.hash,
    }
  }

  return { materialId: 0, txHash: receipt.hash }
}

// 检查地址是否为法官
export const checkIsJudge = async (address: string): Promise<boolean> => {
  const contract = await getContract()
  if (!contract) throw new Error('合约未初始化')
  return await contract.isJudge(address)
}

// 检查地址是否为检察官
export const checkIsProsecutor = async (address: string): Promise<boolean> => {
  const contract = await getContract()
  if (!contract) throw new Error('合约未初始化')
  return await contract.isProsecutor(address)
}

// 检查地址是否为律师
export const checkIsLawyer = async (address: string): Promise<boolean> => {
  const contract = await getContract()
  if (!contract) throw new Error('合约未初始化')
  return await contract.isLawyer(address)
}

// 验证证据哈希
export const verifyEvidence = async (evidenceId: number, hash: string) => {
  const contract = await getContract()
  if (!contract) throw new Error('合约未初始化')

  return await contract.verifyEvidence(evidenceId, hash)
}

// 监听事件
export const listenToEvents = (callback: (event: any) => void) => {
  if (typeof window === 'undefined') return

  const provider = new ethers.JsonRpcProvider(RPC_URL)
  const contract = new ethers.Contract(CONTRACT_ADDRESS, EvidenceStorageABI, provider)

  contract.on('EvidenceAdded', (evidenceId, caseId, hash, uploader, timestamp, event) => {
    callback({
      type: 'EvidenceAdded',
      evidenceId: Number(evidenceId),
      caseId,
      hash,
      uploader,
      timestamp: Number(timestamp),
      txHash: event.transactionHash,
    })
  })

  contract.on('CorrectionAdded', (originalId, correctionId, corrector, timestamp, event) => {
    callback({
      type: 'CorrectionAdded',
      originalEvidenceId: Number(originalId),
      correctionEvidenceId: Number(correctionId),
      corrector,
      timestamp: Number(timestamp),
      txHash: event.transactionHash,
    })
  })
}

// 扩展 Window 类型
declare global {
  interface Window {
    ethereum?: any
  }
}

