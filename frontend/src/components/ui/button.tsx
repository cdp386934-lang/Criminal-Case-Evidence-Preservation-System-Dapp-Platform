import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "danger"
  size?: "default" | "sm" | "lg"
}

/**
 * 司法系统风格按钮组件
 * - 矩形或轻微圆角
 * - 主按钮明显，次按钮弱化
 * - 不使用渐变、大圆角、阴影
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          // 基础样式 - 司法系统风格
          "inline-flex items-center justify-center",
          "text-sm font-medium",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-1",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          // 圆角 - 轻微圆角
          "rounded",
          // 尺寸
          {
            "h-10 px-4": size === "default",
            "h-8 px-3 text-xs": size === "sm",
            "h-12 px-6 text-base": size === "lg",
          },
          // 变体样式
          {
            // 主按钮 - 深蓝色，明显
            "bg-primary-900 text-white hover:bg-primary-800 active:bg-primary-700": variant === "default",
            // 次按钮 - 边框样式，弱化
            "border border-gray-300 bg-white text-neutral-900 hover:bg-gray-50 active:bg-gray-100": variant === "outline",
            // 幽灵按钮 - 无边框
            "text-neutral-900 hover:bg-gray-50 active:bg-gray-100": variant === "ghost",
            // 危险按钮 - 暗红色
            "bg-error text-white hover:bg-error-dark active:bg-error-dark": variant === "danger",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }

