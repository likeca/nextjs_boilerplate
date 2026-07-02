'use server';

import { exec } from 'child_process';
import { env } from 'process';
import { promisify } from 'util';

const { ethers } = require('ethers');

const execPromise = promisify(exec);

export async function runMyScript() {
  try {
    // Ensure your script has execution permissions (chmod +x)
    const { stdout, stderr } = await execPromise('ls -al');
    if (stderr) {
      console.error(`Script error: ${stderr}`);
    }
    return { success: true, output: stdout };
  } catch (error) {
    const errorMessage =
      typeof error === 'object' && error !== null && 'message' in error
        ? (error as { message: string }).message
        : String(error);
    return { success: false, error: errorMessage };
  }
}

export async function queryBlockchain() {
  try {
    // 1. Connect to Infura (e.g., Mainnet, Sepolia network)
    const INFURA_PROJECT_ID = env.INFURA_PROJECT_ID || 'YOUR_INFURA_PROJECT_ID';
    const provider = new ethers.InfuraProvider('mainnet', INFURA_PROJECT_ID);

    // 2. Fetch the balance in Wei from Infura for the given metamask wallet address
    const metamaskWalletAddress = env.METAMASK_WALLET_ADDRESS || 'YOUR_METAMASK_WALLET_ADDRESS';
    const balanceInWei = await provider.getBalance(metamaskWalletAddress);
    const blockNumber = await provider.getBlockNumber();

    console.log('Balance in Wei:', balanceInWei.toString());
    console.log('Balance in Ether:', ethers.formatEther(balanceInWei));

    return {
      success: true,
      // address: metamaskWalletAddress,
      balanceWei: balanceInWei.toString(),
      balanceEther: ethers.formatEther(balanceInWei),
      blockNumber,
    };
  } catch (error) {
    const errorMessage =
      typeof error === 'object' && error !== null && 'message' in error
        ? (error as { message: string }).message
        : String(error);
    return { success: false, error: errorMessage };
  }
}
