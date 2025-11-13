import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Spline from '@splinetool/react-spline'

const ms = (seconds) => seconds * 1000

const useSequencer = (steps, speed) => {
  const [index, setIndex] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (index >= steps.length - 1) return
    const duration = speed === 'fast' ? steps[index].fast || Math.min(steps[index].duration, 1500) : steps[index].duration
    timerRef.current = setTimeout(() => setIndex((i) => Math.min(i + 1, steps.length - 1)), duration)
    return () => clearTimeout(timerRef.current)
  }, [index, steps, speed])

  return [index, setIndex]
}

function Candle({ lit = true, delay = 0, label }) {
  return (
    <div className="relative flex flex-col items-center">
      <div className="w-3 h-8 bg-yellow-200 rounded-sm shadow-inner" />
      <div className="absolute -top-3">
        <AnimatePresence>
          {lit && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: delay / 1000, type: 'spring', stiffness: 200 }}
              className="w-3 h-3 bg-orange-400 rounded-full shadow-md"
            >
              <motion.span
                className="block w-3 h-3 bg-gradient-to-t from-orange-500 to-yellow-300 rounded-full"
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {label && <span className="mt-1 text-xs font-bold text-pink-600">{label}</span>}
    </div>
  )
}

const Confetti = ({ show }) => {
  const pieces = new Array(80).fill(0).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.8,
    color: ['#FF90BC', '#FFC0D9', '#A7F3D0', '#93C5FD', '#FDE68A'][i % 5],
  }))
  return (
    <AnimatePresence>
      {show && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {pieces.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: `${p.x}vw`, y: -20, rotate: 0, opacity: 0 }}
              animate={{ y: '110vh', rotate: 360, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.8, delay: p.delay, ease: 'easeOut' }}
              style={{
                width: 8,
                height: 14,
                backgroundColor: p.color,
                borderRadius: 2,
                position: 'absolute',
              }}
            />)
          )}
        </div>
      )}
    </AnimatePresence>
  )
}

