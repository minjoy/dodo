'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface ImageCropperProps {
  imageFile: File
  onCrop: (croppedDataUrl: string) => void
  onCancel: () => void
}

export default function ImageCropper({ imageFile, onCrop, onCancel }: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imageSrc, setImageSrc] = useState<string>('')
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const CROP_SIZE = 200
  const CANVAS_SIZE = 280

  // 이미지 파일 로드
  useEffect(() => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string)
    }
    reader.readAsDataURL(imageFile)
  }, [imageFile])

  // 이미지 객체 생성
  useEffect(() => {
    if (!imageSrc) return

    const img = new Image()
    img.onload = () => {
      setImage(img)

      // 초기 스케일 계산 (이미지가 원에 꽉 차도록)
      const minDimension = Math.min(img.width, img.height)
      const initialScale = CROP_SIZE / minDimension
      setScale(initialScale * 1.2) // 약간 여유있게

      // 중앙 정렬
      setPosition({
        x: (CANVAS_SIZE - img.width * initialScale * 1.2) / 2,
        y: (CANVAS_SIZE - img.height * initialScale * 1.2) / 2,
      })
    }
    img.src = imageSrc
  }, [imageSrc])

  // 캔버스에 이미지 그리기
  useEffect(() => {
    if (!canvasRef.current || !image) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 캔버스 초기화
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    // 이미지 그리기
    ctx.save()
    ctx.beginPath()
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CROP_SIZE / 2, 0, Math.PI * 2)
    ctx.clip()

    ctx.drawImage(
      image,
      position.x,
      position.y,
      image.width * scale,
      image.height * scale
    )

    ctx.restore()

    // 원형 테두리
    ctx.strokeStyle = '#6366f1'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CROP_SIZE / 2, 0, Math.PI * 2)
    ctx.stroke()
  }, [image, scale, position])

  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    setDragStart({ x: clientX - position.x, y: clientY - position.y })
  }, [position])

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    })
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleCrop = () => {
    if (!image) return

    // 최종 크롭된 이미지 생성 (100x100으로 리사이즈)
    const outputSize = 100
    const outputCanvas = document.createElement('canvas')
    outputCanvas.width = outputSize
    outputCanvas.height = outputSize
    const outputCtx = outputCanvas.getContext('2d')
    if (!outputCtx) return

    // 원형 클리핑
    outputCtx.beginPath()
    outputCtx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2)
    outputCtx.clip()

    // 크롭 영역 계산
    const cropCenterX = CANVAS_SIZE / 2
    const cropCenterY = CANVAS_SIZE / 2
    const scaleRatio = outputSize / CROP_SIZE

    outputCtx.drawImage(
      image,
      (position.x - cropCenterX + CROP_SIZE / 2) * (outputSize / CROP_SIZE) / scale * -1 + outputSize / 2 - (image.width * scaleRatio * scale) / 2,
      (position.y - cropCenterY + CROP_SIZE / 2) * (outputSize / CROP_SIZE) / scale * -1 + outputSize / 2 - (image.height * scaleRatio * scale) / 2,
      image.width * scaleRatio * scale,
      image.height * scaleRatio * scale
    )

    // 더 간단한 방식으로 다시 구현
    const finalCanvas = document.createElement('canvas')
    finalCanvas.width = outputSize
    finalCanvas.height = outputSize
    const finalCtx = finalCanvas.getContext('2d')
    if (!finalCtx) return

    // 원형 마스크
    finalCtx.beginPath()
    finalCtx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2)
    finalCtx.clip()

    // 현재 캔버스에서 크롭 영역만 추출
    const sourceCanvas = canvasRef.current
    if (!sourceCanvas) return

    const cropStartX = (CANVAS_SIZE - CROP_SIZE) / 2
    const cropStartY = (CANVAS_SIZE - CROP_SIZE) / 2

    finalCtx.drawImage(
      sourceCanvas,
      cropStartX,
      cropStartY,
      CROP_SIZE,
      CROP_SIZE,
      0,
      0,
      outputSize,
      outputSize
    )

    // JPEG로 변환 (용량 절약)
    const dataUrl = finalCanvas.toDataURL('image/jpeg', 0.8)
    onCrop(dataUrl)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-2xl p-6 mx-4 w-full max-w-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">프로필 사진 편집</h3>

        <div className="flex justify-center mb-4">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              className="cursor-move rounded-lg bg-gray-100"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
            />
          </div>
        </div>

        {/* 줌 컨트롤 */}
        <div className="flex items-center gap-3 mb-6 px-4">
          <span className="text-sm text-gray-500">축소</span>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <span className="text-sm text-gray-500">확대</span>
        </div>

        <p className="text-sm text-gray-400 text-center mb-4">
          드래그하여 위치를 조정하세요
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl font-semibold bg-gray-100 text-gray-600"
          >
            취소
          </button>
          <button
            onClick={handleCrop}
            className="flex-1 py-3 rounded-xl font-semibold bg-primary text-white"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  )
}
