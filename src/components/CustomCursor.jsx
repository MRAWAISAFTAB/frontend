import { useEffect, useRef, useState } from 'react'

const CustomCursor = () => {
  const dotRef  = useRef(null)
  const ringRef = useRef(null)
  const [state, setState] = useState('default') // 'default' | 'hover' | 'click' | 'hidden'

  useEffect(() => {
    const dot  = dotRef.current
    const ring = ringRef.current

    let mouseX = 0, mouseY = 0
    let ringX  = 0, ringY  = 0
    let raf

    const onMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`
    }

    const animate = () => {
      ringX += (mouseX - ringX) * 0.10
      ringY += (mouseY - ringY) * 0.10
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`
      raf = requestAnimationFrame(animate)
    }

    const isInteractive = (el) =>
      el.closest('a, button, [role="button"], input, textarea, select, label, [data-cursor]')

    const onOver  = (e) => { if (isInteractive(e.target)) setState('hover') }
    const onOut   = (e) => { if (isInteractive(e.target)) setState('default') }
    const onDown  = () => setState('click')
    const onUp    = () => setState('default')
    const onLeave = () => setState('hidden')
    const onEnter = () => setState('default')

    window.addEventListener('mousemove',  onMove)
    window.addEventListener('mouseover',  onOver)
    window.addEventListener('mouseout',   onOut)
    window.addEventListener('mousedown',  onDown)
    window.addEventListener('mouseup',    onUp)
    document.documentElement.addEventListener('mouseleave', onLeave)
    document.documentElement.addEventListener('mouseenter', onEnter)

    raf = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove',  onMove)
      window.removeEventListener('mouseover',  onOver)
      window.removeEventListener('mouseout',   onOut)
      window.removeEventListener('mousedown',  onDown)
      window.removeEventListener('mouseup',    onUp)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.documentElement.removeEventListener('mouseenter', onEnter)
      cancelAnimationFrame(raf)
    }
  }, [])

  const isHidden = state === 'hidden'
  const isHover  = state === 'hover'
  const isClick  = state === 'click'

  return (
    <>
      {/* Hide default cursor globally */}
      <style>{`*, *::before, *::after { cursor: none !important; }`}</style>

      {/* ── Dot — uses mix-blend-mode: difference to auto-invert ── */}
      <div
        ref={dotRef}
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          pointerEvents: 'none',
          zIndex:        999999,
          willChange:    'transform',
          mixBlendMode:  'difference',   // ✅ inverts on any bg color
          opacity:       isHidden ? 0 : 1,
          transition:    'opacity 0.3s',
        }}
      >
        <div style={{
          width:         isHover ? '10px' : isClick ? '4px' : '8px',
          height:        isHover ? '10px' : isClick ? '4px' : '8px',
          background:    '#ffffff',
          borderRadius:  '50%',
          transform:     'translate(-50%, -50%)',
          transition:    'width 0.2s cubic-bezier(.25,.46,.45,.94), height 0.2s cubic-bezier(.25,.46,.45,.94)',
        }} />
      </div>

      {/* ── Ring ── */}
      <div
        ref={ringRef}
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          pointerEvents: 'none',
          zIndex:        999998,
          willChange:    'transform',
          mixBlendMode:  'difference',   // ✅ inverts on dark buttons, light areas
          opacity:       isHidden ? 0 : 1,
          transition:    'opacity 0.3s',
        }}
      >
        <div style={{
          width:         isClick ? '22px' : isHover ? '54px' : '36px',
          height:        isClick ? '22px' : isHover ? '54px' : '36px',
          border:        '1.5px solid #ffffff',
          borderRadius:  '50%',
          background:    isHover ? 'rgba(255,255,255,0.15)' : 'transparent',
          transform:     'translate(-50%, -50%)',
          transition:    [
            'width 0.35s cubic-bezier(.25,.46,.45,.94)',
            'height 0.35s cubic-bezier(.25,.46,.45,.94)',
            'background 0.25s',
          ].join(', '),
        }} />
      </div>
    </>
  )
}

export default CustomCursor