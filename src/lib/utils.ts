export function calculateAge(birthdateStr: string): number {
  if (!birthdateStr) return 24;
  const birthDate = new Date(birthdateStr);
  if (isNaN(birthDate.getTime())) return 24;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(0, age);
}
