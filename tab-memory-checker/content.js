(() => {
  if (!performance || !performance.memory) {
    return null;
  }

  const { usedJSHeapSize, totalJSHeapSize } = performance.memory;

  return {
    usedJSHeapSize,
    totalJSHeapSize
  };
})();
