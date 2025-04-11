import React from 'react'
import Lottie from 'react-lottie'

const LottieIcon = ({ animationData, loop = true, autoplay = true, height = 24, width = 24 }) => {
  const options = {
    loop,
    autoplay,
    animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  }

  return <Lottie options={options} height={height} width={width} />
}

export default LottieIcon
