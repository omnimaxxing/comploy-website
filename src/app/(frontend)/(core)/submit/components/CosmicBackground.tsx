import { Stars } from '@/components/ui/Stars'

export function CosmicBackground() {
  return (
    <>
      {/* Extended cosmic background that fades throughout the page */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.7)_80%)] opacity-60 pointer-events-none"></div>
      
      {/* Stars that extend throughout the page with fading effect */}
      <div className="absolute inset-0 pointer-events-none">
        <Stars number={120} className="z-0 opacity-70" />
      </div>
      
      {/* Edge fading gradients - responsive with fluid scaling */}
      <div className="absolute inset-x-0 bottom-0 h-[5vh] sm:h-[8vh] md:h-[10vh] lg:h-[12vh] bg-gradient-to-t from-black via-black/80 to-transparent z-20 pointer-events-none"></div>
      <div className="absolute inset-y-0 left-0 w-[5vw] sm:w-[4vw] md:w-[5vw] lg:w-[6vw] bg-gradient-to-r from-black via-black/80 to-transparent z-20 pointer-events-none"></div>
      <div className="absolute inset-y-0 right-0 w-[5vw] sm:w-[4vw] md:w-[5vw] lg:w-[6vw] bg-gradient-to-l from-black via-black/80 to-transparent z-20 pointer-events-none"></div>
    </>
  );
}