(function () {
  'use strict';
  const assumptions = Object.freeze({ parkTraffic: 1000, residentialTraffic: 100, parkPeople: 80, backgroundDB: 45, soundEnergyPerVehicle: 10000, timeWindowHours: 1 });
  function calculate(redirectPercent = 50, attenuationDB = 0, residents = 300, detourMinutes = 2) {
    if (![redirectPercent, attenuationDB, residents, detourMinutes].every(Number.isFinite) || redirectPercent < 0 || redirectPercent > 100 || attenuationDB < 0 || residents < 0 || detourMinutes < 0) throw new RangeError('Invalid scenario');
    const a = assumptions, diverted = a.parkTraffic * redirectPercent / 100;
    const background = Math.pow(10, a.backgroundDB / 10);
    const level = q => 10 * Math.log10(a.soundEnergyPerVehicle * q + background);
    const parkBefore = level(a.parkTraffic), homesBefore = level(a.residentialTraffic);
    const parkAfter = level(a.parkTraffic - diverted);
    const homesAfter = level(a.residentialTraffic + diverted * Math.pow(10, -attenuationDB / 10));
    return { redirectPercent, attenuationDB, residents, detourMinutes, diverted, parkTraffic: a.parkTraffic - diverted, residentialTraffic: a.residentialTraffic + diverted, parkBefore, homesBefore, parkAfter, homesAfter, parkChange: parkAfter - parkBefore, homesChange: homesAfter - homesBefore, addedVehicleHours: diverted * detourMinutes / 60, parkPeople: a.parkPeople };
  }
  const model = { assumptions, calculate };
  globalThis.NoiseModel = model;
  if (typeof module !== 'undefined') module.exports = model;
})();
