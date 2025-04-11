import { useMotionTemplate, motion, MotionValue } from 'framer-motion'

interface CardPatternProps {
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
}

export const CardPattern = ({ mouseX, mouseY }: CardPatternProps) => {
  const maskImage = useMotionTemplate`radial-gradient(250px at ${mouseX}px ${mouseY}px, white, transparent)`
  const style = { maskImage, WebkitMaskImage: maskImage }

  return (
    <div className="pointer-events-none">
      <div className="absolute inset-0 rounded-2xl [mask-image:linear-gradient(white,transparent)] group-hover/card:opacity-50"></div>
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500 to-blue-700 opacity-0 group-hover/card:opacity-100 backdrop-blur-xl transition duration-500"
        style={style}
      />
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 mix-blend-overlay group-hover/card:opacity-100"
        style={style}
      >
        <div className="absolute inset-0 w-full h-full">
          <div 
            className="w-full h-full relative" 
            style={{ 
              backgroundImage: 'url(/assets/icons/ts_logo_minn.svg)',
              backgroundSize: '100px 100px',
              backgroundRepeat: 'repeat',
              opacity: '0.15',
              transform: 'rotate(-10deg) scale(1.2)'
            }} 
          />
        </div>
      </motion.div>
    </div>
  )
} 