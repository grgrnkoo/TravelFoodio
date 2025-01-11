import Link from "next/link";

export default function Home() {
  
  return (
    <div className="homepage">
      <h1>AI agent that works for your health</h1>
      <Link
        href='/onboarding'
        className="startbutton"
      >Get started</Link>
    </div>
  );
}


