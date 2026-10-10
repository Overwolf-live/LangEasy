export function speak(text: string) {
  try {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'ja-JP'; u.rate = 0.85
    window.speechSynthesis.speak(u)
  } catch { /* ignore */ }
}
export const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, '')
