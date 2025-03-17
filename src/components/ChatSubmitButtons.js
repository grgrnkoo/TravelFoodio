import { Button } from "./ui/button";

export default function ChatSubmitButtons({ resetChat, submitData }) {

    return (
        <div className="p-4 border-t w-full flex justify-center">
            <Button
                onClick={resetChat}
                className="px-8 bg-gray-300 text-black"
            >
                Restart onboarding
            </Button>
            <Button
                onClick={submitData}
                className="ml-4 px-8"
            >
                {`Fine! Let's keep it`}
            </Button>
        </div>
    )
}