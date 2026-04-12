export default function StreakBadge({ streak = 0 }) {
  if (!streak) return null
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: 'var(--success-bg)',
        border: '1px solid #BBF7D0',
        borderRadius: 99,
        padding: '5px 14px',
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--success)',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'var(--success-line)',
          display: 'inline-block',
          boxShadow: '0 0 0 3px #BBF7D0',
        }}
      />
      {streak} day streak
    </div>
  )
}
