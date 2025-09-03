import { motion } from "motion/react";
import React, { useRef, useState } from "react";

const SpinWheel: React.FC = () => {
  // Constantes de configuración de la ruleta
  const N = 100; // Número total de segmentos (1-100)
  const degreesPerSegment = 360 / N; // Grados por segmento (3.6°)
  const radius = 240; // Radio exterior de la ruleta
  const textRadius = 224; // Radio donde se posicionan los números

  const svgRef = useRef<SVGSVGElement>(null);

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [forcedNumber, setForcedNumber] = useState<number | null>(null);

  /**
   * Genera un número aleatorio entre min y max
   * @param min - El número mínimo
   * @param max - El número máximo
   * @returns Un número aleatorio entre min y max
   */
  const cryptoInt = (min: number, max: number) => {
    const range = max - min + 1;
    const buf = new Uint32Array(1);
    let x: number;
    const maxUnbiased = Math.floor(0xffffffff / range) * range;
    do {
      crypto.getRandomValues(buf);
      x = buf[0];
    } while (x >= maxUnbiased);
    return min + (x % range);
  };

  const SPIN_DURATION = 4500;
  const spinToNumber = (number: number) => {
    // minimum 6 turns, maximum 10 turns
    const turns = 6 + cryptoInt(0, 4);

    //the angular position where a specific segment begins
    const segmentStartAngle = (number - 1) * degreesPerSegment;
    const segmentCenterAngle = segmentStartAngle + degreesPerSegment / 2;

    //the total rotation needed to the wheel to stop on the desired segment
    const rotation = turns * 360 + (360 - segmentCenterAngle);

    setSpinning(true);
    setResult(null);
    setRotation(rotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(number);
    }, SPIN_DURATION + 100);
  };

  const handleSpin = () => {
    if (spinning) return;
    if (forcedNumber && forcedNumber >= 1 && forcedNumber <= N) {
      spinToNumber(forcedNumber);
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
      <h1 className="text-2xl font-bold">Ruleta</h1>
      <div className="relative w-[520px] h-[520px]">
        <div className="absolute left-1/2 -top-4 -translate-x-1/2 rotate-180">
          <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-b-[22px] border-b-black border-transparent" />
        </div>

        <motion.svg
          ref={svgRef}
          viewBox="-260 -260 520 520"
          animate={{ rotate: rotation }}
          transition={{
            duration: SPIN_DURATION / 1000,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="w-full h-full cursor-pointer"
          onClick={handleSpin}
        >
          {Array.from({ length: N }, (_, i) => {
            const start = i * degreesPerSegment;
            const end = (i + 1) * degreesPerSegment;
            const arc = describeArc(radius, start, end);
            const ang = start + degreesPerSegment / 2;
            const rad = (ang - 90) * (Math.PI / 180);
            const tx = textRadius * Math.cos(rad);
            const ty = textRadius * Math.sin(rad);
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
      </div>

      <div className="flex flex-col gap-2 items-center w-full max-w-md">
        {result && (
          <div className="text-lg font-bold mt-2">Resultado: {result}</div>
        )}
      </div>
    </div>
  );
};

export default SpinWheel;
