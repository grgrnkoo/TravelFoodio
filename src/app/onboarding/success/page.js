'use client'

import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Success() {
    const FetchData = () => {
        const [data, setData] = useState([]);

        const fetchData = async () => {
            try {
                const response = await axios.get('/api/users');
                setData(response.data);
            } catch (error) {
                console.log(error)
            }
        }

        // const fetchDataByUsername = async (username) => {
        //     try {
        //         const response = await axios.get(`../api/users?username=${username}`);
        //         setData([response.data]);
        //     } catch (error) {
        //         console.log(error);
        //     }
        // }

        useEffect(() => {
            // if (username) {
            //     fetchDataByUsername(username)
            // } else {
            fetchData();
            // }
        }, []);

        return data;
    }

    // const searchParams = useSearchParams();
    // console.log(searchParams)
    // const age = searchParams.get('age');
    // const weight = searchParams.get('weight');
    // const goals = searchParams.get('goals');
    // const additionalInfo = searchParams.get('additionalInfo');
    const data = FetchData();
    console.log(data);

    const { age, weight, goals, additionalInfo } = data[0];

    return (
        <div>
            <ul>
                <li>{age && `Age: ${age}`}</li>
                <li>{weight && `Weight: ${weight}`}</li>
                <li>{goals && `Goals: ${goals}`}</li>
                <li>{additionalInfo && `Additional info: ${additionalInfo}`}</li>
            </ul>
        </div>
    );
}