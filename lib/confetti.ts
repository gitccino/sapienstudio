// lib/confetti.ts
import confetti from 'canvas-confetti'

export const fireConfetti = () => {
  // You can customize the physics of the burst here
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 1 }, // Fires from the bottom of the screen
    // colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42'],
    zIndex: 9999, // Ensures it appears on top of all your UI elements
  })
}
