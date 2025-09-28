export const calculateChartSteps = (data: { total: number }[]) => {
  if (!data || data.length === 0) return { stepValue: 10000, noOfSections: 5 };

  const maxValue = Math.max(...data.map((item) => item.total), 0);

  const stepOptions = [
    1, 5, 10, 50, 100, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000,
    200000, 500000, 1000000
  ];
  let stepValue = 10000;
  for (const step of stepOptions) {
    if (maxValue / step <= 10) {
      stepValue = step;
      break;
    }
  }

  const noOfSections = Math.ceil(maxValue / stepValue);

  return { stepValue, noOfSections };
};
