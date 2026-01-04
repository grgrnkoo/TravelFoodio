import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";


export async function fetchData() {
    const response = await axios.get('/api/users');
    return response.data;
}