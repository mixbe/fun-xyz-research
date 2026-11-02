export function exhaustiveCheck(_value: never): void {
  if (process.env.NODE_ENV === 'development') {
    throw new Error('exhaustiveCheck: should not reach this point')
  }
}
