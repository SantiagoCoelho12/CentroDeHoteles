import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Ilustraciones propias para pruebas: no representan establecimientos reales.
const directory = path.join(process.cwd(), 'public/fotos/prueba');
await mkdir(directory, { recursive: true });
const images = [
  ['general', 'GENERAL · ÁREAS COMPARTIDAS', '#c9dedb', '<rect x="110" y="250" width="740" height="230" rx="80" fill="#7caeb7"/><rect x="140" y="280" width="680" height="170" rx="60" fill="#b5e1e5"/><path d="M160 330h630M160 390h630" stroke="#e3f6f2" stroke-width="6"/>'],
  ['hotel-1', 'HOTEL · HABITACIÓN', '#dfcdb4', '<rect x="110" y="210" width="220" height="190" fill="#f5ecde"/><path d="M220 210v190M110 305h220" stroke="#a9bfc0" stroke-width="12"/><rect x="440" y="290" width="350" height="170" rx="8" fill="#92765e"/><rect x="420" y="340" width="390" height="130" rx="12" fill="#fff9eb"/><rect x="450" y="315" width="140" height="55" rx="9" fill="#e4d8c2"/><rect x="620" y="315" width="140" height="55" rx="9" fill="#e4d8c2"/>'],
  ['hotel-2', 'HOTEL · RECEPCIÓN', '#d6d0c0', '<rect x="120" y="220" width="240" height="200" fill="#91b8b9"/><path d="M240 220v200" stroke="#fff9eb" stroke-width="10"/><rect x="440" y="320" width="340" height="150" fill="#9d7659"/><rect x="420" y="310" width="380" height="20" rx="5" fill="#f3e7d6"/><rect x="575" y="235" width="95" height="65" rx="4" fill="#244854"/><path d="M622 300v15" stroke="#244854" stroke-width="9"/>'],
  ['cabanas-1', 'CABAÑAS · EXTERIOR', '#cbd7c0', '<path d="M140 300 360 160 580 300Z" fill="#735340"/><rect x="180" y="300" width="360" height="190" fill="#ba9168"/><rect x="315" y="350" width="90" height="140" fill="#725744"/><rect x="215" y="335" width="70" height="70" fill="#bddddd"/><rect x="435" y="335" width="70" height="70" fill="#bddddd"/><path d="M750 170 650 370h200Z" fill="#61866e"/><rect x="740" y="355" width="20" height="135" fill="#80624c"/>'],
  ['cabanas-2', 'CABAÑAS · INTERIOR', '#e5d6bc', '<path d="M100 240 470 120 840 240" fill="none" stroke="#a07852" stroke-width="18"/><rect x="130" y="280" width="250" height="180" fill="#bb916b"/><rect x="140" y="260" width="230" height="35" fill="#f5f0dd"/><rect x="475" y="330" width="300" height="135" rx="15" fill="#8ca7a0"/><rect x="455" y="365" width="35" height="120" rx="12" fill="#668981"/><rect x="760" y="365" width="35" height="120" rx="12" fill="#668981"/>'],
];
for (const [name, label, background, scene] of images) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="0 0 960 640"><rect width="960" height="640" fill="${background}"/><rect y="480" width="960" height="160" fill="#f7f1e6"/>${scene}<text x="48" y="65" font-family="Arial,sans-serif" font-size="18" fill="#23434c">IMAGEN ILUSTRATIVA DE PRUEBA</text><text x="48" y="555" font-family="Arial,sans-serif" font-size="30" fill="#23434c">${label}</text><text x="48" y="596" font-family="Arial,sans-serif" font-size="18" fill="#526668">No representa un alojamiento real</text></svg>`;
  await writeFile(path.join(directory, `${name}.svg`), svg);
}
console.log('5 imágenes ilustrativas de prueba creadas.');
