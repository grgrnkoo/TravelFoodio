"use client";

import { useContext, useState } from "react";
import { UserContext } from "./UserProvider";
import Image from "next/image";
import UserProfileLine from "./UserProfileLine";
import { YesNoPopUp } from "./YesNoPopUp";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PencilIcon, UserIcon, MapPinIcon, TargetIcon, UtensilsIcon, Cookie } from "lucide-react";
import { updateUserByEmail } from "../../_lib/usersActions";
import BlankAvatarSvg from "@/ui/images/BlankAvatarSvg";

const updateUser = async (email, field, value) => {
    await updateUserByEmail(email, field, value);
    return true;
};

export default function UserProfile({ className, editable = false }) {
    const { userProfile, userProfileDynamic } = useContext(UserContext);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [pendingUpdate, setPendingUpdate] = useState(null);
    const [popUpContent, setPopUpContent] = useState("");
    const [oneEditingFieldBoolean, setOneEditingFieldBoolean] = useState(false);

    const confirmUpdate = (id, value) => {
        return new Promise((resolve) => {
            setPendingUpdate({ id, value, resolve });
            setPopUpContent(generatePopUpContent(id, value));
            setIsPopupOpen(true);
        });
    };

    const handleChoice = (choice) => {
        if (choice && pendingUpdate) {
            patchUserData(pendingUpdate.id, pendingUpdate.value);
            pendingUpdate.resolve(true);
        } else {
            pendingUpdate?.resolve(false);
        }
        setPendingUpdate(null);
        setIsPopupOpen(false);
        setOneEditingFieldBoolean(false); // Reset editing lock
    };

    const patchUserData = async (id, value) => {
        if (userProfile?.email) await updateUser(userProfile?.email, id, value);
    };

    const generatePopUpContent = (id, value) => {
        return (
            <span>
                {`You are changing value from "`}
                <strong>{userProfileDynamic[id]}</strong>
                {`" to "`}
                <strong>{value}</strong>
                {`"`}
            </span>
        );
    };

    if (!userProfile) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="rounded-full bg-muted h-16 w-16" />
                    <div className="h-4 bg-muted rounded w-48" />
                    <div className="h-4 bg-muted rounded w-32" />
                </div>
            </div>
        );
    }

    return (
        <Card className={`mx-auto mb-8 shadow-lg border-0 overflow-hidden mt-4 ml-8 h-fit ${className}`}>
            <CardHeader className="relative pb-0 pt-6">
                <div className="absolute inset-0 h-24 bg-gradient-to-r from-primary/20 to-primary/40" />
                <div className="relative z-10 flex flex-col items-center">
                    <div className="relative mb-2">
                        <div className="absolute inset-0 rounded-full bg-background/80 blur-sm -m-1" />
                        {
                            userProfileDynamic?.image ? (
                                <Image
                                    src={userProfileDynamic?.image}
                                    alt={`${userProfileDynamic?.username} profile picture`}
                                    width={100}
                                    height={100}
                                    priority
                                    className="rounded-full border-4 border-background relative z-10"
                                />) : (
                                <BlankAvatarSvg />
                            )
                        }
                    </div>
                    <Badge variant="outline" className="mb-2 font-semibold px-3 py-1">
                        {userProfile?.username}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-4 pb-6 space-y-4" key="CardContent">
                {[
                    {
                        userData: userProfileDynamic?.name,
                        id: "name",
                        nameOfLine: "Name",
                        icon: <UserIcon className="h-4 w-4 text-muted-foreground" />,
                    },
                    {
                        userData: userProfileDynamic?.age,
                        nameOfLine: "Age",
                        id: "age",
                        editable,
                        icon: <PencilIcon className="h-4 w-4 text-muted-foreground" />,
                    },
                    {
                        userData: userProfileDynamic?.dailyCaloriesSuggested,
                        nameOfLine: "Est. kcal daily",
                        id: "dailyCaloriesSuggested",
                        editable,
                        icon: <Cookie className="h-4 w-4 text-muted-foreground" />,
                    },
                    {
                        userData: userProfileDynamic?.location,
                        nameOfLine: "Location",
                        id: "location",
                        editable,
                        icon: <MapPinIcon className="h-4 w-4 text-muted-foreground" />,
                    },
                    {
                        userData: userProfileDynamic?.goals,
                        nameOfLine: "Goals",
                        id: "goals",
                        editable,
                        icon: <TargetIcon className="h-4 w-4 text-muted-foreground" />,
                    },
                    {
                        userData: userProfileDynamic?.dietaryRestrictions,
                        nameOfLine: "Preferences",
                        id: "dietaryRestrictions",
                        editable,
                        icon: <UtensilsIcon className="h-4 w-4 text-muted-foreground" />,
                    },
                ]
                    .filter((item) => item.userData !== undefined && item.userData !== "") // Filter out empty fields
                    .map((item, index, arr) => (
                        <div key={item.id}>
                            <UserProfileLine
                                userData={item.userData}
                                nameOfLine={item.nameOfLine}
                                id={item.id}
                                editable={item.editable}
                                styleProp={item.id === "name" ? "font-bold" : ""} // Optional styling
                                setOneEditingFieldBoolean={setOneEditingFieldBoolean}
                                oneEditingFieldBoolean={oneEditingFieldBoolean}
                                confirmUpdate={confirmUpdate}
                                isPopupOpen={isPopupOpen}
                                setIsPopupOpen={setIsPopupOpen}
                                icon={item.icon}
                            />
                            {index !== arr.length - 1 && <Separator />}
                        </div>
                    ))}
            </CardContent>
            {
                isPopupOpen && (
                    <YesNoPopUp
                        title="Confirm updates"
                        isOpen={isPopupOpen}
                        onClose={() => setIsPopupOpen(false)}
                        onChoice={handleChoice}
                        content={popUpContent}
                        yesLabel="Confirm"
                        noLabel="Decline"
                    />
                )
            }
        </Card >
    );
}