"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function YesNoPopUp({ isOpen, onClose, onChoice, content, yesLabel, noLabel }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="grid gap-4">
          <div className="text-center">{content}</div>
          <div className="flex justify-center space-x-4">
            <Button onClick={() => onChoice(true)}>{yesLabel}</Button>
            <Button onClick={() => onChoice(false)} variant="outline">
              {noLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

