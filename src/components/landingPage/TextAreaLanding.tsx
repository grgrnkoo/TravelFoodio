import { Textarea } from "../ui/textarea";

export default function TextAreaLanding(props: { placeholder?: string; value?: string; onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void; className?: string }) {
    const { placeholder, value, onChange, onKeyDown, className } = props
    return (
        <div className={`py-4 flex w-full min-h-[325px] ${className || ''}`}>
            <textarea
                className='resize-none border-r-8 w-full h-full flex flex-grow !text-lg placeholder:text-lg min-h-[60px] rounded-md border border-input bg-transparent px-3 py-2 shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
            />  
        </div>
    )
}