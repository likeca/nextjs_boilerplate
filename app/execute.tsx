'use client';
import { Button } from '@/components/ui/button';
import { runMyScript } from '@/actions/backend/actions';
import { Link } from 'lucide-react';
import { useState as reactUseState } from 'react';

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

// Test
// export function ToggleSwitch() {
//   const [isOn, setIsOn] = useState(true);   // or false for default off

//   const handleToggle = () => {
//     setIsOn(!isOn);
//   };

//   return (
//     <div className="toggle-container">
//       <div
//         className={`toggle-track ${isOn ? 'bg-blue-600' : 'bg-gray-600'}`}
//         onClick={handleToggle}
//       >
//         <div className={`toggle-knob ${isOn ? 'translate-x-6' : 'translate-x-0'}`} />
//       </div>
//     </div>
//   );
// }

// const useState: typeof reactUseState = reactUseState;