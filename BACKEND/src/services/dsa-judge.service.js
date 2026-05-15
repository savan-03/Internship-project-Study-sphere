const vm = require('vm');

const normalizeForCompare = (value) => JSON.stringify(value);

const executeJavaScriptSolution = ({ code, functionName, publicTests = [], hiddenTests = [] }) => {
  const sandbox = {
    module: { exports: {} },
    exports: {},
  };

  vm.createContext(sandbox);
  vm.runInContext(`${code}\nmodule.exports = typeof ${functionName} === 'function' ? ${functionName} : module.exports;`, sandbox, {
    timeout: 1000,
  });

  const fn = sandbox.module.exports;

  if (typeof fn !== 'function') {
    throw new Error(`Expected a function named ${functionName}.`);
  }

  const runCase = (testCase, index, visibility) => {
    const args = Array.isArray(testCase.input) ? testCase.input : [testCase.input];
    const actual = fn(...args);
    const passed = normalizeForCompare(actual) === normalizeForCompare(testCase.expectedOutput);

    return {
      index,
      visibility,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      actualOutput: actual,
      passed,
    };
  };

  const publicResults = publicTests.map((testCase, index) => runCase(testCase, index + 1, 'public'));
  const hiddenResults = hiddenTests.map((testCase, index) => runCase(testCase, index + 1, 'hidden'));
  const allResults = [...publicResults, ...hiddenResults];
  const passedCount = allResults.filter((result) => result.passed).length;
  const publicPassedCount = publicResults.filter((result) => result.passed).length;
  const hiddenPassedCount = hiddenResults.filter((result) => result.passed).length;

  return {
    results: allResults,
    publicResults,
    hiddenResults,
    publicPassedCount,
    hiddenPassedCount,
    publicTotalTests: publicResults.length,
    hiddenTotalTests: hiddenResults.length,
    passedCount,
    totalTests: allResults.length,
    allPassed: allResults.length > 0 && passedCount === allResults.length,
  };
};

module.exports = {
  executeJavaScriptSolution,
};
