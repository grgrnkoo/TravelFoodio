import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const MenuDishSkeleton = () => {
  return (
    <>
      <style>{`
      @keyframes dropIn {
          from {
              transform: translateY(-25%);
              opacity: .5;  
          }
          to {
              transform: translateY(0);
              opacity: 1;
              z-index: 0;
          }
      }
      .animate-drop-in {
          animation: dropIn 1.5s ease-out forwards;
      }
  `}</style>
      <Card className={`
      w-full overflow-hidden border-none shadow-lg hover:shadow-xl 
      transition-all duration-300 my-4 animate-drop-in relative hover:cursor-default
  `}
        style={{
          transform: 'translateY(-25%)',
          opacity: .5,
          zIndex: - 1,
        }}>
          <CardHeader className="bg-gradient-to-r from-white-50/50 to-slate-50/50 pb-2">
          <div className="flex items-center justify-between mb-2 px-[17px]">
            {/* Title skeleton */}
            <div className="h-7 w-40 rounded-md skeleton-item"></div>
            {/* Badge skeleton */}
            <div className="h-6 w-24 rounded-full skeleton-item"></div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 pb-2">
          {/* Calories skeleton */}
          <div className="flex items-center mb-4">
            <div className="h-4 w-4 mr-1 rounded-full skeleton-item"></div>
            <div className="h-4 w-20 rounded-md skeleton-item"></div>
          </div>

          {/* Nutrition boxes skeleton */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-50 rounded-lg p-3 text-center">
                <div className="flex justify-center mb-1">
                  <div className="h-4 w-4 rounded-full skeleton-item"></div>
                </div>
                <div className="h-3 w-16 mx-auto rounded-md skeleton-item mb-2"></div>
                <div className="h-5 w-10 mx-auto rounded-md skeleton-item"></div>
              </div>
            ))}
          </div>

          {/* Ingredients skeleton */}
          <div>
            <div className="h-5 w-24 rounded-md skeleton-item mb-3"></div>
            <div className="flex flex-wrap gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-6 w-16 rounded-full skeleton-item"></div>
              ))}
            </div>
          </div>
        </CardContent>

        <Separator />

        <CardFooter className="flex justify-between pt-3 pb-3">
          <div className="h-4 w-24 rounded-md skeleton-item"></div>
          <div className="flex space-x-2">
            <div className="h-9 w-9 rounded-full skeleton-item"></div>
            <div className="h-9 w-9 rounded-full skeleton-item"></div>
          </div>
        </CardFooter>
      </Card>
    </>
  )
}

export default MenuDishSkeleton

