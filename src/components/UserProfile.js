'use client'

import { useContext, useState } from "react";
import { UserContext } from "./UserProvider";
import Image from "next/image";
import UserProfileLine from "./UserProfileLine";

// User profile component contains all data about user with some of fields being editable.

export default function UserProfile() {
    const { session, userProfile } = useContext(UserContext);
    const [oneEditingFieldBoolean, setOneEditingFieldBoolean] = useState(false);

    if (!userProfile) return <p>Loading...</p>;

    return (
        <div className="flex flex-col items-center p-4 w-1/3">
            <UserProfileLine userData={userProfile.username} styleProp='font-bold' />
            <Image
                src={userProfile.image}
                alt={`${userProfile.username} profile picture`}
                width={100}
                height={100}
                className="rounded-full my-4"
            />
            <UserProfileLine userData={userProfile.name} id='name' styleProp='font-bold' setOneEditingFieldBoolean={setOneEditingFieldBoolean} oneEditingFieldBoolean={oneEditingFieldBoolean} />
            <UserProfileLine userData={userProfile.age} nameOfLine='Age' id='age' editable={true} setOneEditingFieldBoolean={setOneEditingFieldBoolean} oneEditingFieldBoolean={oneEditingFieldBoolean} />
            <UserProfileLine userData={userProfile.location} nameOfLine='Location' id='location'editable={true} setOneEditingFieldBoolean={setOneEditingFieldBoolean} oneEditingFieldBoolean={oneEditingFieldBoolean} />
            <UserProfileLine userData={userProfile.goals} nameOfLine='Goals' id='goals'editable={true} setOneEditingFieldBoolean={setOneEditingFieldBoolean} oneEditingFieldBoolean={oneEditingFieldBoolean} />
            <UserProfileLine userData={userProfile.dietaryRestrictions} nameOfLine='Preferences'id='dietaryRestrictions' editable={true} setOneEditingFieldBoolean={setOneEditingFieldBoolean} oneEditingFieldBoolean={oneEditingFieldBoolean} />
            <p></p>
        </div>
    );
}