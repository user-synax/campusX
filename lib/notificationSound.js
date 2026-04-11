export function playNotificationSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    
    const oscillator = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioCtx.destination)
    
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime)
    oscillator.frequency.setValueAtTime(1100, audioCtx.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4)
    
    oscillator.start(audioCtx.currentTime)
    oscillator.stop(audioCtx.currentTime + 0.4)
  } catch (e) {
    // Silently fail if audio not supported
  }
}

export function shouldPlaySound() {
  return localStorage.getItem('campusx_notif_sound') !== 'false'
}

export function setNotificationSound(enabled) {
  localStorage.setItem('campusx_notif_sound', enabled ? 'true' : 'false')
}