/**
 * 大屏自适应缩放方案
 * 基于 1920x1080 设计稿
 */

const DESIGN_WIDTH = 1920
const DESIGN_HEIGHT = 1080

/**
 * 设置屏幕缩放比例
 */
export function setScreenScale() {
  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight

  // 计算缩放比例
  const scaleX = screenWidth / DESIGN_WIDTH
  const scaleY = screenHeight / DESIGN_HEIGHT
  const scale = Math.min(scaleX, scaleY)

  // 设置根元素 font-size，用于 rem 单位计算
  document.documentElement.style.fontSize = `${scale * 100}px`

  // 设置 CSS 变量，供其他地方使用
  document.documentElement.style.setProperty('--scale', scale.toString())
  document.documentElement.style.setProperty('--screen-width', `${screenWidth}px`)
  document.documentElement.style.setProperty('--screen-height', `${screenHeight}px`)
}

/**
 * 获取当前缩放比例
 */
export function getScale(): number {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--scale') || '1')
}
