interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

const toasts = ref<Toast[]>([])
let nextId = 0

export const useToast = () => {
  const add = (message: string, type: Toast['type'] = 'info', duration = 4000) => {
    const id = nextId++
    toasts.value.push({ id, message, type, duration })
    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
    return id
  }

  const remove = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) toasts.value.splice(index, 1)
  }

  const success = (message: string) => add(message, 'success')
  const error = (message: string) => add(message, 'error')
  const info = (message: string) => add(message, 'info')
  const warning = (message: string) => add(message, 'warning')

  return { toasts: readonly(toasts), add, remove, success, error, info, warning }
}
