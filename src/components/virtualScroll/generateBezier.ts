/*
 * velocity-animate (C) 2014-2018 Julian Shapiro.
 *
 * Licensed under the MIT license. See LICENSE file in the project root for details.
 *
 * Bezier curve function generator. Copyright Gaetan Renaudeau. MIT License: http://en.wikipedia.org/wiki/MIT_License
 */

type VelocityEasingFn = (
  percentComplete: number,
  startValue: number,
  endValue: number
) => number;

/**
 * Fix to a range of <code>0 <= num <= 1</code>.
 */
function fixRange(num: number) {
  return Math.min(Math.max(num, 0), 1);
}

function A(aA1, aA2) {
  return 1 - 3 * aA2 + 3 * aA1;
}

function B(aA1, aA2) {
  return 3 * aA2 - 6 * aA1;
}

function C(aA1) {
  return 3 * aA1;
}

function calcBezier(aT, aA1, aA2) {
  return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
}

function getSlope(aT, aA1, aA2) {
  return 3 * A(aA1, aA2) * aT * aT + 2 * B(aA1, aA2) * aT + C(aA1);
}

export function generateBezier(
  ...args: [number, number, number, number]
): VelocityEasingFn {
  const NEWTON_ITERATIONS = 4,
    NEWTON_MIN_SLOPE = 0.001,
    SUBDIVISION_PRECISION = 0.0000001,
    SUBDIVISION_MAX_ITERATIONS = 10,
    kSplineTableSize = 11,
    kSampleStepSize = 1 / (kSplineTableSize - 1),
    float32ArraySupported = "Float32Array" in window;

  /* X values must be in the [0, 1] range. */
  const mX1 = fixRange(args[0]);
  const mY1 = args[1];
  const mX2 = fixRange(args[2]);
  const mY2 = args[3];

  const mSampleValues = float32ArraySupported
    ? new Float32Array(kSplineTableSize)
    : new Array(kSplineTableSize);

  function newtonRaphsonIterate(aX, aGuessT) {
    for (let i = 0; i < NEWTON_ITERATIONS; ++i) {
      const currentSlope = getSlope(aGuessT, mX1, mX2);

      if (currentSlope === 0) {
        return aGuessT;
      }

      const currentX = calcBezier(aGuessT, mX1, mX2) - aX;
      aGuessT -= currentX / currentSlope;
    }

    return aGuessT;
  }

  function calcSampleValues() {
    for (let i = 0; i < kSplineTableSize; ++i) {
      mSampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
    }
  }

  function binarySubdivide(aX, aA, aB) {
    let currentX,
      currentT,
      i = 0;

    do {
      currentT = aA + (aB - aA) / 2;
      currentX = calcBezier(currentT, mX1, mX2) - aX;
      if (currentX > 0) {
        aB = currentT;
      } else {
        aA = currentT;
      }
    } while (
      Math.abs(currentX) > SUBDIVISION_PRECISION &&
      ++i < SUBDIVISION_MAX_ITERATIONS
    );

    return currentT;
  }

  function getTForX(aX) {
    const lastSample = kSplineTableSize - 1;
    let intervalStart = 0,
      currentSample = 1;

    for (
      ;
      currentSample !== lastSample && mSampleValues[currentSample] <= aX;
      ++currentSample
    ) {
      intervalStart += kSampleStepSize;
    }

    --currentSample;

    const dist =
        (aX - mSampleValues[currentSample]) /
        (mSampleValues[currentSample + 1] - mSampleValues[currentSample]),
      guessForT = intervalStart + dist * kSampleStepSize,
      initialSlope = getSlope(guessForT, mX1, mX2);

    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphsonIterate(aX, guessForT);
    } else if (initialSlope === 0) {
      return guessForT;
    } else {
      return binarySubdivide(
        aX,
        intervalStart,
        intervalStart + kSampleStepSize
      );
    }
  }

  let precomputed = false;

  function precompute() {
    precomputed = true;
    if (mX1 !== mY1 || mX2 !== mY2) {
      calcSampleValues();
    }
  }

  const str = `generateBezier(${[mX1, mY1, mX2, mY2]})`,
    f = (percentComplete: number, startValue: number, endValue: number) => {
      if (!precomputed) {
        precompute();
      }
      if (percentComplete === 0) {
        return startValue;
      }
      if (percentComplete === 1) {
        return endValue;
      }
      if (mX1 === mY1 && mX2 === mY2) {
        return startValue + percentComplete * (endValue - startValue);
      }

      return (
        startValue +
        calcBezier(getTForX(percentComplete), mY1, mY2) *
          (endValue - startValue)
      );
    };

  (f as any).getControlPoints = () => {
    return [
      { x: mX1, y: mY1 },
      { x: mX2, y: mY2 },
    ];
  };
  f.toString = () => {
    return str;
  };

  return f;
}
