import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";


export async function fetchData(props) {
    const response = await axios.get('/api/users');
    console.log(response.data);
    return response.data;
}