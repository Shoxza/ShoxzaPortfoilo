/** Whole years between a YYYY-MM-DD birth date and today. */
export function ageOn(born: string, today: Date): number {
  const [y, m, d] = born.split('-').map(Number)
  let age = today.getFullYear() - y
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age--
  return age
}
