import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button, buttonVariants } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area"
import { MapPinned } from "lucide-react";
import type { MoveMapCenterType } from "types/map";

export default function Dialog({ data, onResult }: { data: MoveMapCenterType, onResult: (result: boolean) => void }) {
  return (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogHeader className="items-center">
          <AlertDialogTitle>
            <div className="mb-2 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
              <MapPinned className="h-7 w-7" />
            </div>
            マップの移動をする？
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <Card className="w-full py-2">
              <ScrollArea className="h-24">
                <CardContent className="text-center whitespace-pre-line">
                  {data.content}
                </CardContent>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </Card>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-2 sm:justify-center">
          <AlertDialogCancel onClick={() => onResult(false)}>
            キャンセル
          </AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive" })}
            onClick={() => onResult(true)}
          >
            移動する
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
