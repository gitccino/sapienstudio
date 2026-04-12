'use client'

import React, { memo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { InputIcon } from '@/components/input-icon'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import {
  ArrowRight02Icon,
  Mail02Icon,
  UserIcon,
  ViewOffIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { AnimatePresence, motion } from 'motion/react'
import { BUTTON_ARROW_ANIMATE, BUTTON_ARROW_TRANSITION } from '@/constants'
import Image from 'next/image'
import { RegisterArt } from '@/assets'

const DEV_DEFAULTS = { email: '', password: '' }

const FORM_ANIMATE_DISTANCE = 10
const FORM_ANIMATE_TRANSITION = { duration: 0.3, ease: 'easeOut' as const }

const formLoginVariants = {
  enter: () => ({
    opacity: 0,
    x: -FORM_ANIMATE_DISTANCE,
    filter: 'blur(1px)',
    transition: FORM_ANIMATE_TRANSITION,
  }),
  center: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: FORM_ANIMATE_TRANSITION,
  },
  exit: () => ({
    opacity: 0,
    x: -FORM_ANIMATE_DISTANCE,
    filter: 'blur(1px)',
    transition: FORM_ANIMATE_TRANSITION,
  }),
}

const formSignupVariants = {
  enter: () => ({
    opacity: 0,
    x: FORM_ANIMATE_DISTANCE,
    filter: 'blur(1px)',
    transition: FORM_ANIMATE_TRANSITION,
  }),
  center: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: FORM_ANIMATE_TRANSITION,
  },
  exit: () => ({
    opacity: 0,
    x: FORM_ANIMATE_DISTANCE,
    filter: 'blur(1px)',
    transition: FORM_ANIMATE_TRANSITION,
  }),
}

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

const SPRING_TRANSITION = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 25,
}

// --- Memoized subcomponents ---

const SubmitButton = memo(function SubmitButton({
  isLoading,
  label,
  loadingLabel,
}: {
  isLoading: boolean
  label: string
  loadingLabel: string
}) {
  return (
    <Button
      size="none"
      variant="defaultPrimary"
      disabled={isLoading}
      className="bg-card-background-lv2 text-foreground h-12 rounded-xl text-base font-semibold"
    >
      <span>{isLoading ? loadingLabel : label}</span>
    </Button>
  )
})

const TabSwitcher = memo(function TabSwitcher({
  isLogin,
  onSwitchToLogin,
  onSwitchToSignup,
}: {
  isLogin: boolean
  onSwitchToLogin: () => void
  onSwitchToSignup: () => void
}) {
  return (
    <motion.div className="flex w-[60%] justify-between">
      <Button
        type="button"
        size="none"
        variant="ghost"
        className={cn(
          'cursor-pointer text-base',
          isLogin ? 'font-semibold opacity-100' : 'opacity-50',
        )}
        onClick={onSwitchToLogin}
      >
        Sign in
      </Button>
      <Button
        type="button"
        size="none"
        variant="ghost"
        className={cn(
          'cursor-pointer text-base',
          !isLogin ? 'font-semibold opacity-100' : 'opacity-50',
        )}
        onClick={onSwitchToSignup}
      >
        Sign Up
      </Button>
    </motion.div>
  )
})

