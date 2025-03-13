import Link from "next/link";
import { Button } from "@/components/ui/button";
import Pricing from "@/components/landingPage/Pricing";
import PhoneMockup from "@/components/landingPage/PhoneMockup";
import GenerateOneMeal from "@/components/landingPage/GenerateOneMeal";

export default function Home() {

  return (
    <div className="mt-[60px] w-full">
      <div id='heroSection' className='flex justify-center h-80vh w-full p-8'>
        <div className="flex flex-col flex-1 items-start justify-center">
          <h1 className="mb-8 h-fit">Delegate Your Meal Planning to AI</h1>
          <Button>
            <Link
              href='/login'
              className="startbutton h-fit"
            >
              Get started
            </Link>
          </Button>
          <div>

            {/*  Some extra text about how cool my app is */}

          </div>
        </div>
        <PhoneMockup />
      </div>
      <div id='keyAdvantages'>
        <div>
          {/* some image */}
          <div>
            <h2></h2>
            <p></p>
          </div>
        </div>
        <div>
        {/* some image */}
          <div>
            <h2></h2>
            <p></p>
          </div>
        </div>
        <div>
        {/* some image */}
          <div>
            <h2></h2>
            <p></p>
          </div>
        </div>
      </div>
      <div id='generateOneMeal' className="px-4 py-20 flex flex-col justify-center items-center w-full">
        <h2>Try generating a meal yourself:</h2>
        <GenerateOneMeal className='flex flex-1 w-full' />
      </div>
      <div id='howItWorks'>

      </div>
      {/* <div id='testimonials'>
      
      </div> */}
      <div id='plans'>
        <Pricing />
      </div>
      <div id='cta' className="flex flex-col items-center justify-center">
        <span>Still thinking?</span>
        <span>Watch our demo video</span>
        {/* Some video */}
        <Button>Start free trial</Button>
      </div>
    </div>
  );
}


