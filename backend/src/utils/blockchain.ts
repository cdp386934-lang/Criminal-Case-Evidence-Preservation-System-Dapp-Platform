import { ethers } from 'ethers';
// 注意：需要从 contracts 目录复制 artifacts 或使用 ABI 定义
// 这里使用内联 ABI 定义（实际部署时应从编译后的文件读取）
const EvidenceStorageABI = [
  "function addEvidence(string memory caseId, string memory hash) public returns (uint256)",
  "function addCorrection(uint256 originalEvidenceId, string memory caseId, string memory newHash, string memory reason) public returns (uint256)",
  "function uploadMaterial(string memory caseId, string memory hash) public returns (uint256)",
  "function setJudge(address judgeAddress) public",
  "function setProsecutor(address prosecutorAddress) public",
  "function setLawyer(address lawyerAddress) public",
  "function isJudge(address account) public view returns (bool)",
  "function isProsecutor(address account) public view returns (bool)",
  "function isLawyer(address account) public view returns (bool)",
  "function getEvidence(uint256 evidenceId) public view returns (string memory hash, address uploader, uint256 timestamp)",
  "function getEvidenceHistory(uint256 evidenceId) public view returns (uint256[] memory, string[] memory, address[] memory, uint256[] memory)",
  "function getCaseEvidences(string memory caseId) public view returns (uint256[] memory)",
  "function verifyEvidence(uint256 evidenceId, string memory hash) public view returns (bool)",
  "event EvidenceAdded(uint256 indexed evidenceId, string indexed caseId, string hash, address indexed uploader, uint256 timestamp)",
  "event CorrectionAdded(uint256 indexed originalEvidenceId, uint256 indexed correctionEvidenceId, address indexed corrector, uint256 timestamp)",
  "event MaterialUploaded(uint256 indexed materialId, string indexed caseId, string hash, address indexed uploader, uint256 timestamp)",
  "event RoleGranted(address indexed account, string role)"
];

const RPC_URL = process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

let provider: ethers.Provider;
let wallet: ethers.Wallet;
let contract: ethers.Contract;

// 初始化区块链连接
export const initBlockchain = () => {
  try {
    provider = new ethers.JsonRpcProvider(RPC_URL);

    if (PRIVATE_KEY) {
      wallet = new ethers.Wallet(PRIVATE_KEY, provider);
      contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        EvidenceStorageABI,
        wallet
      );
    } else {
      // 如果没有私钥，使用只读模式
      contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        EvidenceStorageABI,
        provider
      );
    }

    console.log('✅ Blockchain initialized');
  } catch (error) {
    console.error('❌ Blockchain initialization error:', error);
  }
};

// 添加证据到区块链
export const addEvidenceToBlockchain = async (
  caseId: string,
  hash: string
): Promise<{ evidenceId: number; txHash: string }> => {
  try {
    if (!contract || !wallet) {
      throw new Error('Blockchain not initialized or no wallet configured');
    }

    const tx = await contract.addEvidence(caseId, hash);
    const receipt = await tx.wait();

    // 从事件中获取证据ID
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === 'EvidenceAdded';
      } catch {
        return false;
      }
    });

    let evidenceId = 0;
    if (event) {
      const parsed = contract.interface.parseLog(event);
      evidenceId = Number(parsed?.args[0]);
    }

    return {
      evidenceId,
      txHash: receipt.hash,
    };
  } catch (error: any) {
    console.error('Blockchain transaction error:', error);
    throw new Error(`Failed to add evidence to blockchain: ${error.message}`);
  }
};

// 添加补正证据
export const addCorrectionToBlockchain = async (
  originalEvidenceId: number,
  caseId: string,
  newHash: string,
  reason: string
): Promise<{ correctionEvidenceId: number; txHash: string }> => {
  try {
    if (!contract || !wallet) {
      throw new Error('Blockchain not initialized or no wallet configured');
    }

    const tx = await contract.addCorrection(originalEvidenceId, caseId, newHash, reason);
    const receipt = await tx.wait();

    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === 'CorrectionAdded';
      } catch {
        return false;
      }
    });

    let correctionEvidenceId = 0;
    if (event) {
      const parsed = contract.interface.parseLog(event);
      correctionEvidenceId = Number(parsed?.args[1]);
    }

    return {
      correctionEvidenceId,
      txHash: receipt.hash,
    };
  } catch (error: any) {
    console.error('Blockchain correction error:', error);
    throw new Error(`Failed to add correction to blockchain: ${error.message}`);
  }
};

