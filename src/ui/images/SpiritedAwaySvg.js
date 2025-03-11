import React from 'react';

export function SpiritedAwaySvg({ width = 100, height = 100 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          {`
            .cls-1 { fill: #00adfe; }
            .cls-2 { fill: #356cb6; opacity: 0.3; }
            .cls-3, .cls-8 { fill: #393c54; }
            .cls-4 { fill: #ffffff; }
            .cls-5, .cls-6 { fill: none; stroke: #393c54; stroke-linecap: round; stroke-miterlimit: 10; }
            .cls-5 { stroke-width: 5.51px; }
            .cls-6 { stroke-width: 2.21px; }
            .cls-7 { fill: #a7aece; }
            .cls-8 { opacity: 0.2; }
          `}
        </style>
      </defs>
      <circle className="cls-1" cx="64" cy="64" r="60" />
      <circle className="cls-2" cx="64" cy="64" r="48" />
      <path className="cls-3" d="M64,124a59.8,59.8,0,0,0,41.54-16.72c-1-22.43-3.94-55.49-12.65-75.18C88.06,21.18,76.74,13.88,64,13.88h0c-12.74,0-24.65,7-28.89,18.22C27.58,51.93,24.35,85.33,23,107.76A59.74,59.74,0,0,0,64,124Z" />
      <path className="cls-4" d="M84.13,36.13c-3.52-8.48-10.48-12.82-19.74-13v0h-.78v0c-9.26.22-16.22,4.56-19.74,13-3.63,8.71-4.83,21.77,0,39.19,4.69,17,10.54,20.49,19.74,20.67h.78c9.2-.18,15-3.72,19.74-20.67C89,57.9,87.76,44.84,84.13,36.13Z" />
      <line className="cls-5" x1="77.58" x2="81.99" y1="52.83" y2="52.83" />
      <path className="cls-3" d="M68.5,88a30.85,30.85,0,0,1-9,0c-1.25-.33-2.5-1.12-2.5-2.5s1.2-2.13,2.5-2.5a20.4,20.4,0,0,1,9,0c1.21.31,2.5,1.12,2.5,2.5S69.73,87.68,68.5,88Z" />
      <path className="cls-6" d="M82.05,58.11a9.91,9.91,0,0,1-5.73-.37" />
    </svg>
  );
}
