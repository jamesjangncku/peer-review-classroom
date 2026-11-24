// Keep this mapping identical when provisioning Firebase Authentication accounts.
export function loginEmail(input) {
  const identity = String(input ?? '').trim();
  if (identity.includes('@')) return identity;
  if (!/^[a-z0-9]{5,20}$/i.test(identity)) {
    throw new Error('請輸入有效學號，或教師的 Email。');
  }
  return `${identity.toLowerCase()}@student.peer-review-classroom.invalid`;
}