// 获取证据信息
export const getEvidenceFromBlockchain = async (evidenceId: number) => {
  try {
    if (!contract) {
      throw new Error('Blockchain not initialized');
    }

    const evidence = await contract.getEvidence(evidenceId);
    return {
      hash: evidence[0],
      uploader: evidence[1],
      timestamp: Number(evidence[2]),
    };
  } catch (error: any) {
    console.error('Get evidence error:', error);
    throw new Error(`Failed to get evidence from blockchain: ${error.message}`);
  }
};

// 验证证据哈希
export const verifyEvidenceHash = async (
  evidenceId: number,
  hash: string
): Promise<boolean> => {
  try {
    if (!contract) {
      throw new Error('Blockchain not initialized');
    }

    return await contract.verifyEvidence(evidenceId, hash);
  } catch (error: any) {
    console.error('Verify evidence error:', error);
    return false;
  }
};

// 获取案件的所有证据ID
export const getCaseEvidencesFromBlockchain = async (caseId: string): Promise<number[]> => {
  try {
    if (!contract) {
      throw new Error('Blockchain not initialized');
    }

    const evidenceIds = await contract.getCaseEvidences(caseId);
    return evidenceIds.map((id: any) => Number(id));
  } catch (error: any) {
    console.error('Get case evidences error:', error);
    return [];
  }
};

/**
 * 授权法官角色（仅管理员）
 * @param judgeAddress 法官钱包地址
 */
export const grantJudgeRole = async (judgeAddress: string): Promise<{ txHash: string }> => {
  try {
    if (!contract || !wallet) {
      throw new Error('Blockchain not initialized or no wallet configured');
    }

    console.log(`🔐 [授权] 开始授权法官角色: ${judgeAddress}`);
    const tx = await contract.setJudge(judgeAddress);
    const receipt = await tx.wait();
    
    console.log(`✅ [授权] 法官角色授权成功: ${judgeAddress}, TX: ${receipt.hash}`);
    return { txHash: receipt.hash };
  } catch (error: any) {
    console.error('❌ [授权] 授权法官角色失败:', error);
    throw new Error(`Failed to grant judge role: ${error.message}`);
  }
};

export const revokeJudgeRole = async (judgeAddress: string): Promise<{ txHash: string }> => {
  try {
    if (!contract || !wallet) {
      throw new Error('Blockchain not initialized or no wallet configured');
    }
    const tx = await contract.revokeJudge(judgeAddress);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  } catch (error: any) {
    console.error('❌ [撤销] 撤销法官角色失败:', error);
    throw new Error(`Failed to revoke judge role: ${error.message}`);
  }
};

export const checkIsJudge = async (address: string): Promise<boolean> => {
  try {
    if (!contract) {
      throw new Error('Blockchain not initialized');
    }
    return await contract.isJudge(address);
  } catch (error: any) {
    console.error('Check judge role error:', error);
    return false;
  }
};

/**
 * 授权检察官角色（仅管理员）
 * @param prosecutorAddress 检察官钱包地址
 */
export const grantProsecutorRole = async (prosecutorAddress: string): Promise<{ txHash: string }> => {
  try {
    if (!contract || !wallet) {
      throw new Error('Blockchain not initialized or no wallet configured');
    }

    console.log(`🔐 [授权] 开始授权检察官角色: ${prosecutorAddress}`);
    const tx = await contract.setProsecutor(prosecutorAddress);
    const receipt = await tx.wait();
    
    console.log(`✅ [授权] 检察官角色授权成功: ${prosecutorAddress}, TX: ${receipt.hash}`);
    return { txHash: receipt.hash };
  } catch (error: any) {
    console.error('❌ [授权] 授权检察官角色失败:', error);
    throw new Error(`Failed to grant prosecutor role: ${error.message}`);
  }
};

export const revokeProsecutorRole = async (prosecutorAddress: string): Promise<{ txHash: string }> => {
  try {
    if (!contract || !wallet) {
      throw new Error('Blockchain not initialized or no wallet configured');
    }
    const tx = await contract.revokeProsecutor(prosecutorAddress);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  } catch (error: any) {
    console.error('❌ [撤销] 撤销检察官角色失败:', error);
    throw new Error(`Failed to revoke prosecutor role: ${error.message}`);
  }
};

export const checkIsProsecutor = async (address: string): Promise<boolean> => {
  try {
    if (!contract) {
      throw new Error('Blockchain not initialized');
    }
    return await contract.isProsecutor(address);
  } catch (error: any) {
    console.error('Check prosecutor role error:', error);
    return false;
  }
};

