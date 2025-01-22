// import User from "../models/User";

export async function addUsername(user) {
    const { email, name } = user;
    const username = email.split('@')[0];

    console.log('Function email and username: ', email, username);

    const baseUrl = process.env.NEXTAUTH_URL;

    fetch(`${baseUrl}/api/users/${email}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            username: username
        })
    }).then((response) => response.json())
        .then((data) => console.log('User updated: ', data))
        .catch((error) => console.error('Error: ', error));
}

export async function getUserByEmail(email) {
    try {
        const response = await fetch(`/api/users/${email}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch: ', response.statusText);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching user by email: ', error);
        return null;
    }
}

export async function addData(email, data) {
    console.log('add data triggered')
    if (!email || !data) {
        console.error('Invalid email or data:', email, data);
        return;
    }

    console.log('Function email and data: ', email, data);

    const baseUrl = process.env.NEXTAUTH_URL;
    console.log(baseUrl);
    
    await fetch(`/api/users/${email}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userPortrait: data
        })
    }).then((response) => response.json())
        .then((data) => console.log('User updated: ', data, email))
        .catch((error) => console.error('Error: ', error));
}