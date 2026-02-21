# sethares-dissonance

A JavaScript/TypeScript library for analyzing **dissonance curves** using William Sethares' sensory dissonance model. Dissonance curves show how sensory dissonance varies across a range of musical intervals, based on the spectral content of sounds.

For the theoretical foundation and detailed explanation of the model, see the book **[_Tuning, Timbre, Spectrum, Scale_](https://www.williamsethares.com/ttss.html)** by William Sethares.

## Installation

```bash
bun add sethares-dissonance
# or
npm install sethares-dissonance
```

## Usage

```ts
import { DissonanceCurve, Spectrum } from "sethares-dissonance";

const context = Spectrum.harmonicSeries(10, 440);
const complement = Spectrum.harmonicSeries(10, 440);

const curve = new DissonanceCurve({
    context,
    complement,
    start: 1,
    end: 2,
    maxDenominator: 60,
});

const points = curve.points;
const plotData = curve.plot();
```

## React

Because DissonanceCurve class mutates data in place, it is not directly suited for React applications as reference to the instance does not change. React will not detect dissonance curve mutations in dependency arrays or state and thus will not rerender. You can solve it in two ways.

### 1. Create new instances

Create a fresh `DissonanceCurve` whenever options change. `useMemo` ensures a new instance is created when dependencies change, so React detects the update and re-renders.

```tsx
import { useMemo } from "react";
import { DissonanceCurve, Spectrum } from "sethares-dissonance";

function DissonanceChart({ context, complement, start = 1, end = 2 }) {
    const curve = useMemo(
        () =>
            new DissonanceCurve({
                context,
                complement,
                start,
                end,
                maxDenominator: 60,
            }),
        [context, complement, start, end],
    );

    const plotData = curve.plot();
    return <svg>{/* render plotData */}</svg>;
}
```

This solution ok, but there is a downside that `curve` object contains methods that can mutate the internal state which will not be registered by React, thus leading to bugs.

### 2. Use read-only wrappers (Recommended)

This method relies on creating new instances of read-only objects rather than new DissonanceCurve instances. It is demonstrated in the following `useDissonanceCurve` hook. Memoize options with `useMemo` when they contain objects (e.g. `Spectrum`) to avoid recalculating on every render.

```tsx
"use client";

import { useMemo, useState } from "react";
import {
    DissonanceCurve,
    type DissonanceCurveOptions,
} from "sethares-dissonance";
import type { ReadOnlyDissonanceCurve } from "sethares-dissonance";

/**
 * Read-only view of DissonanceCurve without the methods that cause mutation.
 * Use this type when exposing the curve from hooks to prevent external mutation.
 */
type ReadOnlyDissonanceCurve = Omit<
  DissonanceCurve,
  "recalculate"
>;

function createReadOnlyWrapper(curve: DissonanceCurve) {
  return {
    get maxDissonance() {
      return curve.maxDissonance
    },
    plotCents: () => curve.plotCents()
    // ... can map more methods if needed
  } satisfies Partial<ReadOnlyDissonanceCurve>
}

export function useDissonanceCurve(
    options: DissonanceCurveOptions,
): ReadOnlyDissonanceCurve {
    const [curve] = useState(() => new DissonanceCurve(options));

    return useMemo(() => {
        curve.recalculate(options);
        return createReadOnlyWrapper(curve);
    }, [options, curve]);
}
```
