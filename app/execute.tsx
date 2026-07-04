'use client';

import { Button } from '@/components/ui/button';
import { runMyScript, queryBlockchain } from '@/actions/backend/actions';
import { useState as reactUseState } from 'react';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<any>;
      isMetaMask?: boolean;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

export function BackendExecuteButton() {
  const [result, setResult] = reactUseState<string | null>(null);

  const handleAction = async () => {
    const res = await runMyScript();
    setResult(res.output ?? null);
  };

  return (
    <div className="flex flex-col gap-4">
      <Button size="lg" onClick={handleAction}>
        Backend Execute Command
      </Button>
      {result && <pre className="text-left p-4 rounded text-sm overflow-auto">{result}</pre>}
    </div>
  );
}

export function InfuraButton() {
  const [result, setResult] = reactUseState<string | null>(null);

  const handleAction = async () => {
    const res = await queryBlockchain();
    setResult(res ? JSON.stringify(res, null, 2) : null);
  };

  return (
    <div className="flex flex-col gap-4">
      <Button size="lg" onClick={handleAction}>
        Blockchain Balance
      </Button>
      {result && <pre className="text-left p-4 rounded text-sm overflow-auto">{result}</pre>}
    </div>
  );
}

export async function signBlockchain() {
  try {
    if (typeof window.ethereum !== 'undefined') {
      console.log('Ethereum wallet is installed!');

      // Request account access
      window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then((accounts) => {
          console.log('Connected account:', accounts[0]);
        })
        .catch((error) => {
          console.error('User rejected the request or error occurred');
        });
    } else {
      console.log('Please install an Ethereum wallet!');
    }
  } catch (error) {
    const errorMessage =
      typeof error === 'object' && error !== null && 'message' in error
        ? (error as { message: string }).message
        : String(error);
    return { success: false, error: errorMessage };
  }
}

export function SignButton() {
  const [result, setResult] = reactUseState<string | null>(null);

  const handleAction = async () => {
    const res = await signBlockchain();
    setResult(res ? JSON.stringify(res, null, 2) : null);
  };

  return (
    <div className="flex flex-col gap-4">
      <Button size="lg" onClick={handleAction}>
        Sign Blockchain
      </Button>
      {result && <pre className="text-left p-4 rounded text-sm overflow-auto">{result}</pre>}
    </div>
  );
}
