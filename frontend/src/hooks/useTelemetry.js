import { useEffect, useState } from "react";

export default function useTelemetry() {

  const [telemetryStats, setTelemetryStats] = useState({
    cpu: [42, 68, 51, 88, 30, 45, 62, 79],
    gpu: [35, 41, 59, 28],
    tokensUsed: 142501,
    compileRate: "0.3s",
    memoryUsage: 64,
  });

  useEffect(() => {

    const timer = setInterval(() => {

      setTelemetryStats((prev) => ({
        ...prev,

        cpu: prev.cpu.map((x) =>
          Math.max(
            12,
            Math.min(
              98,
              x + Math.floor(Math.random() * 15) - 7
            )
          )
        ),

        gpu: prev.gpu.map((x) =>
          Math.max(
            10,
            Math.min(
              95,
              x + Math.floor(Math.random() * 11) - 5
            )
          )
        ),

        tokensUsed:
          prev.tokensUsed +
          Math.floor(Math.random() * 24) +
          12,

        memoryUsage: Math.max(
          48,
          Math.min(
            92,
            prev.memoryUsage +
              Math.floor(Math.random() * 5) -
              2
          )
        ),
      }));

    }, 1500);

    return () => clearInterval(timer);

  }, []);

  return {
    telemetryStats,
    setTelemetryStats,
  };
}