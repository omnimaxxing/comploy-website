'use client'

import { Button, Link } from '@heroui/react'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'
import React, { useState } from 'react'
import { Meteors } from '@/components/ui/Meteors'

// Console-style terminal component
const Terminal = () => {
	const [commandHistory, setCommandHistory] = useState<string[]>([
		'cd /notFound',
		'Error: Directory not found. Did you mean "/plugins"?',
		'help',
		'Available commands: cd, ls, sudo, rm -rf, npm install, git clone',
		'sudo find / -name "missing-page"',
		'Error: Permission denied. Nice try.'
	]);
	const [currentCommand, setCurrentCommand] = useState('');
	const [isMobile, setIsMobile] = useState(false);
	
	// Check if device is mobile
	React.useEffect(() => {
		const checkIfMobile = () => {
			const mobileCheck = window.matchMedia("(max-width: 768px)").matches;
			setIsMobile(mobileCheck);
		};
		
		checkIfMobile();
		window.addEventListener('resize', checkIfMobile);
		return () => window.removeEventListener('resize', checkIfMobile);
	}, []);

	const handleCommandSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!currentCommand.trim() || isMobile) return;
		
		// Add user command to history
		const newHistory = [...commandHistory, `$ ${currentCommand}`];
		
		// Add response based on command
		let response = "Command not found. Try 'help' for available commands.";
		
		const cmd = currentCommand.toLowerCase().trim();
		
		if (cmd === 'help') {
			response = "Available commands: cd, ls, sudo, rm -rf, npm install, git clone";
		} else if (cmd === 'ls') {
			response = "error.log system.crash missing-files/ dont-click-here.exe";
		} else if (cmd.startsWith('cd ')) {
			response = "Error: Cannot change directory. All paths lead to 404.";
		} else if (cmd.startsWith('sudo ')) {
			response = "Error: Nice try. Not even sudo can help you now.";
		} else if (cmd.includes('rm -rf')) {
			response = "Please don't. I have a family of sub-components.";
		} else if (cmd.includes('npm ')) {
			response = "Error: Package '404-fix' not found. Try 'npm install sanity'";
		} else if (cmd.includes('git ')) {
			response = "Git: fatal: repository 'page-you-wanted' does not exist";
		} else if (cmd === 'exit') {
			response = "There is no escape.";
		} else if (cmd === 'clear') {
			setCommandHistory([]);
			setCurrentCommand('');
			return;
		} else if (cmd === '404') {
			response = "Very funny. You're already here.";
		} else if (cmd.includes('payload')) {
			response = "Payload CMS is awesome, but it can't find this page either.";
		}
		
		setCommandHistory([...newHistory, response]);
		setCurrentCommand('');
	};

	return (
		<div className="w-full bg-black border border-gray-700 rounded-md overflow-hidden shadow-xl">
			{/* Terminal header */}
			<div className="flex items-center px-4 py-2 bg-gray-900 border-b border-gray-700">
				<div className="flex space-x-2">
					<div className="w-3 h-3 bg-red-500 rounded-full"></div>
					<div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
					<div className="w-3 h-3 bg-green-500 rounded-full"></div>
				</div>
				<div className="mx-auto text-gray-400 text-sm font-mono">404-not-found.sh</div>
			</div>
			
			{/* Terminal content */}
			<div className="bg-black p-4 h-64 overflow-auto font-mono text-sm">
				{commandHistory.map((line, index) => (
					<div key={index} className={`mb-1 ${line.startsWith('$') ? 'text-green-400' : line.includes('Error') ? 'text-red-400' : 'text-gray-300'}`}>
						{line.startsWith('$') ? line : line}
					</div>
				))}
				
				{!isMobile ? (
					<form onSubmit={handleCommandSubmit} className="flex items-center mt-2">
						<span className="text-green-400 mr-2">$</span>
						<input
							type="text"
							value={currentCommand}
							onChange={(e) => setCurrentCommand(e.target.value)}
							className="flex-1 bg-transparent outline-none text-white caret-white"
							autoFocus
							spellCheck="false"
							placeholder="Type a command..."
						/>
					</form>
				) : (
					<div className="flex items-center mt-2 opacity-50">
						<span className="text-green-400 mr-2">$</span>
						<span className="text-gray-500 text-xs italic">Terminal input disabled on mobile. View on desktop to interact.</span>
					</div>
				)}
			</div>
		</div>
	);
};

export default function Page() {
	return (
		<div className="min-h-screen u-container flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative">
			{/* Background effects */}
			<Meteors number={20} className="absolute inset-0" />
			
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="text-center relative z-10 w-full max-w-2xl mx-auto"
			>
				<h1 className="text-7xl font-bold text-primary-100 mb-2 font-mono relative">
					404
					{/* "It's a feature not a bug" badge */}
					<div className="hidden md:block absolute top-0 right-0 bg-black/50 backdrop-blur-sm border border-gray-700 rounded-md px-3 py-1.5 font-mono text-xs text-gray-400 transform rotate-3 translate-x-1/4 lg:-translate-x-0 lg:-right-20">
						It's a feature, not a bug.
					</div>
				</h1>
				
				<div className="flex items-center justify-center mb-6 relative">
					<div className="h-px w-12 bg-red-500/50"></div>
					<h2 className="text-xl font-bold text-red-400 mx-4 font-mono tracking-widest">
						PAGE_NOT_FOUND
					</h2>
					<div className="h-px w-12 bg-red-500/50"></div>
				</div>

				<div className="mb-10 flex justify-center">
					<Terminal />
				</div>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2, duration: 0.5 }}
					className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
				>
					<Button as={Link} href="/" className="rounded-none" variant="bordered" size="md">
						
							<Icon icon="heroicons:home" className="mr-2" />
							Return to Home
					
					</Button>

					<Button as={Link} href="/plugins" className="rounded-none bg-foreground text-background" variant="bordered" size="md">
						<Icon icon="heroicons:puzzle-piece" className="mr-2" />
						Browse Plugins
				
					</Button>
				</motion.div>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.4, duration: 0.5 }}
					className="mt-8 text-primary-400 font-mono text-xs relative"
				>
					<p>
						<span className="text-red-400 font-bold">STACK TRACE:</span> You requested a URL that our server couldn't find. It's probably your fault.
					</p>
				</motion.div>
			</motion.div>
		</div>
	);
}
