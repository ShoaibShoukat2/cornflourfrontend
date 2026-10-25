const InstovaMark = ({ size = 48, crowned = false }) => (
  <span className={`lux-mark${crowned ? ' lux-mark-crowned' : ''}`} style={{ width: size, height: size }}>
    {crowned && (
      <svg className="lux-crown" viewBox="0 0 24 14" aria-hidden="true">
        <path d="M2 12 L5 4 L9 9 L12 2 L15 9 L19 4 L22 12 Z" />
      </svg>
    )}
    <span className="lux-mark-face" aria-hidden="true">
      <span className="lux-mark-letter">I</span>
    </span>
  </span>
);

export default InstovaMark;
