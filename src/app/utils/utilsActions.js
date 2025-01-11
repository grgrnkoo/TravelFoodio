import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";


export async function fetchData(props) {
    const response = await axios.get('/api/users');
    console.log(response.data);
    return response.data;
}
// export function fetchUserByEmail(email) {
//     const data = {};
//     axios.get(`/api/users/${email}`)
//         .then(response => setData(response.data))
//         .catch(error => console.error('Error fetching user data:', error));

//     return data;
// }

export async function redirect(session, path) {

}