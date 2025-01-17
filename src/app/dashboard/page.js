'use client'

import axios from "axios";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";


export default function Dashboard({children}) {
    // Dashboard page
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            redirect('/login?callbackUrl=/dashboard'); // add query parameters to show error later
        }
    });
    const router = useRouter();

    const [data, setData] = useState([]);

    // useEffect(() => {
    //     // Redirect to a login page if no session
    //     if (status === "unauthenticated") {
    //         router.push('/login'); // add error with query params later
    //     }
    // }, []);


    useEffect(() => {
        if (status === "authenticated") {
            // Fetch data by an email from a session
            axios.get(`/api/users/${session.user?.email}`)
                .then(response => setData(response.data))
                .catch(error => console.error('Error fetching user data:', error));
        };
    }, [status]);

    console.log(data);

    return (
        <>
            {
              children
            }
        </>
    );
}