export function publicPath(path: string): string {
  const normalizedPath = path.replace(/^\/+/, '');

  return `./${normalizedPath}`;
}