const LoginForm = memo(function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | undefined>(undefined)

  const handleSubmit = useCallback(
    async (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault()
      const fd = new FormData(e.currentTarget)
      const email = (fd.get('email') as string) ?? ''
      const password = (fd.get('password') as string) ?? ''

      if (!email || !password) {
        setAuthError('All fields are required')
        return
      }

      setAuthError(undefined)
      setIsLoading(true)
      try {
        const { data, error } = await authClient.signIn.email({
          email,
          password,
        })
        if (error) {
          setAuthError(error.message)
          console.error('Sign in error:', error)
        }
        await new Promise((resolve) => setTimeout(resolve, 2000))
        if (data) router.push('/collections')
      } finally {
        setIsLoading(false)
      }
    },
    [router],
  )

  return (
    <motion.form
      key="login"
      variants={formLoginVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="relative flex h-50 w-full flex-col items-start"
      onSubmit={handleSubmit}
    >
      <motion.div
        variants={staggerItem}
        className="relative flex w-full flex-col items-start gap-2"
        transition={SPRING_TRANSITION}
      >
        <InputIcon
          icon={Mail02Icon}
          type="email"
          name="email"
          autoComplete="off"
          placeholder="Enter your email address..."
          className="register-input-field"
          defaultValue={DEV_DEFAULTS.email}
        />
        <InputIcon
          icon={ViewOffIcon}
          type="password"
          name="password"
          autoComplete="off"
          placeholder="Enter your password"
          className="register-input-field"
          defaultValue={DEV_DEFAULTS.password}
        />
        <SubmitButton
          isLoading={isLoading}
          label="Sign me in"
          loadingLabel="Signing in..."
        />
        {authError && (
          <Alert variant="ghost" className="text-xs">
            <AlertTitle>{authError}</AlertTitle>
          </Alert>
        )}
      </motion.div>
    </motion.form>
  )
})

const SignupForm = memo(function SignupForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | undefined>(undefined)

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const fd = new FormData(e.currentTarget)
      const name = (fd.get('name') as string) ?? ''
      const email = (fd.get('email') as string) ?? ''
      const password = (fd.get('password') as string) ?? ''

      if (!name || !email || !password) {
        setAuthError('All fields are required')
        return
      }

      setAuthError(undefined)
      setIsLoading(true)
      try {
        const { data, error } = await authClient.signUp.email({
          email,
          password,
          name,
        })
        if (error) {
          setAuthError(error.message)
          console.error('Sign up error:', error)
        }
        await new Promise((resolve) => setTimeout(resolve, 2000))
        if (data) router.push('/collections')
      } finally {
        setIsLoading(false)
      }
    },
    [router],
  )

  return (
    <motion.form
      key="signup"
      variants={formSignupVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="relative flex h-50 w-full flex-col items-start gap-2"
      onSubmit={handleSubmit}
    >
      <motion.div
        variants={staggerItem}
        className="relative flex w-full flex-col items-start gap-2"
        transition={SPRING_TRANSITION}
      >
        <InputIcon
          icon={UserIcon}
          type="text"
          name="name"
          autoComplete="off"
          placeholder="Your name"
          className="register-input-field"
        />
        <InputIcon
          icon={Mail02Icon}
          type="email"
          name="email"
          autoComplete="off"
          placeholder="Enter your email address..."
          className="register-input-field"
          defaultValue={DEV_DEFAULTS.email}
        />
        <InputIcon
          icon={ViewOffIcon}
          type="password"
          name="password"
          autoComplete="off"
          placeholder="Enter your password"
          className="register-input-field"
          defaultValue={DEV_DEFAULTS.password}
        />
        <SubmitButton
          isLoading={isLoading}
          label="Sign me up"
          loadingLabel="Signing up..."
        />
        {authError && (
          <Alert variant="ghost" className="text-xs">
            <AlertTitle>{authError}</AlertTitle>
          </Alert>
        )}
      </motion.div>
    </motion.form>
  )
})

// --- Main component (owns only `isLogin`) ---

export default function UnauthenticatedContent() {
  const [isLogin, setIsLogin] = useState(true)

  const switchToLogin = useCallback(() => setIsLogin(true), []) // Keep the consistent pattern just in case
  const switchToSignup = useCallback(() => setIsLogin(false), [])

  return (
    <motion.div className="flex-col-start md:flex-col-center relative flex w-full flex-1 gap-3 px-4">
      <Image
        src={RegisterArt}
        alt="Register page artwork"
        width={500}
        height={500}
        className="w-[60%]"
      />
      <TabSwitcher
        isLogin={isLogin}
        onSwitchToLogin={switchToLogin}
        onSwitchToSignup={switchToSignup}
      />
      <AnimatePresence mode="wait">
        {isLogin ? <LoginForm /> : <SignupForm />}
      </AnimatePresence>
    </motion.div>
  )
}
