import initCountDown from './index'
let countdowns = document.querySelectorAll('.jsCountdown')
if (countdowns.length) {
  countdowns.forEach(initCountDown)
}