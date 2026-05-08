type Props = {
  className?: string;
};

const layeredBackground = `
  linear-gradient(
    180deg,
    rgb(241 245 249 / 0.05) 0%,
    transparent 38%
  ),
  linear-gradient(
    90deg,
    rgb(148 163 184 / 0.04) 0%,
    transparent 11%,
    transparent 89%,
    rgb(167 243 208 / 0.07) 100%
  ),
  linear-gradient(
    90deg,
    rgb(120 139 159 / 0.14) 0%,
    rgb(93 117 146 / 0.1) 20%,
    rgb(71 132 154 / 0.09) 40%,
    rgb(53 169 173 / 0.11) 60%,
    rgb(72 217 173 / 0.14) 80%,
    rgb(94 231 206 / 0.12) 100%
  ),
  linear-gradient(
    0deg,
    rgb(8 13 20 / 0.5) 0%,
    transparent 38%
  )
`;

export default function WaveMeshBackground({ className = '' }: Props) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`.trim()}
      aria-hidden
    >
      <div className="absolute inset-0" style={{ backgroundImage: layeredBackground }} />
    </div>
  );
}
