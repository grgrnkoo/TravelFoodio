'use client'

import WelcomingForm from "@/ui/welcoming-form";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "unauthenticated") {
    router.push('/login');
  }

  const handleFormSubmit = async ({ age, weight, goals, additionalInfo }) => {
    console.log(`State values: ${age}, ${weight}, ${goals}, ${additionalInfo}`);

    try {
      const response = await axios.put(`./api/users/${session.user?.email}`, { username, age, weight, goals, additionalInfo })
      console.log(response);
    } catch (error) {
      console.log(error);
    }


    // const formData = {
    //   age: event.target.age.value,
    //   weight: event.target.weight.value,
    //   goals: event.target.goals.value,
    //   additionalInfo: event.target.additionalInfo.value,
    // }


    // const queryString = new URLSearchParams(formData).toString()
    // console.log(queryString);
    // Redirect to the next step with the form data
    router.push(`/dashboard`);
    // success?${queryString}`);
  };

  return (
    <div>
      <WelcomingForm onSubmit={handleFormSubmit} />
    </div>
  );
}