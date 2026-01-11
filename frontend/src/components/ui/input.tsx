import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * 司法系统风格输入框组件
 * - 细线灰色边框
 * - 聚焦时变为主色
 * - 矩形或轻微圆角
 * - 统一高度
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // 基础样式 - 司法系统风格
          "flex h-10 w-full",
          "rounded", // 轻微圆角
          "border border-gray-300 bg-white",
          "px-3 py-2",
          "text-sm text-neutral-900",
          "placeholder:text-neutral-500",
          "transition-colors duration-150",
          // 聚焦样式 - 主色边框
          "focus-visible:outline-none focus-visible:border-primary-700 focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-0",
          // 禁用状态
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
          // 文件输入样式
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-700",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

