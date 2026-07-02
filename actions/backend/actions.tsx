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
  const INFURA_PROJECT_ID = env.INFURA_PROJECT_ID || 'YOUR_INFURA_PROJECT_ID';
  const provider = new ethers.InfuraProvider('mainnet', INFURA_PROJECT_ID);
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
