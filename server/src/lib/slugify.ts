export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function uniqueSlug(
  base: string,
  checkFn: (slug: string) => Promise<boolean>,
): Promise<string> {
  let slug = toSlug(base)
  let exists = await checkFn(slug)
  let i = 1
  while (exists) {
    slug = `${toSlug(base)}-${i++}`
    exists = await checkFn(slug)
  }
  return slug
}
