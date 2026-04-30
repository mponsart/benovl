export const useDarkMode = () => {
  const isDark = useState<boolean>('darkMode', () => false)

  const toggle = () => {
    isDark.value = !isDark.value
    if (process.client) {
      document.documentElement.classList.toggle('dark', isDark.value)
      localStorage.setItem('darkMode', String(isDark.value))
    }
  }

  const init = () => {
    if (process.client) {
      const stored = localStorage.getItem('darkMode')
      isDark.value = stored === 'true' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)
      document.documentElement.classList.toggle('dark', isDark.value)
    }
  }

  return { isDark, toggle, init }
}
