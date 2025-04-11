import { Button } from '@/components/ui/Button'
import { IconArrowRight } from '@tabler/icons-react'
import Link from 'next/link'
import Badge from 'public/assets/animations/Badge.json'
import Trophy from 'public/assets/animations/Trophy.json'
import type React from 'react'
import LottieIcon from '../LottieIcon'
interface PricingPlan {
  title: string
  price: string
  contract: string
  features: { feature: string }[]
  contactOption: boolean
}

interface PricingCardProps {
  plan: PricingPlan
  featured?: boolean
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, featured }) => {
  return (
    <div
      className={`p-6 rounded-lg bg-black md:scale-100 scale-95 flex flex-col h-full border shadow-lg transition-transform duration-300 ${
        featured ? 'border-accent-500 scale-100 md:scale-105' : 'border-gray-700'
      }`}
    >
      {/* Title and Price */}
      <div>
        <h3
          className={`fl-text-step-1 flex justify-start flex-nowrap fl-gap-s   items-center font-semibold mb-4 ${
            featured ? 'text-white font-extrabold' : 'text-white'
          }`}
        >
          {plan.title}
          {featured && <LottieIcon animationData={Badge} />}
        </h3>
        <p className="fl-text-step-2 font-bold text-gray-300 mb-2">{plan.price}</p>
        <p className="text-gray-400 mb-4">{plan.contract}</p>
      </div>

      {/* Features List */}
      <ul className="mb-6 flex-grow">
        {plan.features.map((feature, index) => (
          <li key={index} className="text-gray-500">
            - {feature.feature}
          </li>
        ))}
      </ul>

      {/* Button */}
      <div className="mt-auto">
        <Button variant="primary" size="lg" aria-label={`Choose the ${plan.title} plan`}>
          <Link href="/contact" passHref>
            <span className="flex items-center justify-center cursor-pointer">
              Choose Plan <IconArrowRight className="ml-2" />
            </span>
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default PricingCard
