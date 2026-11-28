import { questionsFor, validateQuestions } from './assessment-tools.js';
export function rosterIds(text) {
  return [...new Set(text.toUpperCase().split(/[\s,，;；]+/).filter(Boolean))];
}
export function assessmentDraft(course, students, values) {
  if (!course) throw Error('請先建立並選擇課程。');
  const members = course.memberUids.map(uid => students.find(s => s.id === uid)).filter(Boolean);
  if (members.length < 2) throw Error('課程至少需要兩位學生。');
  const questionConfigs=validateQuestions(values.questionConfigs||questionsFor({rubric:values.rubric}));
  const rubric = questionConfigs.map(q=>q.title).map(s => s.trim()).filter(Boolean);
  if (!values.title.trim() || rubric.length < 1 || rubric.length > 12) throw Error('請填寫題目與 1～12 個評分項目。');
  let targets = members.map(s => `${s.name}（${s.studentId}）`);
  if (targets.some(s => s.includes('/'))) throw Error('學生姓名或學號不可含斜線。');
  const groupByUid=Object.fromEntries(members.map(s=>[s.id,(course.groupByUid?.[s.id]||'').trim()]));
  const grouped=Object.values(groupByUid).some(Boolean);
  const presentationType=values.presentationType||'all';
  if(presentationType!=='students' && grouped && (Object.values(groupByUid).some(g=>!g)||new Set(Object.values(groupByUid)).size<2))throw Error('分組互評需每位學生都有組別，且至少兩組。');
  let targetUids=Object.fromEntries(targets.map((t,i)=>[t,members[i].id]));
  let targetMembers=Object.fromEntries(targets.map((t,i)=>[t,[members[i].id]]));
  let reviewMode=grouped?'other-groups':'all-others';
  if(presentationType==='students'){const selected=values.presenterIds||[];targets=targets.filter(t=>selected.includes(targetUids[t]));reviewMode='selected-students';}
  if(presentationType==='groups'){if(!grouped)throw Error('請先在課程名冊設定組別。');const selected=values.presenterIds||[];targets=[...new Set(selected)].filter(g=>Object.values(groupByUid).includes(g)).map(g=>'第'+g+'組');targetMembers=Object.fromEntries(targets.map(t=>[t,members.filter(s=>'第'+groupByUid[s.id]+'組'===t).map(s=>s.id)]));targetUids=Object.fromEntries(targets.map(t=>[t,'']));reviewMode='selected-groups';}
  if(!targets.length)throw Error('請至少指定一位報告者或一個報告組別。');
  if(targets.some(t=>t.includes('/')))throw Error('報告者或組別名稱不可包含斜線。');
  return {questionsLocked:false,schemaVersion:2,questionConfigs,instructions:(values.instructions||'').trim(),allowRevision:!!values.allowRevision,anonymous:values.anonymous!==false,presentationType,presenterIds:values.presenterIds||[],targetMembers, title: values.title.trim(), courseId: course.id, className: course.name,
    rubric, targets, targetUids,
    evaluatorUids: members.map(s=>s.id), reviewMode,groupByUid,deleted:false,active:false, status:'draft' };
}
export function templateValues(a) {
  return {rubric:[...a.rubric],questionConfigs:structuredClone(questionsFor(a))};
}

export function reviewTargets(a,uid,name='') {
 return (a.currentTargets||a.targets).filter(t=>{if(a.targetMembers?.[t]?.includes(uid))return false;const targetUid=a.targetUids?.[t];if(targetUid?targetUid===uid:t===name)return false;return !targetUid&&a.targetMembers?.[t]?true:a.reviewMode!=='other-groups'||a.groupByUid?.[uid]!==a.groupByUid?.[targetUid];});
}
export function expectedReviews(a){return a.evaluatorUids?a.evaluatorUids.reduce((n,uid)=>n+reviewTargets(a,uid).length,0):a.targets.length*(a.targets.length-1);}

export function weeklyPresenters(a,course,students,type,selected){
 const targets=[...a.targets],targetUids={...a.targetUids},targetMembers={...a.targetMembers},currentTargets=[];
 // Backfill immutable identities for old individual assessments.
 for(const t of targets)if(!targetMembers[t]&&targetUids[t])targetMembers[t]=[targetUids[t]];
 const eligible=a.evaluatorUids||[];
 for(const id of [...new Set(selected)]){
   let label,members;
   if(type==='students'){
     if(!eligible.includes(id))throw Error('報告學生不在本評量名冊中。');
     const s=students.find(s=>s.id===id);label=targets.find(t=>targetUids[t]===id)||`${s?.name}（${s?.studentId}）`;
     if(!s)throw Error('找不到學生帳號。');members=[id];
   }else if(type==='groups'){
     label='第'+id+'組';members=targetMembers[label]||eligible.filter(uid=>course.groupByUid?.[uid]===id);
     if(!members.length)throw Error('該組沒有本評量的學生。');
   }else throw Error('請選擇學生或組別。');
   if(label.includes('/'))throw Error('名稱不可包含斜線。');
   if(!targets.includes(label)){targets.push(label);targetUids[label]=type==='students'?id:'';targetMembers[label]=members;}
   currentTargets.push(label);
 }
 return {targets,targetUids,targetMembers,currentTargets,weeklyType:type};
}

