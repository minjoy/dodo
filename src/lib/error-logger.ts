// 인메모리 에러 로거 (서버 재시작 시 초기화)
// 외부 서비스 없이 관리자 페이지에서 최근 에러를 확인할 수 있게 합니다.

export interface ErrorLogEntry {
  id: string
  timestamp: string
  source: string    // API route 경로 또는 모듈명
  message: string
  stack?: string
}

const MAX_ENTRIES = 100

class ErrorLogger {
  private logs: ErrorLogEntry[] = []
  private counter = 0

  capture(source: string, error: unknown) {
    const entry: ErrorLogEntry = {
      id: String(++this.counter),
      timestamp: new Date().toISOString(),
      source,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5).join('\n') : undefined,
    }

    this.logs.push(entry)
    if (this.logs.length > MAX_ENTRIES) {
      this.logs.shift()
    }

    // 기존 console.error 출력은 유지
    console.error(`[${source}]`, error)
  }

  getRecent(limit = 50): ErrorLogEntry[] {
    return this.logs.slice(-limit).reverse()
  }

  getCount(): number {
    return this.logs.length
  }

  clear() {
    this.logs = []
  }
}

// 싱글턴 (PM2 단일 프로세스 기준)
const globalForLogger = globalThis as unknown as { errorLogger: ErrorLogger | undefined }
export const errorLogger = globalForLogger.errorLogger ?? new ErrorLogger()
globalForLogger.errorLogger = errorLogger
