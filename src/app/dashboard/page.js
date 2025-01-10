'use client'

// import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { redirect } from "next/dist/server/api-utils";

async function fetchData() {
    const response = await axios.get('/api/users');
    console.log(response.data);
    return response.data;
}

export default function Dashboard() {
    const { data: session } = useSession();

    if (!session) {
        redirect('/login');
    }

    console.log(session);

    const [data, setData] = useState([]);

    useEffect(() => {
        fetchData()
            .then((fetchedData) => setData(fetchedData))
            .catch((error) => console.error('Error fetching data: ', error));
    }, []);

    console.log(data);

    // if (data.length !== 0) { const { age, weight, goals, additionalInfo } = data[0]; }

    return (
        <>
            {
                data.length === 0 ? (
                    <p>Loading...</p>
                ) : (
                    <div>
                        <ul>
                            <li>{data[0].age && `Age: ${data[0].age}`}</li>
                            <li>{data[0].weight && `Weight: ${data[0].weight}`}</li>
                            <li>{data[0].goals && `Goals: ${data[0].goals}`}</li>
                            <li>{data[0].additionalInfo && `Additional info: ${data[0].additionalInfo}`}</li>
                        </ul>
                    </div>
                )
            }
        </>
    );
}