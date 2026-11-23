import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
const html=readFileSync('index.html','utf8'), app=readFileSync('app.js','utf8'), rules=readFileSync('firestore.rules','utf8'), workflow=readFileSync('.github/workflows/pages.yml','utf8');
for(const id of ['login-view','student-view','teacher-view','assignment-dialog','student-content','stats','chart','results-table']) assert.ok(html.includes(`id="${id}"`),`missing UI node: ${id}`);
for(const flow of ['signInWithEmailAndPassword','onSnapshot','submitReview','renderTeacher','serverTimestamp']) assert.ok(app.includes(flow),`missing app flow: ${flow}`);
for(const rule of ["request.auth.token.teacher == true","allow update, delete: if false","scores.hasOnly([1, 2, 3, 4, 5])","!exists(/databases/$(database)/documents/submissions/$(id))"]) assert.ok(rules.includes(rule),`missing Firestore protection: ${rule}`);
assert.ok(workflow.includes('actions/deploy-pages@v4')); assert.ok(existsSync('firebase-config.js.example'));
console.log('Smoke checks passed: UI entry points, auth/live data flows, Firestore safeguards, and Pages workflow.');

