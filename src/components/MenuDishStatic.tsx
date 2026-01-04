'use client';
import { Flame, Beef, Cookie, Wheat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type MenuDishStaticProps = {
    menuDish: {
        name: string,
        cuisine?: string,
        calories: number,
        protein: number,
        fats: number,
        carbs: number,
        ingredients?: string[]
    },
    index?: string
};
// Assuming this is passed from parent to track order in stream
export default function MenuDishStatic({ menuDish, index = '' }: MenuDishStaticProps) {
    return (
        <>
            <Card className="w-full border-none rounded-2xl shadow-lg h-full overflow-hidden">
                <CardHeader className='bg-gradient-to-r from-amber-50 to-orange-50 pb-2 pt-6 rounded-t-2xl w-full'>
                    <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-xl font-bold pr-6">{menuDish?.name}</CardTitle>
                        {menuDish?.cuisine &&
                            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200 px-[10px] py-[4px] mx-[2px] select-none text-center">
                                {menuDish?.cuisine}
                            </Badge>}
                    </div>
                </CardHeader>

                <CardContent className="pt-4 pb-2">
                    <div className="flex items-center mb-4 text-muted-foreground">
                        <Flame className="h-4 w-4 mr-1 text-orange-500" />
                        <span className="font-medium">{menuDish?.calories} kcal</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-slate-50 rounded-lg p-3 text-center">
                            <div className="flex justify-center mb-1">
                                <Beef className="h-4 w-4 text-blue-600" />
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">Proteins</p>
                            <p className="font-medium">{menuDish?.protein}</p>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-3 text-center">
                            <div className="flex justify-center mb-1">
                                <Cookie className="h-4 w-4 text-yellow-600" />
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">Fats</p>
                            <p className="font-medium">{menuDish?.fats}</p>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-3 text-center">
                            <div className="flex justify-center mb-1">
                                <Wheat className="h-4 w-4 text-amber-600" />
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">Carbs</p>
                            <p className="font-medium">{menuDish?.carbs}</p>
                        </div>
                    </div>

                    {menuDish?.ingredients &&
                        <div>
                            <p className="text-sm font-medium mb-2"><strong>Ingredients</strong></p>
                            <div className="flex flex-wrap gap-1 mb-1">
                                {menuDish?.ingredients?.map((ingredient, index) => (
                                    <Badge key={index} variant="secondary" className="bg-slate-100 border-slate-300 text-slate-500 px-[8px] py-[4px] mx-[2px] text-center">
                                        {ingredient}
                                    </Badge>
                                ))}
                            </div>
                        </div>}
                </CardContent>
                <CardFooter>

                </CardFooter>
            </Card>
        </>
    );
}