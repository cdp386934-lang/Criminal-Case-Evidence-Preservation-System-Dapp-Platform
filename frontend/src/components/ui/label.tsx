import * as React from "react"
import { cn } from "@/lib/utils"

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

/**
 * 司法系统风格标签组件
 * - 清晰的字体权重
 * - 左对齐
 * - 强制字段明确标注
 */
const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium",
        "text-neutral-900",
        "leading-normal",
        "block",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
)
Label.displayName = "Label"

export { Label }

