import { ethers } from 'ethers';
// 直接复用 Hardhat 编译产物中的 ABI，避免手动维护
// 路径相对于 backend/src 目录
// eslint-disable-next-line @typescript-eslint/no-var-requires
const EvidenceStorageArtifact = require('../../contracts/artifacts/contracts/EvidenceStorage.sol/EvidenceStorage.json');

const RPC_URL =
  process.env.RPC_URL ||
  process.env.BLOCKCHAIN_RPC_URL ||
  'http://localhost:8545';

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';

const PRIVATE_KEY = process.env.PRIVATE_KEY;

export const provider = new ethers.JsonRpcProvider(RPC_URL);

export const signer = PRIVATE_KEY
  ? new ethers.Wallet(PRIVATE_KEY, provider)
  : undefined;

export const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  EvidenceStorageArtifact.abi,
  signer ?? provider
);

export const getReadOnlyContract = (customProvider?: ethers.Provider) => {
  const readProvider = customProvider ?? provider;
  return new ethers.Contract(
    CONTRACT_ADDRESS,
    EvidenceStorageArtifact.abi,
    readProvider
  );
};


