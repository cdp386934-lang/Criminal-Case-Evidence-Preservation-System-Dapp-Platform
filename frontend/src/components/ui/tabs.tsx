import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

const Tabs = ({ value, onValueChange, children, className }: TabsProps) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  )
}

/**
 * 司法系统风格标签页组件
 */
const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center",
      "rounded", // 轻微圆角
      "bg-gray-100 border border-gray-200",
      "p-1",
      className
    )}
    {...props}
  />
))
TabsList.displayName = "TabsList"

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(TabsContext)
    if (!context) throw new Error("TabsTrigger must be used within Tabs")
    
    const isActive = context.value === value
    
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          // 基础样式
          "inline-flex items-center justify-center whitespace-nowrap",
          "px-3 py-1.5",
          "text-sm font-medium",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-1",
          "disabled:pointer-events-none disabled:opacity-50",
          // 激活状态
          isActive
            ? "bg-white text-primary-900 border border-gray-300"
            : "text-neutral-600 hover:text-neutral-900 hover:bg-gray-50",
          className
        )}
        onClick={() => context.onValueChange(value)}
        {...props}
      />
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(TabsContext)
    if (!context) throw new Error("TabsContent must be used within Tabs")
    
    if (context.value !== value) return null
    
    return (
      <div
        ref={ref}
        className={cn(
          "mt-2",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-1",
          className
        )}
        {...props}
      />
    )
  }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }

