"""Recreate both exhibits with Python 3 standard library only.

Put this script beside the assumption JSONs and comparison CSVs. Run:
    python replicate.py
Nuclear costs use independent cash-flow present values rather than the
JavaScript model's accumulated-capital / recovery-factor implementation.
"""
import csv
import json
import math
from pathlib import Path

HERE = Path(__file__).resolve().parent
NUCLEAR = json.loads((HERE / 'nuclear-assumptions.json').read_text(encoding='utf-8'))
NOISE = json.loads((HERE / 'noise-assumptions.json').read_text(encoding='utf-8'))


def nuclear(rate_percent, years):
    a = NUCLEAR
    r = rate_percent / 100
    # Cash flows at construction-year midpoints, time zero at start of spending.
    construction_pv = sum((a['overnightCost'] / years) / (1+r)**(j+0.5)
                          for j in range(years))
    output = 8.76 * a['capacityFactor']
    annual_ops = a['fixedOM'] + output * (a['variableOM'] + a['fuel'])
    # Operations/output at year ends, starting one year after opening.
    operation_times = range(years+1, years+a['operatingYears']+1)
    operation_pv = sum(annual_ops / (1+r)**t for t in operation_times)
    output_pv = sum(output / (1+r)**t for t in operation_times)
    return (construction_pv + operation_pv) / output_pv


def noise(redirect_percent, attenuation_db):
    a = NOISE
    f = redirect_percent / 100
    # Reconstruct the energy relationship from the fixed 70 dBA reference
    # and a traffic ratio, including an independent background source.
    traffic_reference = 10**(70/10)
    background = 10**(a['backgroundDB']/10)
    diverted = a['parkTraffic'] * f
    park_energy = traffic_reference * (1-f)
    home_energy = traffic_reference * (
        a['residentialTraffic']/a['parkTraffic'] + f * 10**(-attenuation_db/10))
    return 10*math.log10(park_energy+background), 10*math.log10(home_energy+background)


def verify():
    count = 0
    with (HERE/'nuclear-comparisons.csv').open(encoding='utf-8',newline='') as f:
        for row in csv.DictReader(f):
            result = nuclear(float(row['real_rate_percent']), int(row['financed_years']))
            assert math.isclose(result, float(row['cost_2023_USD_per_MWh']), abs_tol=1e-6)
            count += 1
    with (HERE/'noise-comparisons.csv').open(encoding='utf-8',newline='') as f:
        for row in csv.DictReader(f):
            park, homes = noise(float(row['redirect_percent']), float(row['extra_attenuation_dB']))
            assert math.isclose(park, float(row['park_after_dBA']), abs_tol=1e-6)
            assert math.isclose(homes, float(row['homes_after_dBA']), abs_tol=1e-6)
            count += 1
    assert math.isclose(nuclear(0,4), nuclear(0,10), abs_tol=1e-9)
    assert noise(50,10)[1] < noise(50,0)[1]
    park0, home0 = noise(0,0)
    assert math.isclose(park0, noise(0,20)[0], abs_tol=1e-9)
    assert math.isclose(home0, noise(0,20)[1], abs_tol=1e-9)
    print(f'Independent replication passed for {count} scenarios and boundary checks.')
    print(f'Nuclear: 3%/4 years = ${nuclear(3,4):.2f}/MWh; 10%/10 years = ${nuclear(10,10):.2f}/MWh')
    print(f'Noise at 50% redirection/0 dB attenuation: park {noise(50,0)[0]:.3f}, homes {noise(50,0)[1]:.3f} dBA')


if __name__ == '__main__':
    verify()
