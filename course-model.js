export function rosterIds(text) {
  return [...new Set(text.toUpperCase().split(/[\s,，;；]+/).filter(Boolean))];
}
export function assessmentDraft(course, students, values) {
  if (!course) throw Error('請先建立並選擇課程。');
  const members = course.memberUids.map(uid => students.find(s => s.id === uid)).filter(Boolean);
  if (members.length < 2) throw Error('課程至少需要兩位學生。');
  const rubric = values.rubric.map(s => s.trim()).filter(Boolean);
  if (!values.title.trim() || rubric.length < 1 || rubric.length > 12) throw Error('請填寫題目與 1～12 個評分項目。');
  const targets = members.map(s => `${s.name}（${s.studentId}）`);
  if (targets.some(s => s.includes('/'))) throw Error('學生姓名或學號不可含斜線。');
  const groupByUid=Object.fromEntries(members.map(s=>[s.id,(course.groupByUid?.[s.id]||'').trim()]));
  const grouped=Object.values(groupByUid).some(Boolean);
  if(grouped && (Object.values(groupByUid).some(g=>!g)||new Set(Object.values(groupByUid)).size<2))throw Error('分組互評需每位學生都有組別，且至少兩組。');
  return { title: values.title.trim(), courseId: course.id, className: course.name,
    rubric, targets, targetUids: Object.fromEntries(targets.map((t,i)=>[t,members[i].id])),
    evaluatorUids: members.map(s=>s.id), reviewMode:grouped?'other-groups':'all-others',groupByUid,deleted:false,active:false, status:'draft' };
}
export function templateValues(a) {
  return {rubric:[...a.rubric]};
}

export function reviewTargets(a,uid,name='') {
 return a.targets.filter(t=>{const targetUid=a.targetUids?.[t];if(targetUid?targetUid===uid:t===name)return false;return a.reviewMode!=='other-groups'||a.groupByUid?.[uid]!==a.groupByUid?.[targetUid];});
}
export function expectedReviews(a){return a.evaluatorUids?a.evaluatorUids.reduce((n,uid)=>n+reviewTargets(a,uid).length,0):a.targets.length*(a.targets.length-1);}