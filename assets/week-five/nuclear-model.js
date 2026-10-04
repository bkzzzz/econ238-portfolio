(function () {
  'use strict';
  const assumptions = Object.freeze({
    overnightCost: 7861, fixedOM: 156.20, variableOM: 2.52,
    fuel: 8, capacityFactor: 0.85, operatingYears: 40,
    dollarYear: 2023, normalizedCapacityMW: 1000
  });
  function calculate(ratePercent = 7, years = 7) {
    if (!Number.isFinite(ratePercent) || ratePercent < 0 || ratePercent > 30 || !Number.isInteger(years) || years < 1 || years > 50) throw new RangeError('Invalid scenario');
    const r = ratePercent / 100, a = assumptions;
    let openingCapital = 0;
    const spending = [];
    for (let j = 0; j < years; j++) {
      const expense = a.overnightCost / years;
      const balance = expense * Math.pow(1 + r, years - j - 0.5);
      openingCapital += balance;
      spending.push({ midpoint: j + 0.5, expense, yearsFinanced: years - j - 0.5, openingBalance: balance });
    }
    const recoveryFactor = r === 0 ? 1 / a.operatingYears : r / (1 - Math.pow(1 + r, -a.operatingYears));
    const annualMWhPerKW = 8.76 * a.capacityFactor;
    const overnightRecovery = a.overnightCost * recoveryFactor / annualMWhPerKW;
    const constructionFinance = (openingCapital - a.overnightCost) * recoveryFactor / annualMWhPerKW;
    const fixedOM = a.fixedOM / annualMWhPerKW;
    const operations = fixedOM + a.variableOM + a.fuel;
    return { ratePercent, years, openingCapital, constructionCarry: openingCapital - a.overnightCost, recoveryFactor, annualMWhPerKW, overnightRecovery, constructionFinance, fixedOM, operations, total: overnightRecovery + constructionFinance + operations, spending };
  }
  const model = { assumptions, calculate };
  globalThis.NuclearModel = model;
  if (typeof module !== 'undefined') module.exports = model;
})();
