import { motion } from "motion/react";
import React, { useRef, useState } from "react";

const Roulette: React.FC = () => {
  const N = 100;
  const slice = 360 / N;
  const R = 240;
  const rText = 200;
  const svgRef = useRef<SVGSVGElement>(null);

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [demo, setDemo] = useState(false);
  const [demoNumber, setDemoNumber] = useState<number | null>(null);
  const [seed] = useState(() => Date.now().toString(36) + "-" + Math.floor(Math.random()*1e9).toString(36));

  const cryptoInt = (min: number, max: number) => {
    const range = max - min + 1;
    const buf = new Uint32Array(1);
    let x: number;
    const maxUnbiased = Math.floor(0xFFFFFFFF / range) * range;
    do {
      crypto.getRandomValues(buf);
      x = buf[0];
    } while (x >= maxUnbiased);
    return min + (x % range);
  };

  const spinToNumber = (n: number) => {
    const turns = 6 + cryptoInt(0, 4);
    const center = (n - 1) * slice + slice / 2;
    let target = turns * 360 + (270 - center);
    target = Math.round(target * 1000) / 1000;

    setSpinning(true);
    setResult(null);
    setRotation(target);

    setTimeout(() => {
      setSpinning(false);
      setResult(n);
    }, 4600);
  };

  const handleSpin = () => {
    if (spinning) return;
    if (demo) {
      if (!demoNumber || demoNumber < 1 || demoNumber > 100) {
        alert("Ingresa un número DEMO entre 1 y 100");
        return;
      }
      spinToNumber(demoNumber);
    } else {
      spinToNumber(cryptoInt(1, 100));
    }
  };

  const polarToCartesian = (r: number, angle: number) => {
    const rad = (angle - 90) * (Math.PI / 180);
    return { x: r * Math.cos(rad), y: r * Math.sin(rad) };
  };

  const describeArc = (r: number, start: number, end: number) => {
    const startP = polarToCartesian(r, end);
    const endP = polarToCartesian(r, start);
    const largeArc = end - start <= 180 ? 0 : 1;
    return `M 0 0 L ${startP.x} ${startP.y} A ${r} ${r} 0 ${largeArc} 0 ${endP.x} ${endP.y} Z`;
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <h1 className="text-2xl font-bold">Ruleta 1–100</h1>
      <div className="relative w-[520px] h-[520px]">
        <div className="absolute left-1/2 -top-4 -translate-x-1/2">
          <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-b-[22px] border-b-black border-transparent" />
        </div>

        <motion.svg
          ref={svgRef}
          viewBox="-260 -260 520 520"
          animate={{ rotate: rotation }}
          transition={{ duration: 4.5, ease: [0.17, 0.89, 0.32, 1.27] }}
          className="w-full h-full"
        >
          {Array.from({ length: N }, (_, i) => {
            const start = i * slice;
            const end = (i + 1) * slice;
            const arc = describeArc(R, start, end);
            const ang = start + slice / 2;
            const rad = (ang - 90) * (Math.PI / 180);
            const tx = rText * Math.cos(rad);
            const ty = rText * Math.sin(rad);
            return (
              <g key={i}>
                <path
                  d={arc}
                  fill={i % 2 === 0 ? "#f3f4f8" : "#e6e8f1"}
                  stroke="#fff"
                  strokeWidth={0.5}
                />
                <text
                  x={tx}
                  y={ty}
                  fontSize={9}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${ang}, ${tx}, ${ty})`}
                >
                  {i + 1}
                </text>
              </g>
            );
          })}
        </motion.svg>

        {demo && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="bg-red-100 text-red-700 font-bold px-4 py-2 rounded-lg border-2 border-red-500 rotate-[-12deg] shadow">
              DEMO (resultado fijado)
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 items-center w-full max-w-md">
        <button
          className="px-6 py-3 bg-black text-white rounded-2xl shadow w-full"
          disabled={spinning}
          onClick={handleSpin}
        >
          Girar ruleta
        </button>
        <div className="flex gap-2 items-center w-full">
          <input
            type="checkbox"
            checked={demo}
            onChange={(e) => setDemo(e.target.checked)}
          />
          <span className="text-sm">Activar modo DEMO</span>
          {demo && (
            <input
              type="number"
              min={1}
              max={100}
              value={demoNumber ?? ""}
              onChange={(e) => setDemoNumber(Number(e.target.value))}
              className="border rounded p-1 w-20"
              placeholder="1-100"
            />
          )}
        </div>
        <div className="text-xs text-gray-500">
          Semilla de sesión: <code>{seed}</code>
        </div>
        {result && (
          <div className="text-lg font-bold mt-2">
            Resultado: {result}
          </div>
        )}
      </div>
    </div>
  );
};

export default Roulette;
