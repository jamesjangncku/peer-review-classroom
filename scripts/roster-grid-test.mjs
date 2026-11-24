import assert from 'node:assert/strict';
import {parseRosterPaste,validateRosterRows} from '../roster-grid.js';
assert.deepEqual(parseRosterPaste('學號\t姓名\r\nA10210000\t學生一\r\nB10210000\t學生二\r\n'),[['A10210000','學生一'],['B10210000','學生二']]);
assert.deepEqual(validateRosterRows([{studentId:' a10210000 ',name:' 學生一 '},{studentId:'',name:''}]),[{studentId:'A10210000',name:'學生一'}]);
assert.throws(()=>validateRosterRows([{studentId:'A10210000',name:'學生一'},{studentId:'a10210000',name:'學生二'}]),/重複/);
assert.throws(()=>validateRosterRows([{studentId:'A10210000',name:''}]),/同時填寫/);
assert.throws(()=>validateRosterRows([{studentId:'',name:'學生一'}]),/同時填寫/);
console.log('Roster grid passed: Excel TSV/header/CRLF, blank rows, ID normalization, duplicate and incomplete row checks.');

assert.deepEqual(validateRosterRows([{studentId:'A10210000',name:'學生一',group:' 甲 '}]),[{studentId:'A10210000',name:'學生一',group:'甲'}]);
assert.deepEqual(parseRosterPaste('學號\t姓名\t組別\nA10210000\t學生一\t甲'),[['A10210000','學生一','甲']]);