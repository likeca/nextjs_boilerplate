'use client';

import { Button } from '@/components/ui/button';
import { runMyScript, queryBlockchain } from '@/actions/backend/actions';
import { useState as reactUseState } from 'react';

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