/**
 * 授权律师角色（仅管理员）
 * @param lawyerAddress 律师钱包地址
 */
export const grantLawyerRole = async (lawyerAddress: string): Promise<{ txHash: string }> => {
  try {
    if (!contract || !wallet) {
      throw new Error('Blockchain not initialized or no wallet configured');
    }

    console.log(`🔐 [授权] 开始授权律师角色: ${lawyerAddress}`);
    const tx = await contract.setLawyer(lawyerAddress);
    const receipt = await tx.wait();
    
    console.log(`✅ [授权] 律师角色授权成功: ${lawyerAddress}, TX: ${receipt.hash}`);
    return { txHash: receipt.hash };
  } catch (error: any) {
    console.error('❌ [授权] 授权律师角色失败:', error);
    throw new Error(`Failed to grant lawyer role: ${error.message}`);
  }
};

export const revokeLawyerRole = async (lawyerAddress: string): Promise<{ txHash: string }> => {
  try {
    if (!contract || !wallet) {
      throw new Error('Blockchain not initialized or no wallet configured');
    }
    const tx = await contract.revokeLawyer(lawyerAddress);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  } catch (error: any) {
    console.error('❌ [撤销] 撤销律师角色失败:', error);
    throw new Error(`Failed to revoke lawyer role: ${error.message}`);
  }
};

export const checkIsLawyer = async (address: string): Promise<boolean> => {
  try {
    if (!contract) {
      throw new Error('Blockchain not initialized');
    }
    return await contract.isLawyer(address);
  } catch (error: any) {
    console.error('Check lawyer role error:', error);
    return false;
  }
};

/**
 * 授权公安机关角色（仅管理员）
 * @param policeAddress 公安机关钱包地址
 */
export const grantPoliceRole = async (policeAddress: string): Promise<{ txHash: string }> => {
  try {
    if (!contract || !wallet) {
      throw new Error('Blockchain not initialized or no wallet configured');
    }

    console.log(`🔐 [授权] 开始授权公安机关角色: ${policeAddress}`);
    const tx = await contract.setLawyer(policeAddress);
    const receipt = await tx.wait();
    
    console.log(`✅ [授权] 公安机关角色授权成功: ${policeAddress}, TX: ${receipt.hash}`);
    return { txHash: receipt.hash };
  } catch (error: any) {
    console.error('❌ [授权] 授权公安机关角色失败:', error);
    throw new Error(`Failed to grant lawyer role: ${error.message}`);
  }
};

export const revokePoliceRole = async (policeAddress: string): Promise<{ txHash: string }> => {
  try {
    if (!contract || !wallet) {
      throw new Error('Blockchain not initialized or no wallet configured');
    }
    const tx = await contract.revokePolice(policeAddress);
    const receipt = await tx.wait();
    return { txHash: receipt.hash };
  }catch (error: any) {
    console.error('❌ [撤销] 撤销公安机关角色失败:', error);
    throw new Error(`Failed to revoke police role: ${error.message}`);
  }
};

export const checkIsPolice = async (address: string): Promise<boolean> => {
  try {
    if (!contract) {
      throw new Error('Blockchain not initialized');
    }
    return await contract.isPolice(address);
  } catch (error: any) {
    console.error('Check lawyer role error:', error);
    return false;
  }
};

/**
 * 上传辩护材料到区块链（仅律师）
 * @param caseId 案件ID
 * @param hash 文件哈希
 * @returns 材料ID和交易哈希
 */
export const uploadMaterialToBlockchain = async (
  caseId: string,
  hash: string
): Promise<{ materialId: number; txHash: string }> => {
  try {
    if (!contract || !wallet) {
      throw new Error('Blockchain not initialized or no wallet configured');
    }

    const tx = await contract.uploadMaterial(caseId, hash);
    const receipt = await tx.wait();

    // 从事件中获取材料ID
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === 'MaterialUploaded';
      } catch {
        return false;
      }
    });

    let materialId = 0;
    if (event) {
      const parsed = contract.interface.parseLog(event);
      materialId = Number(parsed?.args[0]);
    }

    return {
      materialId,
      txHash: receipt.hash,
    };
  } catch (error: any) {
    console.error('Blockchain material upload error:', error);
    throw new Error(`Failed to upload material to blockchain: ${error.message}`);
  }
};

// 初始化时调用
initBlockchain();

