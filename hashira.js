const fs = require("fs");

// Convert a string in given base to BigInt
function toDecimal(value, base) {
  let result = 0n;
  for (let i = 0; i < value.length; i++) {
    let ch = value[i];
    let digit;
    if (/[0-9]/.test(ch)) {
      digit = BigInt(ch.charCodeAt(0) - "0".charCodeAt(0));
    } else {
      digit = 10n + BigInt(ch.toLowerCase().charCodeAt(0) - "a".charCodeAt(0));
    }
    if (digit >= BigInt(base)) {
      throw new Error(`Digit '${ch}' exceeds base ${base}`);
    }
    result = result * BigInt(base) + digit;
  }
  return result;
}

// Solve linear system (Gaussian elimination with doubles)
function solveLinearSystem(A, B) {
  const n = B.length;
  const x = new Array(n).fill(0);
  const M = A.map((row) => [...row]);
  const Y = [...B];

  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) {
        maxRow = k;
      }
    }
    if (maxRow !== i) {
      [M[i], M[maxRow]] = [M[maxRow], M[i]];
      [Y[i], Y[maxRow]] = [Y[maxRow], Y[i]];
    }
    if (Math.abs(M[i][i]) < 1e-12) {
      throw new Error("Singular matrix detected");
    }
    for (let k = i + 1; k < n; k++) {
      const factor = M[k][i] / M[i][i];
      for (let j = i; j < n; j++) {
        M[k][j] -= factor * M[i][j];
      }
      Y[k] -= factor * Y[i];
    }
  }

  for (let i = n - 1; i >= 0; i--) {
    x[i] = Y[i];
    for (let j = i + 1; j < n; j++) {
      x[i] -= M[i][j] * x[j];
    }
    x[i] /= M[i][i];
  }
  return x;
}

// Process one test case JSON
function processTestCase(testCase) {
  const n = testCase.keys.n;
  const k = testCase.keys.k;
  const degree = k - 1;

  // Collect and sort numeric keys
  const entries = Object.entries(testCase)
    .filter(([key]) => key !== "keys")
    .map(([key, val]) => [parseInt(key), val])
    .sort((a, b) => a[0] - b[0]);

  if (entries.length < k) {
    throw new Error("Not enough points");
  }

  // First k points
  const points = entries.slice(0, k).map(([, val], i) => {
    const base = parseInt(val.base);
    const y = toDecimal(val.value, base);
    return { x: i + 1, y }; // assign x = 1..k
  });

  // Build system
  const A = [];
  const B = [];
  for (let i = 0; i < k; i++) {
    const row = [];
    for (let j = 0; j < k; j++) {
      row.push(Math.pow(points[i].x, degree - j));
    }
    A.push(row);
    B.push(Number(points[i].y)); // using double precision
  }

  const coeffs = solveLinearSystem(A, B);
  return {
    coeffs,
    constant: coeffs[coeffs.length - 1],
    degree,
  };
}

// Main
function main() {
  if (process.argv.length < 4) {
    console.log("Usage: node poly.js <file1.json> <file2.json>");
    process.exit(1);
  }
  const inputFile1 = process.argv[2];
  const inputFile2 = process.argv[3];

  const json1 = JSON.parse(fs.readFileSync(inputFile1, "utf8"));
  const json2 = JSON.parse(fs.readFileSync(inputFile2, "utf8"));

  [json1, json2].forEach((testCase, idx) => {
    const result = processTestCase(testCase);
    console.log(`\nTest Case ${idx + 1}:`);
    console.log("Degree:", result.degree);
    console.log("Coefficients:", result.coeffs);
    console.log("Constant C =", result.constant);
  });
}

main();
