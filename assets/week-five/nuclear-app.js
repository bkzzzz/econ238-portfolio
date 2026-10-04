(function () {
  'use strict';
  const model = NuclearModel;
  const $ = id => document.getElementById(id);
  function result() { return model.calculate(Number($('rate').value), Number($('years').value)); }
  function render() {
    const r = result();
    $('rate-out').textContent = `${r.ratePercent.toFixed(1)}%`;
    $('years-out').textContent = `${r.years} years`;
    $('n-total').textContent = `$${r.total.toFixed(1)}`;
    $('n-open').textContent = `$${(r.openingCapital / 1000).toFixed(2)}bn`;
    $('n-carry').textContent = `$${(r.constructionCarry / 1000).toFixed(2)}bn`;
    $('n-chart').innerHTML = ExhibitCharts.nuclear(model, r);
    $('n-description').textContent = `At ${r.ratePercent}% and ${r.years} years: $${r.operations.toFixed(1)} fuel and operations + $${r.overnightRecovery.toFixed(1)} construction budget and investor return + $${r.constructionFinance.toFixed(1)} financing accumulated before opening = $${r.total.toFixed(1)}/MWh. All amounts are in 2023 dollars.`;
  }
  ['rate','years'].forEach(id => $(id).addEventListener('input', render));
  $('reset').addEventListener('click', () => { $('rate').value = 7; $('years').value = 7; render(); });
  $('download').addEventListener('click', () => {
    const r = result(), a = model.assumptions;
    const rows = [['item','value','unit'],['real_cost_of_capital',r.ratePercent,'percent'],['financed_period',r.years,'years'],['overnight_cost',a.overnightCost,'2023 USD/kW'],['operating_life',a.operatingYears,'years'],['capacity_factor',a.capacityFactor,'fraction'],['fuel',a.fuel,'2023 USD/MWh; assumed'],['fixed_OM',a.fixedOM,'2023 USD/kW-year'],['variable_OM',a.variableOM,'2023 USD/MWh'],['opening_capital',r.openingCapital,'2023 USD/kW'],['construction_carry',r.constructionCarry,'2023 USD/kW'],['recovery_factor',r.recoveryFactor,'per year'],['annual_output',r.annualMWhPerKW,'MWh/kW-year'],['overnight_recovery_and_return',r.overnightRecovery,'2023 USD/MWh'],['construction_carry_recovery',r.constructionFinance,'2023 USD/MWh'],['fuel_and_operations',r.operations,'2023 USD/MWh'],['generation_cost',r.total,'2023 USD/MWh'],[],['spending_midpoint_year','expense_2023_USD_per_kW','financed_years','balance_at_opening_2023_USD_per_kW'],...r.spending.map(x => [x.midpoint,x.expense,x.yearsFinanced,x.openingBalance])];
    const blob = new Blob([rows.map(x => x.join(',')).join('\n')+'\n'],{type:'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = `nuclear-${r.ratePercent}percent-${r.years}years.csv`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  render();
})();
