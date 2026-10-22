export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
/** Next Link agrega basePath automáticamente; las imágenes y URLs nativas no. */
export function assetPath(path: string) { return `${basePath}${path}`; }
