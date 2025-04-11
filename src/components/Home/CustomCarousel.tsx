'use client'
import Autoplay from 'embla-carousel-autoplay'
import React, { useState, useEffect } from 'react'
import { ImageMedia } from '../Media/ImageMedia'
import { Carousel, CarouselContent, CarouselItem } from '../ui/carousel'

const CustomCarousel: React.FC<{ images: any[] }> = ({ images }) => {
	const plugin = React.useMemo(
		() =>
			Autoplay({
				delay: 2000,
				stopOnInteraction: false,
				stopOnMouseEnter: true,
				jump: false,
			}),
		[],
	)

	return (
		<Carousel
			opts={{
				align: 'start',
				loop: true,
				dragFree: true,
				skipSnaps: true,
			}}
			plugins={[plugin]}
			className="w-full"
		>
			<CarouselContent className="flex">
				{images?.map((image, index) => (
					<CarouselItem
						key={index}
						className="rounded-2xl overflow-hidden basis-1/2 md:basis-1/3 lg:basis-1/4"
					>
						<div className="aspect-[9/16] w-full h-full">
							<ImageMedia
								resource={image}
								layout="responsive"
								alt={`Carousel Image ${index + 1}`}
								priority
							/>
						</div>
					</CarouselItem>
				))}
			</CarouselContent>
		</Carousel>
	)
}

export default CustomCarousel
