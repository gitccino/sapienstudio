import { LoadingSquares } from '@/app/register/RegisterClient'
import { LOADING_VARIANTS } from '@/constants'
import { motion } from 'motion/react'

export default function Loading() {
  return (
    <motion.div
      variants={LOADING_VARIANTS}
      initial="enter"
      animate="center"
      exit="exit"
      className="main-container flex-col-center"
    >
      <LoadingSquares />
    </motion.div>
  )
}
