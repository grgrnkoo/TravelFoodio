import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

export default function TextAreaLanding(props) {
    const { placeholder, value, onChange } = props
    return (
        <div className="py-4">
            <Textarea
                className='resize-none border-r-8'
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </div>
    )
}