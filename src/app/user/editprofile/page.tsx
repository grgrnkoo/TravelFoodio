import UserProfile from "@/components/UserProfile";

export default function EditProfile() {
    return (
        <div className="w-full">
            <UserProfile
                editable={true}
                className=''
            />
        </div>
    )
}