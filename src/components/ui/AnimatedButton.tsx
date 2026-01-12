'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ExternalLink, Mail } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface AnimatedButtonProps {
  href?: string
  onClick?: () => void
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  external?: boolean
  email?: boolean
  disabled?: boolean
  loading?: boolean
  loadingText?: string
}

export function AnimatedButton({
  href,
  onClick,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  iconPosition = 'right',
  external = false,
  email = false,
  disabled = false,
  loading = false,
  loadingText
}: AnimatedButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  const baseClasses = "relative inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base'
  }

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-red-500 to-red-600 text-white
      shadow-lg shadow-red-500/20
    `,
    secondary: `
      bg-gradient-to-r from-emerald-500 to-teal-500 text-white
      shadow-lg shadow-emerald-500/20
    `,
    outline: `
      bg-transparent text-white border-2 border-gray-700
    `,
    ghost: `
      bg-transparent text-gray-300
    `
  }

  const buttonClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`

  const content = (
    <>
      {/* Clean hover background effects */}
      <motion.div
        className="absolute inset-0 rounded-lg transition-all duration-300"
        initial={false}
        animate={isHovered ? {
          backgroundColor: variant === 'primary' ? 'rgba(239, 68, 68, 0.1)' :
                           variant === 'secondary' ? 'rgba(16, 185, 129, 0.1)' :
                           variant === 'outline' ? 'rgba(239, 68, 68, 0.1)' :
                           'rgba(55, 65, 81, 0.3)',
          boxShadow: variant === 'primary' ? '0 10px 25px -5px rgba(239, 68, 68, 0.3)' :
                     variant === 'secondary' ? '0 10px 25px -5px rgba(16, 185, 129, 0.3)' :
                     variant === 'outline' ? '0 10px 25px -5px rgba(239, 68, 68, 0.2)' :
                     '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        } : {
          backgroundColor: 'transparent',
          boxShadow: variant === 'primary' ? '0 4px 6px -1px rgba(239, 68, 68, 0.2)' :
                     variant === 'secondary' ? '0 4px 6px -1px rgba(16, 185, 129, 0.2)' :
                     'none'
        }}
      />

      {/* Content */}
      <span className="relative z-10 flex items-center">
        {icon && iconPosition === 'left' && (
          <motion.span
            className="mr-2"
            animate={isHovered ? { x: -2 } : { x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.span>
        )}

        <span className="relative">
          {loading ? (loadingText || 'Chargement...') : children}

          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
            initial={{ x: '-100%' }}
            animate={isHovered ? { x: '100%' } : { x: '-100%' }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        </span>

        {icon && iconPosition === 'right' && (
          <motion.span
            className="ml-2"
            animate={isHovered ? { x: 2 } : { x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.span>
        )}
      </span>
    </>
  )

  const handleClick = () => {
    if (disabled || loading) return
    onClick?.()
  }

  if (href) {
    if (external) {
      return (
        <motion.a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonClasses} group`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {content}
        </motion.a>
      )
    }

    if (email) {
      return (
        <motion.a
          href={href}
          className={`${buttonClasses} group`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {content}
        </motion.a>
      )
    }

    return (
      <Link href={href}>
        <motion.div
          className={`${buttonClasses} group`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleClick}
        >
          {content}
        </motion.div>
      </Link>
    )
  }

  return (
    <motion.button
      className={`${buttonClasses} group`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      disabled={disabled || loading}
    >
      {content}
    </motion.button>
  )
}

// Specialized button components
export function CTAButton({ children, href, onClick, loading, loadingText, ...props }: Omit<AnimatedButtonProps, 'variant'>) {
  return (
    <AnimatedButton
      variant="primary"
      size="lg"
      href={href}
      onClick={onClick}
      loading={loading}
      loadingText={loadingText}
      icon={<ArrowRight className="w-4 h-4" />}
      {...props}
    >
      {children}
    </AnimatedButton>
  )
}

export function SecondaryButton({ children, href, ...props }: Omit<AnimatedButtonProps, 'variant'>) {
  return (
    <AnimatedButton
      variant="outline"
      size="lg"
      href={href}
      {...props}
    >
      {children}
    </AnimatedButton>
  )
}

export function PricingButton({ children, href, popular = false, loading, loadingText, ...props }: Omit<AnimatedButtonProps, 'variant'> & { popular?: boolean }) {
  return (
    <AnimatedButton
      variant={popular ? "secondary" : "outline"}
      size="md"
      href={href}
      loading={loading}
      loadingText={loadingText}
      className="w-full"
      {...props}
    >
      {children}
    </AnimatedButton>
  )
}

export function ContactButton({ children, href, ...props }: Omit<AnimatedButtonProps, 'variant'>) {
  return (
    <AnimatedButton
      variant="ghost"
      size="lg"
      href={href}
      email
      icon={<Mail className="w-4 h-4" />}
      iconPosition="left"
      {...props}
    >
      {children}
    </AnimatedButton>
  )
}
