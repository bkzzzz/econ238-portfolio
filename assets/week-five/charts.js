(function () {
  'use strict';
  const colors = { teal: '#21777d', orange: '#ba4d2d', gray: '#c4d2ce', ink: '#173449', grid: '#dfe6e2', purple: '#71609a' };
  const text = (x, y, label, size = 15, extra = '') => `<text x="${x}" y="${y}" font-size="${size}" ${extra}>${label}</text>`;
  const root = (body, label, h, mobile = false) => `<svg class="chart ${mobile ? 'chart-mobile' : 'chart-desktop'}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${mobile ? 450 : 900} ${h}" role="img" aria-label="${label}"><rect width="${mobile ? 450 : 900}" height="${h}" fill="white"/>${body}</svg>`;
  function nuclear(model, selected) {
    const rows = [model.calculate(3, 4), model.calculate(7, 4), model.calculate(7, 10), selected];
    const xmax = Math.max(200, Math.ceil(Math.max(...rows.map(x => x.total)) / 50) * 50);
    const x = v => 150 + v / xmax * 655;
    let s = text(150, 25, 'Simplified generation cost · 2023 USD per MWh', 15);
    for (let v = 0; v <= xmax; v += 50) s += `<line x1="${x(v)}" y1="43" x2="${x(v)}" y2="300" stroke="${colors.grid}"/>` + text(x(v), 329, v, 14, 'text-anchor="middle"');
    rows.forEach((r, i) => {
      const y = 57 + i * 63;
      s += text(136, y + 18, `${r.ratePercent}% · ${r.years} years`, 15, 'text-anchor="end"');
      if (i === 3) s += text(136, y + 37, 'Your settings', 12, 'text-anchor="end"');
      let left = 0;
      [[r.operations, colors.gray], [r.overnightRecovery, colors.teal], [r.constructionFinance, colors.orange]].forEach(([v, c]) => {
        s += `<rect x="${x(left)}" y="${y}" width="${x(v) - x(0)}" height="36" fill="${c}"/>`; left += v;
      });
      s += text(x(r.total) + 9, y + 24, `$${r.total.toFixed(1)}`, 16, 'font-weight="bold"');
    });
    const label = 'Stacked generation costs. Operations are fixed across cases; capital recovery and construction financing change with rates and time. Numerical results are also listed below the chart.';
    let m = text(18, 25, '2023 USD per MWh', 15);
    const mx = v => 18 + v / xmax * 407;
    rows.forEach((r,i) => {
      const y = 61+i*93;
      m += text(18,y-8,`${r.ratePercent}% · ${r.years} years${i===3 ? ' · Your settings' : ''}`,15);
      m += text(428,y-8,`$${r.total.toFixed(1)}`,17,'text-anchor="end" font-weight="bold"');
      let left=0;
      [[r.operations,colors.gray],[r.overnightRecovery,colors.teal],[r.constructionFinance,colors.orange]].forEach(([v,c])=>{
        m+=`<rect x="${mx(left)}" y="${y}" width="${mx(v)-mx(0)}" height="34" fill="${c}"/>`;left+=v;
      });
    });
    for(let v=0;v<=xmax;v+=50)m+=text(mx(v),420,v,13,'text-anchor="middle"');
    return root(s,label,352) + root(m,label,442,true);
  }
  function noise(model, r) {
    const x = v => 145 + (v - 45) / 35 * 595;
    let s = text(145, 24, 'Modeled outdoor average sound level · dBA', 15);
    for (let v = 45; v <= 80; v += 5) s += `<line x1="${x(v)}" y1="42" x2="${x(v)}" y2="208" stroke="${colors.grid}"/>` + text(x(v), 237, v, 14, 'text-anchor="middle"');
    [['Park', r.parkBefore, r.parkAfter, colors.teal], ['Homes', r.homesBefore, r.homesAfter, colors.orange]].forEach(([label, before, after, c], i) => {
      const y = 89 + i * 88;
      s += text(130, y + 6, label, 18, 'text-anchor="end" font-weight="bold"');
      s += `<line x1="${x(before)}" y1="${y}" x2="${x(after)}" y2="${y}" stroke="${c}" stroke-width="5"/><circle cx="${x(before)}" cy="${y}" r="8" fill="white" stroke="${colors.ink}" stroke-width="2"/><circle cx="${x(after)}" cy="${y}" r="8" fill="${c}"/>`;
      s += text(x(after), y - 20, after.toFixed(1), 17, 'text-anchor="middle" font-weight="bold"');
      s += text(765, y + 5, `${after - before >= 0 ? '+' : ''}${(after - before).toFixed(1)} dB`, 18, 'font-weight="bold"');
    });
    const label=`Park: ${r.parkBefore.toFixed(1)} to ${r.parkAfter.toFixed(1)} dBA. Homes: ${r.homesBefore.toFixed(1)} to ${r.homesAfter.toFixed(1)} dBA. Hollow circles are before; filled circles are after.`;
    const mx=v=>25+(v-45)/35*398;
    let m=text(25,24,'Outdoor average sound level · dBA',15);
    for(let v=45;v<=80;v+=5)m+=`<line x1="${mx(v)}" y1="75" x2="${mx(v)}" y2="245" stroke="${colors.grid}"/>`+text(mx(v),276,v,13,'text-anchor="middle"');
    [['Park',r.parkBefore,r.parkAfter,colors.teal],['Homes',r.homesBefore,r.homesAfter,colors.orange]].forEach(([name,before,after,c],i)=>{
      const y=95+i*115;
      m+=text(25,y-35,name,19,'font-weight="bold"')+text(424,y-35,`${after-before>=0?'+':''}${(after-before).toFixed(1)} dB`,18,'text-anchor="end" font-weight="bold"');
      m+=`<line x1="${mx(before)}" y1="${y}" x2="${mx(after)}" y2="${y}" stroke="${c}" stroke-width="5"/><circle cx="${mx(before)}" cy="${y}" r="7" fill="white" stroke="${colors.ink}" stroke-width="2"/><circle cx="${mx(after)}" cy="${y}" r="7" fill="${c}"/>`;
      m+=text(mx(after),y+28,after.toFixed(1),16,'text-anchor="middle"');
    });
    return root(s,label,263)+root(m,label,296,true);
  }
  function noiseCurve(model, r) {
    const x = f => 95 + f / 90 * 650, y = db => 270 - (db - 55) / 20 * 210;
    let s = text(95, 25, 'Same transfer, two different starting traffic volumes', 15);
    for (let db = 55; db <= 75; db += 5) s += `<line x1="95" y1="${y(db)}" x2="745" y2="${y(db)}" stroke="${colors.grid}"/>` + text(80, y(db) + 5, db, 14, 'text-anchor="end"');
    for (let f = 0; f <= 90; f += 15) s += text(x(f), 295, `${f}%`, 14, 'text-anchor="middle"');
    s += text(95, 48, 'dBA', 12) + text(420, 327, 'Share of park-side traffic redirected', 14, 'text-anchor="middle"');
    for (const [field, c, label] of [['parkAfter', colors.teal, 'Park'], ['homesAfter', colors.orange, 'Homes']]) {
      const points = [];
      for (let f = 0; f <= 90; f++) points.push(`${x(f)},${y(model.calculate(f, r.attenuationDB, r.residents, r.detourMinutes)[field])}`);
      s += `<polyline fill="none" stroke="${c}" stroke-width="3" points="${points.join(' ')}"/><circle cx="${x(r.redirectPercent)}" cy="${y(r[field])}" r="6" fill="${c}"/>`;
      s += text(762, y(model.calculate(90, r.attenuationDB)[field]) + 4, label, 15);
    }
    const label='Curves showing park and residential noise as traffic is redirected. The curves use the selected attenuation assumption, with all other physical parameters fixed.';
    const mx=f=>42+f/90*325,my=db=>250-(db-55)/20*190;
    let m=text(42,25,'Redirected traffic and outdoor noise',15)+text(42,48,'dBA',12);
    for(let db=55;db<=75;db+=5)m+=`<line x1="42" y1="${my(db)}" x2="367" y2="${my(db)}" stroke="${colors.grid}"/>`+text(33,my(db)+4,db,13,'text-anchor="end"');
    for(let f=0;f<=90;f+=30)m+=text(mx(f),276,`${f}%`,13,'text-anchor="middle"');
    m+=text(220,305,'Park-side traffic redirected',14,'text-anchor="middle"');
    for(const[field,c,name]of[['parkAfter',colors.teal,'Park'],['homesAfter',colors.orange,'Homes']]){
      const pts=[];for(let f=0;f<=90;f++)pts.push(`${mx(f)},${my(model.calculate(f,r.attenuationDB,r.residents,r.detourMinutes)[field])}`);
      m+=`<polyline fill="none" stroke="${c}" stroke-width="3" points="${pts.join(' ')}"/><circle cx="${mx(r.redirectPercent)}" cy="${my(r[field])}" r="5" fill="${c}"/>`+text(375,my(model.calculate(90,r.attenuationDB)[field])+4,name,13);
    }
    return root(s,label,346)+root(m,label,324,true);
  }
  const api = { nuclear, noise, noiseCurve };
  globalThis.ExhibitCharts = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
