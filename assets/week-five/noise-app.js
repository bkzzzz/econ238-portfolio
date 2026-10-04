(function () {
  'use strict';
  const model = NoiseModel;
  const $ = id => document.getElementById(id);
  function result() { return model.calculate(Number($('redirect').value), Number($('attenuation').value), Number($('residents').value), Number($('detour').value)); }
  function render() {
    const r = result();
    $('redirect-out').textContent = `${r.redirectPercent}%`;
    $('attenuation-out').textContent = `${r.attenuationDB} dB`;
    $('residents-out').textContent = `${r.residents} people`;
    $('detour-out').textContent = `${r.detourMinutes.toFixed(1)} minutes`;
    $('p-change').textContent = `${r.parkChange.toFixed(1)} dB`;
    $('h-change').textContent = `${r.homesChange >= 0 ? '+' : ''}${r.homesChange.toFixed(1)} dB`;
    $('time-cost').textContent = `${r.addedVehicleHours.toFixed(1)} h`;
    $('park-flow').textContent = `${r.parkTraffic.toLocaleString('en-US')} vehicles/hour`;
    $('home-flow').textContent = `${r.residentialTraffic.toLocaleString('en-US')} vehicles/hour`;
    $('resident-count').textContent = r.residents;
    $('noise-chart').innerHTML = ExhibitCharts.noise(model, r);
    $('noise-curve').innerHTML = ExhibitCharts.noiseCurve(model, r);
    $('noise-description').textContent = `Park: ${r.parkBefore.toFixed(1)} → ${r.parkAfter.toFixed(1)} dBA. Homes: ${r.homesBefore.toFixed(1)} → ${r.homesAfter.toFixed(1)} dBA. ${r.diverted.toLocaleString('en-US')} vehicles/hour are redirected; the total stays at 1,100 vehicles/hour.`;
  }
  ['redirect','attenuation','residents','detour'].forEach(id => $(id).addEventListener('input',render));
  $('reset').addEventListener('click',() => { $('redirect').value=50; $('attenuation').value=0; $('residents').value=300; $('detour').value=2; render(); });
  $('download').addEventListener('click',() => {
    const r=result(),rows=[['item','value','unit'],['redirected_share',r.redirectPercent,'percent'],['extra_attenuation',r.attenuationDB,'dB'],['residents',r.residents,'hypothetical people in exposure area'],['park_users',r.parkPeople,'hypothetical people'],['extra_time_per_vehicle',r.detourMinutes,'minutes'],['park_traffic_before',1000,'vehicles/hour'],['home_traffic_before',100,'vehicles/hour'],['park_traffic_after',r.parkTraffic,'vehicles/hour'],['home_traffic_after',r.residentialTraffic,'vehicles/hour'],['park_before',r.parkBefore,'outdoor dBA'],['park_after',r.parkAfter,'outdoor dBA'],['homes_before',r.homesBefore,'outdoor dBA'],['homes_after',r.homesAfter,'outdoor dBA'],['extra_vehicle_hours',r.addedVehicleHours,'vehicle-hours per one-hour scenario'],['background',45,'assumed dBA'],['sound_energy_per_vehicle',10000,'assumed relative units']];
    const blob=new Blob([rows.map(x=>x.join(',')).join('\n')+'\n'],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`park-noise-${r.redirectPercent}percent-${r.attenuationDB}dB.csv`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  render();
})();
