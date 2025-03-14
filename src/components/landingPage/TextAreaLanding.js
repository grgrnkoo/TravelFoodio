import { Textarea } from "../ui/textarea";

export default function TextAreaLanding(props) {
    const { placeholder, value, onChange, onKeyDown } = props
    return (
        <div className="py-4">
            <Textarea
                className='resize-none border-r-8'
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
            />  
        </div>
    )
}