export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-gray-200 border-t-primary" />
      <p className="mt-4 text-sm text-gray-400">잠시만 기다려주세요...</p>
    </div>
  )
}
