'use client'

import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { JSX } from "react";
import { AlertCircle } from "lucide-react";


interface GoalsProps {
  goal: string;
  setGoal: (goal: string) => void;
  goalError: string;
  setGoalError: (goalsError: string) => void;
}

// Goals options
const goals = [
  { value: "weight-loss", label: "Weight Loss" },
  { value: "muscle-gain", label: "Muscle Gain" },
  { value: "maintenance", label: "Maintenance" },
  { value: "health-improvement", label: "Health Improvement" },
  { value: "energy-boost", label: "Energy Boost" },
]

export default function GoalsCard({ goal, setGoal, goalError, setGoalError }: GoalsProps): JSX.Element {
  return (
    <div className="flex flex-col w-full justify-between">
      <CardHeader>
        <CardTitle>What are your goals?</CardTitle>
      </CardHeader>
      <CardContent className="mt-4">
        <div className="grid grid-cols-1 gap-2">
          <Button
            variant={goal === "weight-loss" ? "default" : "outline"}
            className="justify-start h-auto py-3 cursor-pointer"
            onClick={() => {
              setGoal("weight-loss")
              setGoalError("")
            }}
          >
            Weight Loss
          </Button>
          <Button
            variant={goal === "muscle-gain" ? "default" : "outline"}
            className="justify-start h-auto py-3 cursor-pointer"
            onClick={() => {
              setGoal("muscle-gain")
              setGoalError("")
            }}
          >
            Muscle Gain
          </Button>
          <Button
            variant={goal === "maintenance" ? "default" : "outline"}
            className="justify-start h-auto py-3 cursor-pointer"
            onClick={() => {
              setGoal("maintenance")
              setGoalError("")
            }}
          >
            Maintenance
          </Button>
          <Button
            variant={goal === "health-improvement" ? "default" : "outline"}
            className="justify-start h-auto py-3 cursor-pointer"
            onClick={() => {
              setGoal("health-improvement")
              setGoalError("")
            }}
          >
            Health Improvement
          </Button>
          <Button
            variant={goal === "energy-boost" ? "default" : "outline"}
            className="justify-start h-auto py-3 cursor-pointer"
            onClick={() => {
              setGoal("energy-boost")
              setGoalError("")
            }}
          >
            Energy Boost
          </Button>
        </div>
        <span className="text-xs font-medium text-destructive flex items-center w-full mt-4">
          {goalError ? (
            <>
              <AlertCircle className="h-3 w-3 mr-1" />
              {goalError}
            </>
          ) : (
            <div className="h-2">
            </div>
          )}
        </span>
      </CardContent>
    </div>
  )
}
