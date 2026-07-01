/* eslint-disable */
const fs = require('fs');
const path = require('path');
const cov = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'coverage', 'coverage-final.json'), 'utf8'));
const groups = {
  'src/features/auth': {statement:0,statementHit:0,func:0,funcHit:0,branch:0,branchHit:0,line:0,lineHit:0,files:[]},
  'src/features/customers': {statement:0,statementHit:0,func:0,funcHit:0,branch:0,branchHit:0,line:0,lineHit:0,files:[]},
  'src/features/shared': {statement:0,statementHit:0,func:0,funcHit:0,branch:0,branchHit:0,line:0,lineHit:0,files:[]},
  'src/components': {statement:0,statementHit:0,func:0,funcHit:0,branch:0,branchHit:0,line:0,lineHit:0,files:[]},
  'src/hooks': {statement:0,statementHit:0,func:0,funcHit:0,branch:0,branchHit:0,line:0,lineHit:0,files:[]},
  'src/services': {statement:0,statementHit:0,func:0,funcHit:0,branch:0,branchHit:0,line:0,lineHit:0,files:[]},
  'src/utils': {statement:0,statementHit:0,func:0,funcHit:0,branch:0,branchHit:0,line:0,lineHit:0,files:[]},
};
function addTo(group, fileCov, filepath){
  const s = fileCov.s || {};
  const f = fileCov.f || {};
  const b = fileCov.b || {};
  const stmtTotal = Object.keys(s).length;
  const stmtHit = Object.values(s).filter(v=>v>0).length;
  const funcTotal = Object.keys(f).length;
  const funcHit = Object.values(f).filter(v=>v>0).length;
  let branchTotal = 0; let branchHit = 0;
  Object.values(b).forEach(arr=>{ branchTotal += arr.length; branchHit += arr.filter(v=>v>0).length});
  // lines: approximate by statementMap start lines
  const stmtMap = fileCov.statementMap || {};
  const lineMap = {};
  for(const [k,loc] of Object.entries(stmtMap)){
    const line = loc.start && loc.start.line ? loc.start.line : null;
    if(line){
      lineMap[line] = lineMap[line] || {total:0,hit:0};
      lineMap[line].total++;
      if((s[k]||0)>0) lineMap[line].hit++;
    }
  }
  const lineTotal = Object.keys(lineMap).length;
  const lineHit = Object.values(lineMap).filter(x=>x.hit>0).length;
  group.statement += stmtTotal; group.statementHit += stmtHit;
  group.func += funcTotal; group.funcHit += funcHit;
  group.branch += branchTotal; group.branchHit += branchHit;
  group.line += lineTotal; group.lineHit += lineHit;
  group.files.push({path: filepath, stmtTotal, stmtHit, funcTotal, funcHit, branchTotal, branchHit, lineTotal, lineHit});
}
for(const [file, fileCov] of Object.entries(cov)){
  const rel = path.relative(path.join(__dirname,'..'), file);
  for(const key of Object.keys(groups)){
    if(rel.startsWith(key)){
      addTo(groups[key], fileCov, rel);
    }
  }
}
function pct(hit,total){ return total===0?null:Math.round((hit/total)*10000)/100; }
const out = {};
for(const [k,g] of Object.entries(groups)){
  out[k] = {
    statements: pct(g.statementHit,g.statement),
    functions: pct(g.funcHit,g.func),
    branches: pct(g.branchHit,g.branch),
    lines: pct(g.lineHit,g.line),
    files: g.files.sort((a,b)=> (a.stmtHit/a.stmtTotal||0)-(b.stmtHit/b.stmtTotal||0)).slice(0,10),
    raw: g,
  }
}
console.log(JSON.stringify({summary: {
  statements: pct(Object.values(cov).reduce((a,c)=>a+ (Object.keys(c.s||{}).length),0), Object.values(cov).reduce((a,c)=>a+ (Object.values(c.s||{}).filter(v=>v>0).length),0))
}, perFolder: out}, null, 2));
