import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { ethers } from 'ethers';

export default function WalletConnect() {
  const { user, setUser } = useAuthStore();
  const [connecting, setConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    if (user?.walletAddress) {
      setWalletAddress(user.walletAddress);
    }
  }, [user]);

  const connectWallet = async () => {
    try {
      setConnecting(true);

      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        
        if (accounts && accounts.length > 0) {
          const address = accounts[0];
          setWalletAddress(address);
          
          // 更新用户信息（这里应该调用API更新后端）
          if (user) {
            setUser({ ...user, walletAddress: address });
          }
        }
      } else {
        alert('请安装 MetaMask 或其他 Web3 钱包');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('连接钱包失败');
    } finally {
      setConnecting(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="flex items-center space-x-2">
      {walletAddress ? (
        <div className="px-3 py-1.5 bg-background-secondary border border-gray-300 text-neutral-900 rounded text-sm font-mono">
          <span className="text-success text-xs mr-2">●</span>
          {formatAddress(walletAddress)}
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={connecting}
          className="px-4 py-1.5 bg-primary-900 text-white rounded hover:bg-primary-800 disabled:opacity-50 text-sm font-medium transition-colors"
        >
          {connecting ? '连接中...' : '连接钱包'}
        </button>
      )}
    </div>
  );
}

