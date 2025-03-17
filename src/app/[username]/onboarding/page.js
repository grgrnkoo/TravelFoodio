import axios from "axios";
import { Chat } from "@/components/Chat";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Onboarding() {
  // Onboarding page
  try {
    const session = await getServerSession(authOptions);
    return (
      <div>
        <Chat session={session} />
      </div>
    );
  } catch (error) {
    console.error('Error fetching session', error);
    return (
      <div>
        <p>Error fetching session: {error}</p>
      </div>
    );
  }

}