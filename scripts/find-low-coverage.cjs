/* eslint-disable */
const fs = require('fs');
const path = require('path');
const cov = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'coverage', 'coverage-final.json'), 'utf8'));
const results = {below50:[], noHits:[], neverExecuted:[]};
for(const [file, data] of Object.entries(cov)){
  const rel = path.relative(path.join(__dirname,'..'), file);
  const s = data.s || {};
  const stmtTotal = Object.keys(s).length;
  const stmtHit = Object.values(s).filter(v=>v>0).length;
  const stmtPct = stmtTotal===0?null:(stmtHit/stmtTotal*100);
  if(stmtTotal>0 && stmtPct<50){ results.below50.push({path:rel, statements: Math.round((stmtPct||0)*100)/100, stmtTotal, stmtHit}); }
  if(stmtTotal>0 && stmtHit===0){ results.noHits.push({path:rel, stmtTotal}); }
  // neverExecuted: functions, branches, statements all zero
  const fTotal = Object.keys(data.f||{}).length;
  const fHit = Object.values(data.f||{}).filter(v=>v>0).length;
  const bTotal = Object.values(data.b||{}).reduce((a,c)=>a+c.length,0);
  const bHit = Object.values(data.b||{}).reduce((a,c)=>a+a + c.filter(v=>v>0).length,0);
  if((stmtTotal===0 || stmtHit===0) && fHit===0 && bHit===0){ results.neverExecuted.push({path:rel, stmtTotal, stmtHit, funcTotal:fTotal, funcHit:fHit, branchTotal:bTotal, branchHit:bHit}); }
}
fs.writeFileSync(path.join(__dirname,'..','coverage','coverage-low.json'), JSON.stringify(results, null, 2));
console.log('WROTE coverage/coverage-low.json');
