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
  return { title: values.title.trim(), courseId: course.id, className: course.name,
    rubric, targets, targetUids: Object.fromEntries(targets.map((t,i)=>[t,members[i].id])),
    evaluatorUids: members.map(s=>s.id), perStudent: Math.min(members.length - 1,Math.max(1,Math.floor(Number(values.perStudent)||1))), active:false, status:'draft' };
}
export function templateValues(a) {
  return {rubric:[...a.rubric], perStudent:a.perStudent};
}