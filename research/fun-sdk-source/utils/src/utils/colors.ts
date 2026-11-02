export function colorToHex(color: string): string {
  // Check if the input is in RGB format
  const rgbMatch = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
  if (rgbMatch) {
    const [, r = 0, g = 0, b = 0] = rgbMatch.map(Number)
    // Convert RGB to HEX
    const rHex = r.toString(16).padStart(2, '0')
    const gHex = g.toString(16).padStart(2, '0')
    const bHex = b.toString(16).padStart(2, '0')
    return `#${rHex}${gHex}${bHex}`
  }

  // Check if the input is in HEX format
  const hexMatch = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (hexMatch) {
    return hexMatch[0].toLowerCase()
  }

  return color
}

export const isHexString = (color: string): boolean => {
  return /^#([0-9a-f]{3}){1,2}$/i.test(color)
}
