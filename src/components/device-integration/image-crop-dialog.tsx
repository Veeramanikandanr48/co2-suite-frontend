"use client"

import { Dialog, DialogContent, DialogDescription, DialogOverlay, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { X } from "lucide-react"
import { CropData, ImageCropDialogProps } from "~/types/device"
import { Reset, Save } from "@/components/svg"
import { PacsImage } from "@/enums/base-enum"
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

const DEFAULT_MIN_WIDTH = 200
const DEFAULT_MIN_HEIGHT = 150
const DEFAULT_MAX_WIDTH = 400
const DEFAULT_MAX_HEIGHT = 300
const ASPECT_RATIO = 4 / 3
const MAX_IMAGE_RATIO = 0.8

const cropStyles = {
  cropBox: {
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
  },
  cropArea: {
    border: '2px dashed var(--primary-500)',
  },
  dragHandle: {
    borderColor: 'var(--primary-500)',
    backgroundColor: 'var(--primary-500)'
  }
}

export default function ImageCropDialog({
  open, 
  onOpenChange, 
  imageUrl,
  onSave,
  initialCrop,
}: Readonly<ImageCropDialogProps>) {
  const [crop, setCrop] = useState<Crop>()
  const [imgRef, setImgRef] = useState<HTMLImageElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })

  // Reset crop position when dialog opens
  useEffect(() => {
    if (open && imgRef && imageSize.width && imageSize.height) {
      if (initialCrop) {
        setCrop(convertToReactCrop(initialCrop, imgRef, imageSize));
      } else {
        setCrop(createInitialCrop(imgRef.width, imgRef.height));
      }
    }
  }, [open, imgRef, imageSize.width, imageSize.height, initialCrop]);

  // Convert react-image-crop Crop to our CropData format
  const convertToCropData = (cropData: Crop): CropData => {
    if (!imgRef) {
      return { x: 0, y: 0, width: 0, height: 0 }
    }

    // Calculate scale factor based on original image size vs current display size
    const scaleX = imageSize.width / imgRef.width
    const scaleY = imageSize.height / imgRef.height

    return {
      x: Math.round(cropData.x * scaleX),
      y: Math.round(cropData.y * scaleY),
      width: Math.round(cropData.width * scaleX),
      height: Math.round(cropData.height * scaleY)
    }
  }

  const createInitialCrop = (width: number, height: number): Crop => {
    // Calculate the crop size that will result in our target dimensions
    const targetWidth = Math.min(width * MAX_IMAGE_RATIO, DEFAULT_MAX_WIDTH)
    const targetHeight = targetWidth * (ASPECT_RATIO)
    
    return centerCrop(
      makeAspectCrop(
        {
          unit: 'px',
          width: targetWidth,
          height: targetHeight,
        },
        ASPECT_RATIO,
        width,
        height
      ),
      width,
      height
    )
  }

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    setImgRef(img)
    
    // Get the natural (original) image dimensions
    const imgObj = new window.Image()
    imgObj.src = imageUrl
    imgObj.onload = () => {
      setImageSize({
        width: imgObj.width,
        height: imgObj.height
      })
      // Set initial crop when image loads
      setCrop(createInitialCrop(img.width, img.height))
    }
  }

  const handleSave = () => {
    if (!crop) return
    onSave(convertToCropData(crop))
    onOpenChange(false)
  }

  const resetCropBox = () => {
    if (!imgRef) return
    const { width, height } = imgRef
    setCrop(createInitialCrop(width, height))
  }

  const convertToReactCrop = (
    cropData: CropData,
    img: HTMLImageElement,
    natural: { width: number; height: number }
  ): Crop => {
    const scaleX = img.width / natural.width;
    const scaleY = img.height / natural.height;
    return {
      unit: 'px',
      x: cropData.x * scaleX,
      y: cropData.y * scaleY,
      width: cropData.width * scaleX,
      height: cropData.height * scaleY,
    };
  };

  return (
    <Dialog open={open}>
      <DialogOverlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-3xs" />
      <DialogDescription className="h-0 mb-0"> </DialogDescription>
      <DialogContent className="px-[74px] pt-14 pb-4 w-[56vw] h-[81vh] rounded-xs overflow-hidden">
        <X 
          className="absolute right-4 top-4 h-6 w-6 stroke-[#222326] hover:stroke-[#222326] cursor-pointer" 
          onClick={() => onOpenChange(false)}
          aria-label="Close dialog"
        />
        <DialogTitle className="h-0"> </DialogTitle>
        <div className="p-10 bg-background-outer w-full h-full overflow-hidden flex items-center justify-center">
          <div 
            ref={containerRef}
            className="relative w-full h-full overflow-hidden bg-neutral-100"
          >
            <ReactCrop
              crop={crop}
              onChange={(c: Crop) => setCrop(c)}
              aspect={ASPECT_RATIO}
              minWidth={DEFAULT_MIN_WIDTH}
              minHeight={DEFAULT_MIN_HEIGHT}
              maxWidth={DEFAULT_MAX_WIDTH}
              maxHeight={DEFAULT_MAX_HEIGHT}
              className="w-full h-full"
              style={cropStyles.cropBox}
            >
              <Image
                src={imageUrl}
                alt="Original image"
                className="w-full h-full object-contain"
                width={1920}
                height={1080}
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%',
                  objectFit: 'contain',
                  aspectRatio: '16/9'
                }}
                onLoad={handleImageLoad}
                priority
              />
            </ReactCrop>
          </div>
        </div>
        <div className="w-full flex justify-between items-center">
          <div className="flex flex-row gap-4">
            <Button 
              variant="outline" 
              onClick={resetCropBox} 
              className="text-sm rounded-sm leading-[1.5rem] font-bold w-[8rem] gap-2"
              aria-label="Reset crop"
            >
              <Reset className="w-4 h-4" stroke="var(--primary-500)" />
              Reset
            </Button>
            <Button 
              onClick={handleSave} 
              className="bg-primary-500 text-white text-sm rounded-sm leading-[1.5rem] font-bold flex items-center justify-center w-[8rem] gap-2"
              aria-label="Save crop"
            >
              <Save className="w-4 h-4" stroke="#FFFFFF" />
              Save
            </Button>
          </div>
          <div className="w-[5rem] h-[1.8rem] flex items-center justify-center rounded-lg border border-input-border">
            <p className="text-xs font-normal text-center text-neutral-500">
              {PacsImage.WIDTH} x {PacsImage.HEIGHT}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 