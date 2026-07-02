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

// NOTE: MetaMask (window.ethereum) lives in the browser, so the wallet must be
// connected in a Client Component and the resolved address passed in here.
// export async function queryBlockchain(address: string) {
export async function queryBlockchain() {
  // 1. Connect to Infura (e.g., mainnet, Sepolia network)
  const INFURA_PROJECT_ID = env.INFURA_PROJECT_ID || 'YOUR_INFURA_PROJECT_ID';
  const provider = new ethers.InfuraProvider('mainnet', INFURA_PROJECT_ID);

  // // 2. Fetch the balance in Wei from Infura (using the MetaMask address)
  const balanceInWei = await provider.getBalance(env.METAMASK_ADDRESS || 'YOUR_METAMASK_ADDRESS');

  console.log('Balance in Wei:', balanceInWei.toString());
  console.log('Balance in Ether:', ethers.formatEther(balanceInWei));

  try {
    const blockNumber = await provider.getBlockNumber();
    return { 'Current block number': blockNumber };
  } catch (error) {
    const errorMessage =
      typeof error === 'object' && error !== null && 'message' in error
        ? (error as { message: string }).message
        : String(error);
    return { success: false, error: errorMessage };
  }
}
