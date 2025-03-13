export default function PhoneMockup() {
    return (
      <div className="flex justify-center items-center">
        <div className="relative w-[300px] h-[600px] bg-black rounded-[40px] shadow-2xl border-[10px] border-gray-900 flex justify-center items-center">
          {/* Speaker and Front Camera */}
          <div className="absolute top-2 w-20 h-3 bg-gray-800 rounded-full"></div>
          <div className="absolute top-2 right-12 w-3 h-3 bg-gray-700 rounded-full"></div>
  
          {/* Screen Area */}
          <div className="w-[280px] h-[580px] bg-white rounded-[30px] overflow-hidden flex justify-center items-center">
            {/* Place your interface here */}
            <div className="text-gray-400">Your App Interface</div>
          </div>
        </div>
      </div>
    );
  }
  