'use client';
import { Button } from '@/components/ui/button';
import { runMyScript } from './actions';
import { Link } from 'lucide-react';

export function ExecuteButton() {
  const handleAction = async () => {
    const result = await runMyScript();
    console.log(result.output);
  };

  // return <button onClick={handleAction}>Run Shell Script</button>;
  return (
    <Button size="lg" onClick={handleAction}>
      <Link href="#"></Link>Execute Command
    </Button>
  );
}
