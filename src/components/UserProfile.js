'use client'

import { useContext, useState, useEffect } from "react";
import { UserContext } from "./UserProvider";
import { usePathname } from "next/navigation";
import Image from "next/image";
import UserProfileLine from "./UserProfileLine";
import { YesNoPopUp } from "./YesNoPopUp";
// import { Button } from "./ui/button";
import { updateUserByEmail } from "../../_lib/usersActions";

// User profile component contains all data about user with some of fields being editable.

export default function UserProfile() {
    const { userProfile } = useContext(UserContext);
    const [oneEditingFieldBoolean, setOneEditingFieldBoolean] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [pendingUpdate, setPendingUpdate] = useState(null); // Track the field being updated
    const [popUpContent, setPopUpContent] = useState('Basic popup');
    const pathname = usePathname();

    useEffect(() => {
        setOneEditingFieldBoolean(false);
        setIsPopupOpen(false);
        setPendingUpdate(null);
    }, []);

    const confirmUpdate = (id, value) => {
        return new Promise((resolve) => {
            setPendingUpdate({ id, value, resolve }); // Store resolve function in state
            setPopUpContent(generatePopUpContent(id, value));
            setIsPopupOpen(true);

            // Wait a short time before allowing resolution
            setTimeout(() => {
                setIsPopupOpen(true);
            }, 200); // Ensures UI updates before resolving
        });
    };

    const handleChoice = (choice) => {
        if (choice && pendingUpdate) {
            patchUserData(pendingUpdate.id, pendingUpdate.value);
            pendingUpdate.resolve(true); // Resolve the promise
        } else {
            pendingUpdate.resolve(false); // Reject update
        }
        setPendingUpdate(null);
        setIsPopupOpen(false);
    };

    const patchUserData = (id, value) => {
        console.log(`User updated: ${id} -> ${value}`);
        updateUserByEmail(userProfile.email, id, value);
    };

    const generatePopUpContent = (id, value) => {
        return (
            <span>
                You are changing value from "<strong>{userProfile[id]}</strong>" to "<strong>{value}</strong>"
            </span>
        )
    }

    if (!userProfile) return <p>Loading...</p>;

    return (
        <div className="flex flex-col items-center p-4 w-1/3">
            <UserProfileLine userData={userProfile.username} styleProp='font-bold' />
            {
                userProfile.image &&
                < Image
                    src={userProfile.image}
                    alt={`${userProfile.username} profile picture`}
                    width={100}
                    height={100}
                    className="rounded-full my-4"
                />
            }
            <UserProfileLine
                userData={userProfile.name}
                id='name'
                styleProp='font-bold'
                setOneEditingFieldBoolean={setOneEditingFieldBoolean}
                oneEditingFieldBoolean={oneEditingFieldBoolean} setIsPopupOpen={setIsPopupOpen}
                confirmUpdate={confirmUpdate}
                isPopupOpen={isPopupOpen}
            />
            {
                userProfile.age &&
                userProfile.age !== '' &&
                <UserProfileLine
                    userData={userProfile.age}
                    nameOfLine='Age'
                    id='age'
                    editable={true}
                    setOneEditingFieldBoolean={setOneEditingFieldBoolean}
                    oneEditingFieldBoolean={oneEditingFieldBoolean}
                    setIsPopupOpen={setIsPopupOpen}
                    confirmUpdate={confirmUpdate}
                    isPopupOpen={isPopupOpen}
                />
            }
            {
                userProfile.location &&
                userProfile.location !== '' &&
                <UserProfileLine
                    userData={userProfile.location}
                    nameOfLine='Location'
                    id='location'
                    editable={true}
                    setOneEditingFieldBoolean={setOneEditingFieldBoolean}
                    oneEditingFieldBoolean={oneEditingFieldBoolean}
                    setIsPopupOpen={setIsPopupOpen}
                    confirmUpdate={confirmUpdate}
                    isPopupOpen={isPopupOpen}
                />
            }
            {
                userProfile.goals &&
                userProfile.goals !== '' &&
                <UserProfileLine
                    userData={userProfile.goals}
                    nameOfLine='Goals'
                    id='goals'
                    editable={true}
                    setOneEditingFieldBoolean={setOneEditingFieldBoolean}
                    oneEditingFieldBoolean={oneEditingFieldBoolean} setIsPopupOpen={setIsPopupOpen}
                    confirmUpdate={confirmUpdate}
                    isPopupOpen={isPopupOpen}
                />
            }
            {
                userProfile.dietaryRestrictions &&
                userProfile.dietaryRestrictions !== '' &&
                <UserProfileLine
                    userData={userProfile.dietaryRestrictions}
                    nameOfLine='Preferences'
                    id='dietaryRestrictions'
                    editable={true}
                    setOneEditingFieldBoolean={setOneEditingFieldBoolean}
                    oneEditingFieldBoolean={oneEditingFieldBoolean}
                    setIsPopupOpen={setIsPopupOpen}
                    confirmUpdate={confirmUpdate}
                    isPopupOpen={isPopupOpen}
                />
            }
            {
                pathname.includes('onboarding') && 
                <p>Some onboarding image in the future</p>
            }
            {
                isPopupOpen &&
                <YesNoPopUp
                    title="Confirm updates"
                    isOpen={isPopupOpen}
                    key={isPopupOpen ? "open" : "closed"}
                    onClose={() => setIsPopupOpen(false)}
                    onChoice={handleChoice}
                    content={popUpContent}
                    yesLabel="Confirm"
                    noLabel="Decline"
                />
            }
        </div>
    );
}