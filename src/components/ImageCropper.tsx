'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface ImageCropperProps {
  imageFile: File
  onCrop: (croppedDataUrl: string) => void
  onCancel: () => void
}

export default function ImageCropper({ imageFile, onCrop, onCancel }: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [imageSrc, setImageSrc] = useState<string>('')
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 })

  // 크롭 영역 상태
  const [cropCircle, setCropCircle] = useState({ x: 0, y: 0, size: 200 })

  // 드래그 상태
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // 이미지 파일 로드
  useEffect(() => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string)
    }
    reader.readAsDataURL(imageFile)
  }, [imageFile])

  // 이미지 크기 계산 및 초기 크롭 영역 설정
  useEffect(() => {
    if (!imageSrc || !containerRef.current) return

    const img = new Image()
    img.onload = () => {
      const container = containerRef.current!
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight - 120 // 버튼 영역 제외

      // 이미지를 컨테이너에 맞게 조절
      const scale = Math.min(
        containerWidth / img.width,
        containerHeight / img.height
      )

      const displayWidth = img.width * scale
      const displayHeight = img.height * scale
      const offsetX = (containerWidth - displayWidth) / 2
      const offsetY = (containerHeight - displayHeight) / 2

      setImageSize({ width: displayWidth, height: displayHeight })
      setImageOffset({ x: offsetX, y: offsetY })

      // 초기 크롭 영역 (이미지 중앙, 이미지 크기의 60%)
      const initialSize = Math.min(displayWidth, displayHeight) * 0.6
      setCropCircle({
        x: offsetX + (displayWidth - initialSize) / 2,
        y: offsetY + (displayHeight - initialSize) / 2,
        size: initialSize,
      })
    }
    img.src = imageSrc
  }, [imageSrc])

  const getEventPosition = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    return { x: e.clientX, y: e.clientY }
  }

  // 원 드래그 시작
  const handleCircleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const pos = getEventPosition(e)
    setIsDragging(true)
    setDragStart({
      x: pos.x - cropCircle.x,
      y: pos.y - cropCircle.y,
    })
  }

  // 리사이즈 핸들 드래그 시작
  const handleResizeMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const pos = getEventPosition(e)
    setIsResizing(true)
    setDragStart({ x: pos.x, y: pos.y })
  }

  // 드래그 중
  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    const pos = 'touches' in e
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : { x: e.clientX, y: e.clientY }

    if (isDragging) {
      const newX = pos.x - dragStart.x
      const newY = pos.y - dragStart.y

      // 이미지 범위 내로 제한
      const minX = imageOffset.x
      const maxX = imageOffset.x + imageSize.width - cropCircle.size
      const minY = imageOffset.y
      const maxY = imageOffset.y + imageSize.height - cropCircle.size

      setCropCircle(prev => ({
        ...prev,
        x: Math.max(minX, Math.min(maxX, newX)),
        y: Math.max(minY, Math.min(maxY, newY)),
      }))
    } else if (isResizing) {
      const dx = pos.x - dragStart.x
      const dy = pos.y - dragStart.y
      const delta = Math.max(dx, dy)

      setCropCircle(prev => {
        const newSize = Math.max(80, Math.min(
          Math.min(imageSize.width, imageSize.height),
          prev.size + delta
        ))

        // 크기 변경 시 이미지 범위 체크
        let newX = prev.x
        let newY = prev.y

        if (newX + newSize > imageOffset.x + imageSize.width) {
          newX = imageOffset.x + imageSize.width - newSize
        }
        if (newY + newSize > imageOffset.y + imageSize.height) {
          newY = imageOffset.y + imageSize.height - newSize
        }

        return { x: newX, y: newY, size: newSize }
      })

      setDragStart({ x: pos.x, y: pos.y })
    }
  }, [isDragging, isResizing, dragStart, imageOffset, imageSize, cropCircle.size])

  // 드래그 끝
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
  }, [])

  // 이벤트 리스너 등록
  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleMouseMove)
      window.addEventListener('touchend', handleMouseUp)

      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('touchmove', handleMouseMove)
        window.removeEventListener('touchend', handleMouseUp)
      }
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp])

  // 크롭 실행
  const handleCrop = () => {
    if (!imageSrc) return

    const img = new Image()
    img.onload = () => {
      // 이미지 표시 비율 계산
      const scaleX = img.width / imageSize.width
      const scaleY = img.height / imageSize.height

      // 실제 이미지에서의 크롭 좌표
      const sourceX = (cropCircle.x - imageOffset.x) * scaleX
      const sourceY = (cropCircle.y - imageOffset.y) * scaleY
      const sourceSize = cropCircle.size * Math.max(scaleX, scaleY)

      // 출력 캔버스 (200x200 - 레티나 대응)
      const outputSize = 200
      const canvas = document.createElement('canvas')
      canvas.width = outputSize
      canvas.height = outputSize
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // 원형 마스크
      ctx.beginPath()
      ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2)
      ctx.clip()

      // 이미지 그리기
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceSize,
        sourceSize,
        0,
        0,
        outputSize,
        outputSize
      )

      // JPEG로 변환
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
      onCrop(dataUrl)
    }
    img.src = imageSrc
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 py-3 bg-black/80">
        <button
          onClick={onCancel}
          className="text-white text-lg font-medium"
        >
          취소
        </button>
        <h1 className="text-white text-lg font-bold">사진 편집</h1>
        <button
          onClick={handleCrop}
          className="text-primary text-lg font-bold"
        >
          완료
        </button>
      </header>

      {/* 이미지 및 크롭 영역 */}
      <div className="flex-1 relative overflow-hidden">
        {/* 원본 이미지 */}
        {imageSrc && (
          <img
            src={imageSrc}
            alt="편집할 이미지"
            className="absolute"
            style={{
              left: imageOffset.x,
              top: imageOffset.y,
              width: imageSize.width,
              height: imageSize.height,
            }}
            draggable={false}
          />
        )}

        {/* 어두운 오버레이 (크롭 영역 제외) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <mask id="cropMask">
              <rect width="100%" height="100%" fill="white" />
              <circle
                cx={cropCircle.x + cropCircle.size / 2}
                cy={cropCircle.y + cropCircle.size / 2}
                r={cropCircle.size / 2}
                fill="black"
              />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.6)"
            mask="url(#cropMask)"
          />
        </svg>

        {/* 크롭 원 테두리 및 핸들 */}
        <div
          className="absolute border-2 border-white rounded-full cursor-move"
          style={{
            left: cropCircle.x,
            top: cropCircle.y,
            width: cropCircle.size,
            height: cropCircle.size,
          }}
          onMouseDown={handleCircleMouseDown}
          onTouchStart={handleCircleMouseDown}
        >
          {/* 가이드 라인 */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-px h-full bg-white/30" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-px bg-white/30" />
          </div>

          {/* 리사이즈 핸들 (우하단) */}
          <div
            className="absolute -bottom-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg cursor-se-resize flex items-center justify-center"
            onMouseDown={handleResizeMouseDown}
            onTouchStart={handleResizeMouseDown}
          >
            <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </div>
        </div>
      </div>

      {/* 안내 텍스트 */}
      <div className="px-4 py-6 bg-black/80 text-center">
        <p className="text-white/70 text-sm">
          원을 드래그하여 위치를 조정하고, 모서리를 잡아 크기를 조절하세요
        </p>
      </div>
    </div>
  )
}
