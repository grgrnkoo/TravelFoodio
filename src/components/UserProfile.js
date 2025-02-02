'use client'

import { useContext } from "react";
import { UserContext } from "./UserProvider";
import Image from "next/image";
import UserProfileLine from "./UserProfileLine";

export default function UserProfile() {
    const { session, userProfile } = useContext(UserContext);

    return (
        <div className="flex flex-col items-center p-4 max-w-[30%]">
            <UserProfileLine userData={userProfile.username} styleProp='font-bold' />
            <Image
                src={userProfile.image}
                alt={`${userProfile.username} profile picture`}
                width={100}
                height={100}
                className="rounded-full my-4"
            />
            <UserProfileLine userData={userProfile.name} styleProp='font-bold' />
            <UserProfileLine userData={userProfile.age} nameOfLine='Age' editable='true' />
            <UserProfileLine userData={userProfile.location} nameOfLine='Location' editable='true' />
            <UserProfileLine userData={userProfile.goals} nameOfLine='Goals' editable='true' />
            <UserProfileLine userData={userProfile.dietaryRestrictions} nameOfLine='Preferences' editable='true' />
            <p></p>
        </div>
    );
}