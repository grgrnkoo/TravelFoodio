'use client'

import WelcomingForm from "@/ui/welcoming-form";
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const router = useRouter();

  const handleFormSubmit = (event) => {
    event.preventDefault();

    const formData = {
      age: event.target.age.value,
      weight: event.target.weight.value,
      goals: event.target.goals.value,
      additionalInfo: event.target.additionalInfo.value,
    }

    const queryString = new URLSearchParams(formData).toString()
    // console.log(queryString);
    // Redirect to the next step with the form data
    router.push(`/onboarding/success?${queryString}`);
  };

  return (
    <div>
      <WelcomingForm onSubmit={handleFormSubmit}/>
    </div>
  );
}