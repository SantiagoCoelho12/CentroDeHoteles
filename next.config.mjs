const pages = process.env.GITHUB_PAGES === 'true';
const basePath = pages ? (process.env.PAGES_BASE_PATH ?? '/CentroDeHoteles') : '';

/** @type {import('next').NextConfig} */
export default {
  ...(pages ? { output: 'export', trailingSlash: true, pageExtensions: ['tsx'] } : {}),
  basePath,
  images: { unoptimized: pages },
  env: { NEXT_PUBLIC_BASE_PATH: basePath, NEXT_PUBLIC_STATIC_DEMO: pages ? 'true' : 'false' },
};
