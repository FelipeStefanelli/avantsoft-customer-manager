export function firstMissingLetter(fullName: string): string {
  const seen = new Set(fullName.toLowerCase().replace(/[^a-z]/g, '').split(''));
  for (let code = 97; code <= 122; code++) {
    const letter = String.fromCharCode(code);
    if (!seen.has(letter)) return letter;
  }
  return '-';
}
