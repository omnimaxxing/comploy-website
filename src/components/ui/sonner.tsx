'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = 'system' } = useTheme()

	return (
		<Sonner
			theme={theme as ToasterProps['theme']}
			className="toaster group"
			position="top-center"
			toastOptions={{
				classNames: {
					toast:
						'group toast group-[.toaster]:bg-white/80 group-[.toaster]:backdrop-blur-md group-[.toaster]:border-white/20 group-[.toaster]:border group-[.toaster]:shadow-lg group-[.toaster]:rounded-2xl dark:group-[.toaster]:bg-slate-900/80 dark:group-[.toaster]:text-slate-50 dark:group-[.toaster]:border-slate-800/30 group-[.toaster]:px-6 group-[.toaster]:py-4 [&_svg]:text-gray-700 dark:[&_svg]:text-gray-300 [&_svg]:w-5 [&_svg]:h-5 [&_svg]:shrink-0',
					description: 'group-[.toast]:text-slate-600/90 dark:group-[.toast]:text-slate-300/90',
					actionButton:
						'group-[.toast]:bg-primary-500/90 group-[.toast]:text-white group-[.toast]:shadow-sm group-[.toast]:rounded-full group-[.toast]:px-4 group-[.toast]:hover:bg-primary-600/90 dark:group-[.toast]:bg-primary-500/90 dark:group-[.toast]:text-white',
					cancelButton:
						'group-[.toast]:bg-white/10 group-[.toast]:backdrop-blur-sm group-[.toast]:text-slate-700 group-[.toast]:shadow-sm group-[.toast]:rounded-full group-[.toast]:px-4 group-[.toast]:hover:bg-white/20 dark:group-[.toast]:bg-slate-800/50 dark:group-[.toast]:text-slate-300',
					title:
						'group-[.toast]:font-medium group-[.toast]:text-slate-900/90 dark:group-[.toast]:text-white/90',
					error:
						'group-[.toaster]:bg-white/80 group-[.toaster]:text-slate-900 group-[.toaster]:border-red-500/50 dark:group-[.toaster]:bg-slate-900/80 dark:group-[.toaster]:text-slate-50 dark:group-[.toaster]:border-red-500/30',
					success:
						'group-[.toaster]:bg-white/80 group-[.toaster]:text-slate-900 group-[.toaster]:border-emerald-500/50 dark:group-[.toaster]:bg-slate-900/80 dark:group-[.toaster]:text-slate-50 dark:group-[.toaster]:border-emerald-500/30',
					warning:
						'group-[.toaster]:bg-white/80 group-[.toaster]:text-slate-900 group-[.toaster]:border-amber-500/50 dark:group-[.toaster]:bg-slate-900/80 dark:group-[.toaster]:text-slate-50 dark:group-[.toaster]:border-amber-500/30',
					info: 'group-[.toaster]:bg-white/80 group-[.toaster]:text-slate-900 group-[.toaster]:border-blue-500/50 dark:group-[.toaster]:bg-slate-900/80 dark:group-[.toaster]:text-slate-50 dark:group-[.toaster]:border-blue-500/30',
				},
			}}
			{...props}
		/>
	)
}

export { Toaster }
