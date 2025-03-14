// import User from "../models/User";

import dbConnect from "./dbConnect";

export async function addUsername(user) {
  const { email, name } = user;
  const username = email.split('@')[0];

  console.log('Function email and username: ', email, username);

  const baseUrl = process.env.NEXTAUTH_URL;

  await fetch(`${baseUrl}/api/users/${email}`, {
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
  if (!email) {
    console.log("No email provided to getUserByEmail");
    return null; // Early return for no email
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const apiUrl = `${baseUrl}/api/users/${email}`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Fetch failed with status: ${response.status}`);
      return null; // Return null instead of throwing
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}

export async function addDataFromReply(email, data, showPopup, update, router) {
  console.log('add data triggered')
  console.log(data);
  const username = email.split('@')[0];
  if (!email || !data) {
    console.error('Invalid email or data:', email, data);
    return;
  }

  console.log('Function email and data: ', email, data);

  const updatedData = {
    ...data,
    onboardingCompleted: true
  };

  console.log('Updated data: ', updatedData)

  try {
    const response = await fetch(`/api/users/${email}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData)
    });

    const responseData = await response.json();
    console.log('User updated: ', responseData, email);

    if (response.ok) {
      await update({
        onboardingCompleted: true // Pass the updated value directly
      });
      router.push(`/${username}`);
      console.log('Token updated');
      return true;
    } else {
      console.error('Failed to update user:', result);
      return false;
    }
  } catch (error) {
    console.error('Error: ', error);
    return null;
  }
}

export const sendFeedback = async (feedbackText, sender, showPopup, setTextareaValue, isPublic) => {
  const endpoint = isPublic ? '/api/sendFeedbackPublic' : '/api/sendFeedbackEmail';
  const safeSender = sender ?? 'Not logged in'; 
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ feedback: feedbackText, sender: safeSender }),
    });
    
    const data = await response.json();
    if (!response.ok){
      showPopup('Error sending feedback! Try again', 'error');
      throw new Error(data.error);
    } 
    setTextareaValue('');
    showPopup('Feedback sent! Thanks <3', 'success');
    return { success: true, data };

  } catch (error) {
    showPopup(`${error}`, 'error');
    console.error('Error:', error);
    return { success: false, error };
  }
};