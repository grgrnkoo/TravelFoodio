import { cn } from "@/lib/utils"

interface AlertProps {
  title: string;
  message?: string;
  variant?: "green" | "red" | "neutral";
  className?: string;
  children?: React.ReactNode;
}

export function Alert({ title, message, variant = "neutral", className, children }: AlertProps) {
  const variantStyles = {
    green: "bg-green-100 border-s-green-500 text-green-800",
    red: "bg-red-200 border-s-red-500 text-red-800",
    neutral: "bg-gray-100 border-s-gray-500 text-gray-800",
  }

  return (
    <div className={cn("rounded-md min-w-[50%] m-4 p-6 border-s-4", variantStyles[variant], className)}>
      <h6 className="font-bold">{title}</h6>
      {message && <p>{message}</p>}
      {children}
    </div>
  )
}
