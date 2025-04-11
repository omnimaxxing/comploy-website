import { Stars } from '@/components/ui/Stars';

interface HeroAnimationProps {
  className?: string;
}

export const HeroAnimation = ({ className }: HeroAnimationProps) => {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {/* Background elements - stars only in hero */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.7)_80%)] opacity-60"></div>
      <div className="pointer-events-none absolute inset-0">
        <Stars number={120} className="z-0 opacity-70" />
      </div>

      {/* Abstract floating elements animation */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Subtle glowing particles */}
        <div className="absolute right-[20%] top-[30%] hidden h-2 w-2 animate-[float_8s_ease-in-out_infinite_0.5s] rounded-full bg-blue-500/40 blur-sm md:block"></div>
        <div className="absolute right-[30%] top-[40%] hidden h-3 w-3 animate-[float_12s_ease-in-out_infinite_1.5s] rounded-full bg-purple-500/30 blur-sm md:block"></div>
        <div className="absolute right-[40%] top-[20%] hidden h-2 w-2 animate-[float_10s_ease-in-out_infinite_1s] rounded-full bg-teal-500/30 blur-sm md:block"></div>

        {/* Larger glowing orbs with gradient */}
        <div className="absolute right-[25%] top-[35%] h-32 w-32 animate-[float_15s_ease-in-out_infinite_0.2s] rounded-full bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-70 blur-3xl"></div>
        <div className="absolute right-[15%] top-[25%] h-40 w-40 animate-[float_18s_ease-in-out_infinite_2s] rounded-full bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-60 blur-3xl"></div>

        {/* Moving horizontal light trails - right to left */}
        <div className="absolute right-0 top-[25%] h-[1px] w-24 animate-trailLeft-8 bg-gradient-to-l from-blue-400/30 to-transparent blur-[0.5px]"></div>
        <div className="absolute right-0 top-[35%] h-[1px] w-32 animate-trailLeft-12 bg-gradient-to-l from-purple-400/20 to-transparent blur-[0.5px]"></div>
        <div className="absolute right-0 top-[45%] h-[1px] w-36 animate-trailLeft-9 bg-gradient-to-l from-teal-400/25 to-transparent blur-[0.5px]"></div>
        <div className="absolute right-0 top-[55%] h-[1px] w-28 animate-trailLeft-10 bg-gradient-to-l from-blue-400/15 to-transparent blur-[0.5px]"></div>
        <div className="absolute right-0 top-[65%] h-[1px] w-40 animate-trailLeft-11 bg-gradient-to-l from-purple-400/20 to-transparent blur-[0.5px]"></div>

        {/* Moving horizontal light trails - left to right */}
        <div className="absolute left-[60%] top-[30%] h-[1px] w-20 animate-trailRight-7 bg-gradient-to-r from-teal-400/20 to-transparent blur-[0.5px]"></div>
        <div className="absolute left-[65%] top-[50%] h-[1px] w-24 animate-trailRight-9 bg-gradient-to-r from-blue-400/15 to-transparent blur-[0.5px]"></div>
        <div className="absolute left-[70%] top-[70%] h-[1px] w-28 animate-trailRight-8 bg-gradient-to-r from-purple-400/20 to-transparent blur-[0.5px]"></div>

        {/* Moving vertical light trails - top to bottom */}
        <div className="absolute right-[25%] top-0 h-16 w-[1px] animate-trailDown-8 bg-gradient-to-b from-blue-400/25 to-transparent blur-[0.5px]"></div>
        <div className="absolute right-[40%] top-0 h-20 w-[1px] animate-trailDown-10 bg-gradient-to-b from-purple-400/20 to-transparent blur-[0.5px]"></div>
        <div className="absolute right-[55%] top-0 h-24 w-[1px] animate-trailDown-9 bg-gradient-to-b from-teal-400/15 to-transparent blur-[0.5px]"></div>

        {/* Moving vertical light trails - bottom to top */}
        <div className="absolute bottom-0 right-[30%] h-16 w-[1px] animate-trailUp-7 bg-gradient-to-t from-purple-400/20 to-transparent blur-[0.5px]"></div>
        <div className="absolute bottom-0 right-[45%] h-20 w-[1px] animate-trailUp-9 bg-gradient-to-t from-blue-400/15 to-transparent blur-[0.5px]"></div>
        <div className="h-18 absolute bottom-0 right-[60%] w-[1px] animate-trailUp-8 bg-gradient-to-t from-teal-400/25 to-transparent blur-[0.5px]"></div>

        {/* Intersection points - subtle glowing dots where trails might cross */}
        <div className="absolute right-[35%] top-[45%] h-1.5 w-1.5 animate-[pulse_4s_ease-in-out_infinite_1s] rounded-full bg-blue-400/30 blur-sm"></div>
        <div className="absolute right-[25%] top-[50%] h-1 w-1 animate-[pulse_3s_ease-in-out_infinite_0.5s] rounded-full bg-purple-400/30 blur-sm"></div>
        <div className="absolute right-[45%] top-[35%] h-1 w-1 animate-[pulse_5s_ease-in-out_infinite_2s] rounded-full bg-teal-400/30 blur-sm"></div>

        {/* Code snippets container - only visible on larger screens */}
        <div className="animate-fadeIn absolute right-0 top-0 hidden h-full w-[60%] will-change-auto [animation-delay:500ms] lg:block">
          {/* Abstract code fragments - now with responsive visibility */}
          <div className="absolute right-[28%] top-[25%] z-30 rotate-2 animate-[float_8s_ease-in-out_infinite_2s] rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-xs text-white/60 shadow-lg backdrop-blur-sm will-change-auto [animation-delay:600ms]">
            {'/* Payload Supercharged 🚀 */'}
          </div>
          <div className="absolute right-[18%] top-[48%] z-20 rotate-[-1deg] animate-[float_9s_ease-in-out_infinite_0.8s] rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-xs text-white/60 shadow-lg backdrop-blur-sm will-change-auto [animation-delay:700ms]">
            &lt;NextLevelCMS /&gt;
          </div>

          {/* More code tags at different depths/sizes - all adjusted to spread across right side */}
          <div className="absolute right-[35%] top-[35%] z-10 rotate-1 animate-[float_7s_ease-in-out_infinite_1.2s] rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] text-white/50 shadow-lg backdrop-blur-sm will-change-auto [animation-delay:800ms]">
            import {'{'} Headless {'}'} from &apos;payload-cms&apos;
          </div>
          <div className="z-15 absolute right-[10%] top-[30%] rotate-[-2deg] animate-[float_6s_ease-in-out_infinite_0.3s] rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-[11px] text-white/55 shadow-lg backdrop-blur-sm will-change-auto [animation-delay:750ms]">
            pluginThatActuallyWorks()
          </div>

          <div className="z-8 absolute right-[32%] top-[42%] rotate-[-1deg] animate-[float_9s_ease-in-out_infinite_2.2s] rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-[9px] text-white/45 shadow-lg backdrop-blur-sm will-change-auto [animation-delay:900ms]">
            @payload/plugin-prevent-bugs
          </div>
          <div className="z-3 absolute right-[26%] top-[60%] rotate-2 animate-[float_11s_ease-in-out_infinite_0.7s] rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-[7px] text-white/35 shadow-lg backdrop-blur-sm will-change-auto [animation-delay:950ms]">
            {'// Save me 100+ hours'}
          </div>
          <div className="z-12 absolute right-[15%] top-[40%] rotate-[-3deg] animate-[float_8.5s_ease-in-out_infinite_1.8s] rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] text-white/50 shadow-lg backdrop-blur-sm will-change-auto [animation-delay:850ms]">
            {'/* Built by omnipixel 💪 */'}
          </div>
          <div className="z-2 absolute right-[20%] top-[20%] rotate-1 animate-[float_12s_ease-in-out_infinite_3s] rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-[6px] text-white/30 shadow-lg backdrop-blur-sm will-change-auto [animation-delay:1000ms]">
            noMoreMonolithicCMS()
          </div>
          <div className="z-7 absolute right-[25%] top-[50%] rotate-2 animate-[float_10s_ease-in-out_infinite_2.5s] rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-[8px] text-white/40 shadow-lg backdrop-blur-sm will-change-auto [animation-delay:920ms]">
            fixMyCodePlease()
          </div>

          {/* Additional code snippets */}
          <div className="z-4 absolute right-[8%] top-[38%] rotate-1 animate-[float_9s_ease-in-out_infinite_1.4s] rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-[7px] text-white/35 shadow-lg backdrop-blur-sm will-change-auto [animation-delay:980ms]">
            makePayloadDevsAMillionaires()
          </div>
          <div className="z-6 absolute right-[12%] top-[58%] rotate-[-2deg] animate-[float_11s_ease-in-out_infinite_2.7s] rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-[6px] text-white/30 shadow-lg backdrop-blur-sm will-change-auto [animation-delay:1050ms]">
            headsUp: new PayloadError(&apos;Coffee needed&apos;)
          </div>
        </div>

        {/* Medium screen code snippets - fewer and positioned differently */}
        <div className="animate-fadeIn absolute right-0 top-0 hidden h-full w-[50%] will-change-auto [animation-delay:500ms] md:block lg:hidden">
          {/* Only show a few key code snippets for medium screens */}
          <div className="absolute right-[15%] top-[25%] z-30 rotate-2 animate-[float_8s_ease-in-out_infinite_2s] rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-xs text-white/60 shadow-lg backdrop-blur-sm will-change-auto [animation-delay:600ms]">
            {'/* Payload Plugins FTW 🔥 */'}
          </div>
          <div className="absolute right-[25%] top-[55%] z-20 rotate-[-1deg] animate-[float_9s_ease-in-out_infinite_0.8s] rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-xs text-white/60 shadow-lg backdrop-blur-sm will-change-auto [animation-delay:700ms]">
            &lt;DevSanityRestorer /&gt;
          </div>
          <div className="absolute right-[10%] top-[40%] z-10 rotate-1 animate-[float_7s_ease-in-out_infinite_1.2s] rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] text-white/50 shadow-lg backdrop-blur-sm will-change-auto [animation-delay:800ms]">
            import {'{'} PluginByOmnipixel {'}'} from &apos;payload-plugins&apos;
          </div>
        </div>

        {/* Small screen - just show minimal elements, no code snippets */}
        <div className="absolute right-0 top-0 block h-full w-full md:hidden">
          {/* Just keep the light trails and glowing elements for small screens */}
          {/* No code snippets on small screens to avoid overlap with content */}
        </div>

        {/* Subtle grid pattern that fades out */}
        <div className="absolute right-0 top-0 h-full w-[60%] opacity-10">
          <div className="mask-image-[linear-gradient(to_left,rgba(0,0,0,1),transparent)] absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        </div>
      </div>
    </div>
  );
};
