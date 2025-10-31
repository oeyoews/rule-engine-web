/**
 * 缩进工具函数
 * 用于统一处理代码缩进
 */

/**
 * 为单行文本添加缩进
 * @param line 文本行
 * @param level 缩进级别（空格数），默认 4
 * @returns 添加缩进后的行
 */
export function indentLine(line: string, level: number = 4): string {
  if (!line || !line.trim()) {
    return line
  }
  return ' '.repeat(level) + line.trimStart()
}