function PartyApp() {
  const [speed, setSpeed] = useState('real') // 'real' or 'fast'

  const steps = useMemo(
    () => [
      { key: 'dark', duration: ms(60), fast: ms(2) },
      { key: 'doorAppears', duration: ms(3) },
      { key: 'boyArrives', duration: ms(3) },
      { key: 'doorOpens', duration: ms(3) },
      { key: 'insideDark', duration: ms(2) },
      { key: 'kiss', duration: ms(2) },
      { key: 'lightsOn', duration: ms(2) },
      { key: 'approachCake', duration: ms(3) },
      { key: 'makeWish', duration: ms(4) },
      { key: 'blowCandle', duration: ms(2) },
      { key: 'cutCake', duration: ms(3) },
      { key: 'feedCake', duration: ms(3) },
      { key: 'dance', duration: ms(8) },
      { key: 'fadeOut', duration: ms(2) },
      { key: 'message', duration: ms(1000) },
    ],
    []
  )

  const [index, setIndex] = useSequencer(steps, speed)
  const stage = steps[index].key

  // Simple pop sound when lights on and party popper
  const playedRef = useRef({ pop: false, music: false })
  useEffect(() => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const playPop = () => {
      const o = audioCtx.createOscillator()
      const g = audioCtx.createGain()
      o.type = 'triangle'
      o.frequency.setValueAtTime(600, audioCtx.currentTime)
      o.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.2)
      g.gain.setValueAtTime(0.2, audioCtx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25)
      o.connect(g)
      g.connect(audioCtx.destination)
      o.start()
      o.stop(audioCtx.currentTime + 0.25)
    }
    const playMusic = () => {
      const o = audioCtx.createOscillator()
      const g = audioCtx.createGain()
      o.type = 'sine'
      o.frequency.setValueAtTime(440, audioCtx.currentTime)
      g.gain.setValueAtTime(0.0001, audioCtx.currentTime)
      g.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 1)
      o.connect(g)
      g.connect(audioCtx.destination)
      o.start()
      // fade out later
      setTimeout(() => {
        g.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 2)
        setTimeout(() => o.stop(), 2000)
      }, speed === 'fast' ? 2500 : 7000)
    }

    if (stage === 'lightsOn' && !playedRef.current.pop) {
      playedRef.current.pop = true
      playPop()
    }
    if (stage === 'dance' && !playedRef.current.music) {
      playedRef.current.music = true
      playMusic()
    }
    // cleanup not strictly necessary for short sounds
  }, [stage, speed])

  const isDark = ['dark', 'doorAppears', 'boyArrives', 'doorOpens', 'insideDark', 'kiss'].includes(stage)
  const showConfetti = ['lightsOn', 'approachCake'].includes(stage)

  const candleLit = !['blowCandle', 'cutCake', 'feedCake', 'dance', 'fadeOut', 'message'].includes(stage)

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-sky-100">
      <div className="absolute inset-0" aria-hidden>
        <Spline scene="https://prod.spline.design/pVLJXSVq3zyQq0OD/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="text-sky-900 font-extrabold text-xl sm:text-2xl">21st Bash</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSpeed((s) => (s === 'real' ? 'fast' : 'real'))}
              className="px-3 py-1.5 rounded-full bg-white/70 backdrop-blur text-sky-800 text-sm shadow hover:bg-white transition"
            >
              {speed === 'real' ? 'Skip Faster' : 'Play Real Time'}
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1.5 rounded-full bg-white/70 backdrop-blur text-sky-800 text-sm shadow hover:bg-white transition"
            >
              Restart
            </button>
          </div>
        </header>

        <main className="relative flex-1 flex items-center justify-center px-4 pb-10">
          {/* Room / Hall */}
          <div className="relative w-full max-w-5xl aspect-[16/9] bg-gradient-to-b from-white/80 to-sky-100/80 rounded-3xl shadow-2xl border border-white/40 overflow-hidden">
            {/* Decorations */}
            <Balloons />
            <Garlands />
            <Flowers />

            {/* Door & Characters */}
            <AnimatePresence>
              {['doorAppears', 'boyArrives', 'doorOpens'].includes(stage) && (
                <motion.div
                  key="door"
                  initial={{ x: '-20%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 120 }}
                  className="absolute left-6 bottom-6 w-28 sm:w-36 h-48 sm:h-64 bg-amber-700 rounded-md shadow-lg border-4 border-amber-900"
                >
                  <div className="absolute top-1/2 -translate-y-1/2 right-2 w-2 h-2 bg-yellow-300 rounded-full" />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {['boyArrives', 'doorOpens'].includes(stage) && (
                <motion.div
                  key="boy"
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 20, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 140 }}
                  className="absolute left-24 bottom-8 flex items-end gap-2"
                >
                  <Character type="boy" />
                  {stage === 'boyArrives' && (
                    <Speech text="Ding-dong!" />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {['doorOpens', 'insideDark', 'kiss', 'lightsOn', 'approachCake', 'makeWish', 'blowCandle', 'cutCake', 'feedCake', 'dance'].includes(stage) && (
                <motion.div
                  key="girl"
                  initial={{ x: -40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 140 }}
                  className="absolute left-44 bottom-8"
                >
                  <Character type="girl" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Center Table with Cake */}
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 120 }}
              className="absolute left-1/2 -translate-x-1/2 bottom-6 w-72 sm:w-96"
            >
              <div className="mx-auto w-full h-3 bg-amber-900/80 rounded-full blur-sm" />
              <div className="relative mx-auto -mt-1 w-full h-24 bg-amber-200 rounded-xl border-4 border-amber-400 shadow-xl">
                <div className="absolute inset-x-6 -top-20 flex items-end justify-center gap-4">
                  <Cake candleLit={candleLit} />
                </div>
              </div>
            </motion.div>

            {/* Dialogues */}
            <AnimatePresence>
              {stage === 'doorOpens' && (
                <motion.div
                  key="ask-in"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-72 bottom-36"
                >
                  <Speech text="Come inside!" hue="pink" />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {stage === 'insideDark' && (
                <motion.div
                  key="what"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-80 bottom-40"
                >
                  <Speech text="Why is it so dark?" />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {stage === 'kiss' && (
                <motion.div
                  key="kiss"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-[22rem] bottom-40"
                >
                  <Speech text="Shh..." hue="pink" />
                </motion.div>
              )}
            </AnimatePresence>

            <Confetti show={showConfetti} />

            {/* Dancing state positioning */}
            {['dance'].includes(stage) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <motion.div
                  animate={{ rotate: [0, -2, 2, 0], scale: [1, 1.02, 0.98, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="flex items-center gap-6"
                >
                  <Character type="boy" mood="smile" large />
                  <Character type="girl" mood="smile" large />
                </motion.div>
              </motion.div>
            )}

            {/* Darkness overlay */}
            <motion.div
              initial={false}
              animate={{ opacity: isDark ? 0.85 : 0 }}
              transition={{ duration: 0.8 }}
              className="pointer-events-none absolute inset-0 bg-slate-900"
            />

            {/* Fade to end */}
            <AnimatePresence>
              {['fadeOut', 'message'].includes(stage) && (
                <motion.div
                  key="fade"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.85 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2 }}
                  className="absolute inset-0 bg-slate-900"/>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {stage === 'message' && (
                <motion.div
                  key="msg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute inset-0 flex items-center justify-center p-6 text-center"
                >
                  <div className="max-w-2xl">
                    <div className="text-3xl sm:text-5xl font-extrabold text-pink-200 mb-4">I really want to celebrate your birthday like this.</div>
                    <div className="text-xl sm:text-2xl text-pink-100">Do you want to?</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        <footer className="p-4 text-center text-sky-900/80 text-sm">
          Made with love, balloons, gyms and games 🏋️🎮🎈
        </footer>
      </div>
    </div>
  )
}

function Balloons() {
  const colors = ['#93C5FD', '#A7F3D0', '#FDE68A', '#FFC0D9', '#FF90BC']
  return (
    <div className="absolute inset-0 pointer-events-none">
      {new Array(10).fill(0).map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{ y: 0 }}
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 4 + (i % 3), delay: i * 0.2 }}
          style={{ left: `${5 + i * 9}%`, top: `${8 + (i % 4) * 6}%` }}
        >
          <div className="flex flex-col items-center">
            <div
              className="w-8 h-10 rounded-full shadow"
              style={{ background: colors[i % colors.length] }}
            />
            <div className="w-0.5 h-10 bg-slate-400/50" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function Garlands() {
  return (
    <svg className="absolute top-6 left-0 right-0 w-full h-24 opacity-80" viewBox="0 0 800 200" preserveAspectRatio="none">
      <path d="M0,40 C150,140 250,-20 400,60 C550,140 650,0 800,60" stroke="#FF90BC" strokeWidth="6" fill="none" />
      {new Array(12).fill(0).map((_, i) => (
        <circle key={i} cx={i * 65 + 30} cy={60 + (i % 2 === 0 ? 14 : -6)} r="10" fill={i % 2 ? '#93C5FD' : '#FDE68A'} />
      ))}
    </svg>
  )
}

function Flowers() {
  const petals = ['#FFB6C1', '#FFD1DC', '#C7F9E5', '#BFE0FF']
  return (
    <div className="absolute right-3 bottom-4 flex gap-3">
      {new Array(3).fill(0).map((_, i) => (
        <div key={i} className="relative w-10 h-10">
          {new Array(6).fill(0).map((__, j) => (
            <div key={j} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ transform: `translate(-50%, -50%) rotate(${j * 60}deg)` }}>
              <div className="w-4 h-6 rounded-full" style={{ background: petals[(i + j) % petals.length] }} />
            </div>
          ))}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-300 rounded-full" />
        </div>
      ))}
    </div>
  )
}

function Character({ type, mood = 'normal', large = false }) {
  const isBoy = type === 'boy'
  const skin = isBoy ? 'bg-amber-300' : 'bg-rose-200'
  const hair = isBoy ? 'bg-amber-800' : 'bg-rose-800'
  const outfit = isBoy ? 'from-sky-500 to-sky-700' : 'from-pink-400 to-pink-600'
  const size = large ? 'w-24' : 'w-16'

  return (
    <div className={`relative ${size}`}>
      {/* Head */}
      <div className={`w-full aspect-square ${skin} rounded-full shadow-inner relative`}>
        <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-[70%] h-6 ${hair} rounded-b-full`} />
        {/* Eyes */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2">
          <div className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
          <div className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
        </div>
        {/* Smile */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
          <div className={`w-6 h-3 rounded-b-full ${mood === 'smile' ? 'bg-rose-400' : 'bg-transparent'} border-b-2 border-rose-400`} />
        </div>
      </div>
      {/* Body */}
      <div className={`mt-1 w-full h-10 bg-gradient-to-b ${outfit} rounded-xl shadow`}></div>
      {/* Interests badges */}
      {isBoy ? (
        <div className="absolute -right-3 -top-2 text-xl">🎮</div>
      ) : (
        <div className="absolute -right-3 -top-2 text-xl">🎀</div>
      )}
    </div>
  )
}

function Speech({ text, hue = 'sky' }) {
  const bubble = hue === 'pink' ? 'bg-pink-100 text-pink-900' : 'bg-sky-100 text-sky-900'
  return (
    <div className={`px-3 py-2 rounded-2xl shadow ${bubble} border border-white/50`}>{text}</div>
  )
}

function Cake({ candleLit }) {
  return (
    <div className="relative w-52 sm:w-64">
      {/* plate */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-56 h-4 bg-gradient-to-b from-slate-200 to-slate-300 rounded-full shadow" />
      {/* cake layers */}
      <div className="w-full h-20 bg-pink-200 rounded-xl border-4 border-pink-300 shadow-inner" />
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-40 h-10 bg-pink-100 rounded-xl border-4 border-pink-200 shadow" />
      {/* sprinkles */}
      {new Array(20).fill(0).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-2 rounded"
          style={{
            background: ['#93C5FD', '#A7F3D0', '#FDE68A', '#FF90BC'][i % 4],
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 40}%`,
            transform: `rotate(${Math.random() * 180}deg)`,
          }}
        />
      ))}
      {/* candles 21 */}
      <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex items-end gap-3">
        <Candle lit={candleLit} label="2" />
        <Candle lit={candleLit} label="1" />
      </div>
      {/* knife for later */}
      <AnimatePresence>
        {!candleLit && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -right-10 bottom-4 rotate-12"
          >
            <div className="w-20 h-3 bg-slate-300 rounded-l-full shadow relative">
              <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-4 bg-amber-600 rounded-l" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PartyApp
