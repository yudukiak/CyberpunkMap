import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button, buttonVariants } from "~/components/ui/button";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area"
import * as SliderPrimitive from "@radix-ui/react-slider";
import { MapPinned, ZoomIn, ZoomOut } from "lucide-react";
import type { MoveMapCenterType } from "~/types/map";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { markdownComponents } from "~/lib/react-markdown/components";

type DialogProps = {
  data: MoveMapCenterType;
  zoomPoint: number;
  onResult: (result: {success: boolean, zoomPoint: number}) => void;
}

export default function Dialog({ data, zoomPoint, onResult }: DialogProps) {
  const [zoomCurrentPoint, setZoomCurrentPoint] = useState(zoomPoint);

  return (
    <AlertDialog open={true}>
      <AlertDialogContent className="p-0 gap-0">

        <AlertDialogHeader className="p-6 border-b">
          <AlertDialogTitle className="flex items-center gap-4">
            <MapPinned className="h-6 w-6" />
            マップの移動をする？
          </AlertDialogTitle>
        </AlertDialogHeader>

        <AlertDialogDescription asChild>
          <div className="w-full text-center p-6">
            <div className="mb-2">ズーム倍率を変更</div>
            <SliderWithArrow
              zoomPoint={zoomCurrentPoint}
              setZoomPoint={setZoomCurrentPoint}
            />
          </div>
        </AlertDialogDescription>
        
        <AlertDialogDescription asChild>
          <Card className="mx-6 p-0 gap-0">
            <CardHeader className="py-4 gap-0">
              <CardTitle>
                {data.title}
              </CardTitle>
            </CardHeader>
            <ScrollArea
              className="
                p-2 pr-8 pl-4 border-t
                [&_[data-slot=scroll-area-viewport]]:max-h-48
                [&_[data-slot=scroll-area-viewport]]:rounded-none
                [&_[data-slot=scroll-area-thumb]]:bg-red-800
              "
              scrollHideDelay={1000*60*60}
            >
              <CardContent>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  components={markdownComponents()}
                >
                  {data.description}
                </ReactMarkdown>
              </CardContent>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </Card>
        </AlertDialogDescription>
        
        <AlertDialogFooter className="sm:justify-center p-6">
          <AlertDialogCancel
            className="cursor-pointer"
            onClick={() => onResult({success: false, zoomPoint: zoomCurrentPoint})}
          >
            キャンセル
          </AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive", className: "cursor-pointer" })}
            onClick={() => onResult({success: true, zoomPoint: zoomCurrentPoint})}
          >
            移動する
          </AlertDialogAction>
        </AlertDialogFooter>

      </AlertDialogContent>
    </AlertDialog>
  );
}

type SliderWithArrowProps = {
  zoomPoint: number;
  setZoomPoint: (zoomPoint: number) => void;
}

function SliderWithArrow({ zoomPoint, setZoomPoint }: SliderWithArrowProps) {
  return (
    <div className="relative w-full flex justify-center items-center">
      <Button
        variant="outline"
        className="mr-4 cursor-pointer"
        onClick={() => {
          // 1未満にはしない
          if (zoomPoint > 1) setZoomPoint(zoomPoint - 1);
        }}
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <SliderPrimitive.Root
        value={[zoomPoint]}
        min={1}
        max={6}
        step={1}
        onValueChange={(value) => setZoomPoint(value[0])}
        className="relative flex w-1/2 touch-none select-none items-center"
      >
        <SliderPrimitive.Track
          className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20"
        />
        <SliderPrimitive.Thumb
          className="block h-6 w-6 rounded-full border border-primary/50 bg-background shadow text-center cursor-move"
        >
          {zoomPoint}
        </SliderPrimitive.Thumb>
      </SliderPrimitive.Root>
      <Button
        variant="outline"
        className="ml-4 cursor-pointer"
        onClick={() => {
          // 6を超えない
          if (zoomPoint < 6) setZoomPoint(zoomPoint + 1);
        }}
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
    </div>
  );
}
