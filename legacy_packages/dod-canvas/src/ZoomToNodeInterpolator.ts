import { TransitionInterpolator } from '@deck.gl/core';

// lerp is from https://github.com/uber-web/math.gl/blob/aaae33205d73fb1258243c6f08d0e5ea440dacd0/modules/core/src/lib/common.ts
export function isArray(value: unknown): boolean {
  return (
    Array.isArray(value) ||
    (ArrayBuffer.isView(value) && !(value instanceof DataView))
  );
}

// Interpolate between two values
function lerp(
  a: number | number[],
  b: number | number[],
  t: number
): number | number[] {
  if (isArray(a)) {
    return (a as number[]).map((ai: number, i: number) =>
      lerp(ai, (b as number[])[i], t)
    ) as number[];
  }
  return t * (b as number) + (1 - t) * (a as number);
}

type PropsWithAnchor = {
  around?: number[];
  aroundPosition?: number[];
  [key: string]: any;
};

const propsToExtract = ['zoom', 'target'];

export default class ZoomToNodeInterpolator extends TransitionInterpolator {
  constructor() {
    super({
      compare: ['zoom', 'target'],
      extract: ['zoom', 'target'],
      required: ['zoom', 'target'],
    });
  }

  initializeProps(
    startProps: Record<string, any>,
    endProps: Record<string, any>
  ): {
    start: PropsWithAnchor;
    end: PropsWithAnchor;
  } {
    const result = super.initializeProps(startProps, endProps);

    return result;
  }

  getDuration(
    startProps: Record<string, any>,
    endProps: Record<string, any>
  ): number {
    return endProps.transitionDuration;
  }

  interpolateProps(
    startProps: PropsWithAnchor,
    endProps: PropsWithAnchor,
    t: number
  ): Record<string, any> {
    const propsInTransition = {};
    for (const key of propsToExtract) {
      propsInTransition[key] = lerp(
        startProps[key] || 0,
        endProps[key] || 0,
        t
      );
    }
    return propsInTransition;
  }
}
