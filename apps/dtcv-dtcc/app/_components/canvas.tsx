"use client";

import { useAppContext } from "@/context/app-context";

export const CANVAS_PARENT_ID = "canvas";

export function Canvas() {
  const { canvasRef } = useAppContext();

  return <canvas id={CANVAS_PARENT_ID} ref={canvasRef} />;
}
