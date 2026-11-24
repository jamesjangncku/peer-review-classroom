export function parseRosterPaste(text) {
  const rows=String(text).replace(/\r\n?/g,'\n').split('\n');
  while(rows.length && !rows.at(-1).trim())rows.pop();
  const cells=rows.map(row=>row.split('\t'));
  if(cells[0]?.[0].trim()==='學號' && cells[0]?.[1]?.trim()==='姓名')cells.shift();
  return cells;
}
export function validateRosterRows(rows) {
  const result=[],seen=new Set();
  rows.forEach((r,i)=>{const studentId=r.studentId.trim().toUpperCase(),name=r.name.trim();
    if(!studentId&&!name&&!(r.group||'').trim())return;
    if(!studentId||!name)throw Error(`第 ${i+1} 列：請同時填寫學號與姓名。`);
    if(!/^[A-Z0-9]{5,20}$/.test(studentId))throw Error(`第 ${i+1} 列：學號格式不正確。`);
    if(seen.has(studentId))throw Error(`第 ${i+1} 列：學號 ${studentId} 重複。`);
    seen.add(studentId);result.push({studentId,name,...((r.group||'').trim()?{group:r.group.trim()}:{})});
  });return result;
}
export function createRosterGrid(tableBody,error) {
  function add(values={}){if(tableBody.rows.length>=500)throw Error('名冊最多500列。');const row=tableBody.insertRow();row.insertCell().textContent=tableBody.rows.length;
    for(const [key,label] of [['studentId','學號'],['name','姓名'],['group','組別（選填）']]){const cell=row.insertCell(),input=document.createElement('input');input.type='text';input.value=values[key]||'';input.dataset.field=key;input.setAttribute('aria-label',`第${tableBody.rows.length}列${label}`);input.autocomplete='off';input.spellcheck=false;cell.append(input);}
  }
  function read(){return [...tableBody.rows].map(r=>({studentId:r.querySelector('[data-field="studentId"]').value,name:r.querySelector('[data-field="name"]').value,group:r.querySelector('[data-field="group"]').value}));}
  function write(rows){tableBody.replaceChildren();for(let i=0;i<Math.min(500,Math.max(25,rows.length+5));i++)add(rows[i]);error.textContent='';}
  tableBody.addEventListener('paste',e=>{const input=e.target.closest('input');if(!input)return;e.preventDefault();try{const data=parseRosterPaste(e.clipboardData.getData('text/plain')),rowIndex=input.closest('tr').sectionRowIndex,colIndex=['studentId','name','group'].indexOf(input.dataset.field);
      if(data.some(r=>r.length+colIndex>3))throw Error('請複製「學號、姓名」兩欄，或加上第三欄「組別」，從學號欄貼上。');
      if(rowIndex+data.length>500)throw Error('名冊最多500列。');
      while(tableBody.rows.length<rowIndex+data.length)add();
      data.forEach((r,i)=>r.forEach((value,j)=>{tableBody.rows[rowIndex+i].querySelectorAll('input')[colIndex+j].value=value.trim();}));error.textContent='';
    }catch(err){error.textContent=err.message;}
  });
  write([]);return {read,write,add:()=>{try{for(let i=0;i<10 && tableBody.rows.length<500;i++)add();}catch(e){error.textContent=e.message;}}};
}