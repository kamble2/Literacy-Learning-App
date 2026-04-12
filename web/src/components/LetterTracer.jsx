/**
 * LetterTracer — web SVG adaptation of MyApp/components/LetterTracing.tsx
 * Light theme: warm white canvas, warm gray guides, indigo user strokes.
 */
import { useState, useCallback, useEffect, useRef } from 'react'
import { svgPathProperties } from 'svg-path-properties'

export default function LetterTracer({
  guidePaths = [],
  viewBox = '0 0 200 200',
  strokeWidth = 12,
  tolerance = 15,
  letterKey,
  onLetterComplete,
}) {
  const svgRef = useRef(null)
  const [userStrokes, setUserStrokes] = useState([])
  const [currentStrokeIndex, setCurrentStrokeIndex] = useState(0)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isOffTrack, setIsOffTrack] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [sampledStrokes, setSampledStrokes] = useState([])

  const maxCoveredIndex = useRef(0)
  const consecutiveOffTrack = useRef(0)

  const handleResetAll = useCallback(() => {
    setUserStrokes(guidePaths.map(() => []))
    setCurrentStrokeIndex(0)
    setIsDrawing(false)
    setIsOffTrack(false)
    setIsCompleted(false)
    maxCoveredIndex.current = 0
    consecutiveOffTrack.current = 0
  }, [guidePaths])

  useEffect(() => {
    if (!guidePaths.length) return
    try {
      const strokes = guidePaths.map(pathStr => {
        const props = new svgPathProperties(pathStr)
        const len = props.getTotalLength()
        const pts = []
        for (let i = 0; i <= len; i += 4) {
          const pt = props.getPointAtLength(i)
          pts.push({ x: pt.x, y: pt.y })
        }
        const end = props.getPointAtLength(len)
        pts.push({ x: end.x, y: end.y })
        return pts
      })
      setSampledStrokes(strokes)
      handleResetAll()
    } catch (e) {
      console.error('LetterTracer: failed to sample SVG paths', e)
    }
  }, [guidePaths, handleResetAll])

  const getSVGPoint = useCallback(
    (clientX, clientY) => {
      const svg = svgRef.current
      if (!svg) return null
      const rect = svg.getBoundingClientRect()
      const [, , vbW, vbH] = viewBox.split(' ').map(Number)
      return {
        x: (clientX - rect.left) * (vbW / rect.width),
        y: (clientY - rect.top) * (vbH / rect.height),
      }
    },
    [viewBox]
  )

  const dist = (a, b) => Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2)

  const resetCurrentStroke = useCallback(() => {
    setIsDrawing(false)
    setIsOffTrack(false)
    maxCoveredIndex.current = 0
    consecutiveOffTrack.current = 0
    setUserStrokes(prev => {
      const copy = [...prev]
      copy[currentStrokeIndex] = []
      return copy
    })
  }, [currentStrokeIndex])

  const validatePoint = useCallback(
    (pt, isStart = false) => {
      if (!sampledStrokes.length || isCompleted) return false
      const sampled = sampledStrokes[currentStrokeIndex]
      if (!sampled) return false

      let closestIndex = -1
      let minDist = Infinity
      const startIdx = isStart ? 0 : maxCoveredIndex.current
      const endIdx = Math.min(sampled.length, startIdx + 20)

      for (let i = startIdx; i < endIdx; i++) {
        const d = dist(pt, sampled[i])
        if (d < minDist) { minDist = d; closestIndex = i }
      }

      if (isStart) {
        if (minDist > tolerance * 2 || closestIndex > 8) return false
        maxCoveredIndex.current = closestIndex
        setIsOffTrack(false)
        return true
      }

      if (minDist > tolerance) {
        setIsOffTrack(true)
        consecutiveOffTrack.current += 1
        if (consecutiveOffTrack.current > 15) { resetCurrentStroke(); return false }
      } else {
        setIsOffTrack(false)
        consecutiveOffTrack.current = 0
        if (closestIndex > maxCoveredIndex.current) maxCoveredIndex.current = closestIndex
      }
      return true
    },
    [sampledStrokes, currentStrokeIndex, tolerance, isCompleted, resetCurrentStroke]
  )

  const handleDown = useCallback(
    (clientX, clientY) => {
      if (isCompleted || !guidePaths.length) return
      const pt = getSVGPoint(clientX, clientY)
      if (!pt) return
      if (validatePoint(pt, true)) {
        setIsDrawing(true)
        consecutiveOffTrack.current = 0
        setUserStrokes(prev => {
          const copy = [...prev]
          copy[currentStrokeIndex] = [pt]
          return copy
        })
      } else {
        setIsOffTrack(true)
        setTimeout(() => setIsOffTrack(false), 300)
      }
    },
    [isCompleted, guidePaths.length, getSVGPoint, validatePoint, currentStrokeIndex]
  )

  const handleMove = useCallback(
    (clientX, clientY) => {
      if (!isDrawing || isCompleted) return
      const pt = getSVGPoint(clientX, clientY)
      if (!pt) return
      setUserStrokes(prev => {
        const copy = [...prev]
        if (copy[currentStrokeIndex]) copy[currentStrokeIndex] = [...copy[currentStrokeIndex], pt]
        return copy
      })
      validatePoint(pt)
    },
    [isDrawing, isCompleted, getSVGPoint, currentStrokeIndex, validatePoint]
  )

  const handleUp = useCallback(() => {
    if (!isDrawing) return
    setIsDrawing(false)
    setIsOffTrack(false)
    if (sampledStrokes.length && currentStrokeIndex < sampledStrokes.length) {
      const sampled = sampledStrokes[currentStrokeIndex]
      if (maxCoveredIndex.current >= sampled.length - 8) {
        const next = currentStrokeIndex + 1
        if (next >= sampledStrokes.length) {
          setIsCompleted(true)
          onLetterComplete?.(letterKey)
        } else {
          setCurrentStrokeIndex(next)
          maxCoveredIndex.current = 0
        }
      } else {
        resetCurrentStroke()
      }
    }
  }, [isDrawing, sampledStrokes, currentStrokeIndex, onLetterComplete, letterKey, resetCurrentStroke])

  const onMouseDown  = e => { e.preventDefault(); handleDown(e.clientX, e.clientY) }
  const onMouseMove  = e => { e.preventDefault(); handleMove(e.clientX, e.clientY) }
  const onMouseUp    = e => { e.preventDefault(); handleUp() }
  const onTouchStart = e => { e.preventDefault(); const t = e.touches[0]; handleDown(t.clientX, t.clientY) }
  const onTouchMove  = e => { e.preventDefault(); const t = e.touches[0]; handleMove(t.clientX, t.clientY) }
  const onTouchEnd   = e => { e.preventDefault(); handleUp() }

  const canvasBorder = isOffTrack ? '#EF4444' : isCompleted ? '#22C55E' : 'var(--border)'
  const canvasShadow = isCompleted
    ? '0 0 0 4px #DCFCE7, var(--shadow-md)'
    : isOffTrack
    ? '0 0 0 3px #FEE2E2'
    : 'var(--shadow-md)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%', maxWidth: 400 }}>
      <div
        style={{
          width: '100%',
          aspectRatio: '1',
          background: '#FFFFFF',
          borderRadius: 'var(--r-lg)',
          position: 'relative',
          border: `2px solid ${canvasBorder}`,
          boxShadow: canvasShadow,
          transition: 'border-color 0.2s, box-shadow 0.3s',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle, #E8E3D8 1px, transparent 1px)',
            backgroundSize: '18px 18px',
            opacity: 0.6,
            pointerEvents: 'none',
          }}
        />

        <svg
          ref={svgRef}
          viewBox={viewBox}
          style={{ position: 'relative', width: '100%', height: '100%', display: 'block', touchAction: 'none', userSelect: 'none' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {guidePaths.map((d, i) => {
            const isPast    = i < currentStrokeIndex
            const isCurrent = i === currentStrokeIndex
            return (
              <path
                key={`g${i}`}
                d={d}
                stroke={isPast || isCompleted ? '#BBF7D0' : isCurrent ? '#D1C9BA' : '#E8E3D8'}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity={isCurrent && !isCompleted ? 1 : 0.8}
                pointerEvents="none"
              />
            )
          })}

          {userStrokes.map((pts, i) => {
            if (!pts.length) return null
            const points = pts.map(p => `${p.x},${p.y}`).join(' ')
            const color = i === currentStrokeIndex
              ? (isOffTrack ? '#EF4444' : '#4338CA')
              : '#22C55E'
            return (
              <polyline
                key={`s${i}`}
                points={points}
                stroke={color}
                strokeWidth={strokeWidth * 0.85}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                pointerEvents="none"
              />
            )
          })}
        </svg>

        {isCompleted && (
          <div
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'var(--success-bg)',
              border: '1px solid #BBF7D0',
              color: 'var(--success)',
              padding: '5px 14px',
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 700,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            Perfect
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0 2px' }}>
        <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'DM Mono, monospace' }}>
          stroke{' '}
          <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>
            {isCompleted ? 'complete' : `${currentStrokeIndex + 1} / ${guidePaths.length}`}
          </span>
        </span>
        <button
          onClick={handleResetAll}
          style={{
            background: 'var(--surface-2)',
            color: 'var(--text-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-sm)',
            padding: '6px 16px',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: "'Bricolage Grotesque', sans-serif",
            transition: 'background 0.1s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--border-soft)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-2)'}
        >
          Reset
        </button>
      </div>
    </div>
  )
}
