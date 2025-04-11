import React from 'react'

interface IntroSectionProps {
  title: string
  subtitle: string
}

const IntroSection: React.FC<IntroSectionProps> = ({ title, subtitle }) => {
  return (
    <section className="u-container fl-my-xl">
      <h2 className="font-bold fl-mb-m text-black">{title}</h2>
      <p className="text-lg text-black mb-12 max-w-3xl">{subtitle}</p>
    </section>
  )
}

export default IntroSection
