'use client'

import { motion } from 'framer-motion'

interface Props {
  lines: string[]
  onComplete: () => void
}

const lineVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 0.4 },
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}

export default function ScanAnimation({ lines, onComplete }: Props) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      {/* Beam */}
      <motion.div
        className="pointer-events-none absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"
        initial={{ top: 0 }}
        animate={{ top: '100%' }}
        transition={{ duration: 1.8, ease: 'linear' }}
        onAnimationComplete={onComplete}
      />

      {/* Text lines */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-1.5 font-mono text-xs"
      >
        {lines.slice(0, 40).map((line, i) => (
          <motion.p
            key={i}
            variants={lineVariants}
            className="truncate text-zinc-400"
          >
            {line || '\u00a0'}
          </motion.p>
        ))}
      </motion.div>
    </div>
  )
}
