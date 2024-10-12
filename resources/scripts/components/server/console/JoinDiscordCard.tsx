/* eslint-disable prettier/prettier */

import React from 'react'
import { MessageCircle, ArrowRight, Copy } from 'lucide-react'

interface JoinDiscordCardProps {
  title: string
  description: string
  buttonText: string
  link: string
  copyText?: string
  className?: string
}

export default function JoinDiscordCard({
  title,
  description,
  buttonText,
  link,
  copyText,
  className,
}: JoinDiscordCardProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = () => {
    if (copyText) {
      navigator.clipboard.writeText(copyText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className={`bg-slate-800 rounded-lg shadow-lg  ${className} w-full `}>
      <div className="h-1 bg-indigo-600 w-full" />
      <div className="p-6 relative">
        <div className="absolute -top-8 left-4 bg-gray-900 rounded-full p-4">
          <MessageCircle className="w-8 h-8 text-indigo-400" />
        </div>
        <div className="ml-16">
          <h2 className="text-xl font-bold text-gray-200 mb-2">{title}</h2>
          <p className="text-gray-400 text-sm mb-4">{description}</p>
        </div>
        
          
          
        
        <a 
          href={link} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block w-full"
        >
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center group">
            Join Discord
            <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </a>
      </div>
    </div>
  )
}
