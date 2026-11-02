import { DEV_API_KEY } from '@funkit/api-base'

/** biome-ignore lint/correctness/noUnusedImports: it's used in TSDoc of {@link FunLogger.error} */
import type { Logger } from '@funkit/api-base'
import type {
  FiatDeliveryKind,
  LogContext,
  LogLevel,
  LogTransport,
} from '~/interfaces/logTransport'

enum FunLogEnv {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

/**===============================
 * FUN LOGGER CLASS
 *================================*/

const FUN_DEV_API_KEYS = [
  'hnHe...OBhf',
  'MYny...pSHq',
  DEV_API_KEY,
]

interface LogParams {
  title: string
  data?: object | undefined
  error?: Error
}

interface QueuedLog {
  level: LogLevel
  title: string
  data?: object
  error?: Error
}

/**
 * Platform-agnostic structured logger. All platform-specific behavior — where
 * records actually go — lives behind the injected {@link LogTransport}: web
 * injects `DatadogBrowserLogsTransport` (`@datadog/browser-logs`), React Native
 * injects a Datadog React Native transport. The queueing, env detection, level
 * routing, console fallback, and user-context tracking here touch no DOM and
 * are shared across platforms.
 */
export class FunLogger {
  protected apiKey: string | null
  protected isDebugMode: boolean
  protected userId: string | null
  protected userAddress: string | null
  protected userName: string | null
  protected userLoginType: string | null
  protected typeLabel: string | null
  protected sdkVersion: string | null
  protected l2Address: string | null
  private flowTraceId: string | null
  private flowDelivery: FiatDeliveryKind | null
  private debugTag: string | null
  private seq: number
  private isConfigured: boolean
  private logQueue: QueuedLog[]
  private disableLogging: boolean
  private readonly transport: LogTransport

  constructor(transport: LogTransport) {
    this.transport = transport
    this.transport.setEnv?.(FunLogEnv.DEVELOPMENT)
    this.transport.setTrackingConsent?.('granted')
    this.apiKey = null
    this.isDebugMode = false
    this.userId = null
    this.userAddress = null
    this.userName = null
    this.userLoginType = null
    this.typeLabel = null
    this.sdkVersion = null
    this.l2Address = null
    this.flowTraceId = null
    this.flowDelivery = null
    this.debugTag = null
    this.seq = 0
    this.isConfigured = false
    this.logQueue = []
    this.disableLogging = false
  }

  private getFunLogEnv(): FunLogEnv {
    // If its an invalid api key or is a known dev api key, we are in dev env
    if (!this.apiKey || FUN_DEV_API_KEYS.includes(this.apiKey)) {
      return FunLogEnv.DEVELOPMENT
    }

    return FunLogEnv.PRODUCTION
  }

  /** Merge caller data with the logger's resolved context for the transport. */
  private buildLogContext(data?: object): LogContext {
    this.seq += 1
    return {
      data,
      apiKey: this.apiKey,
      userId: this.userId,
      userName: this.userName,
      userAddress: this.userAddress,
      userLoginType: this.userLoginType,
      typeLabel: this.typeLabel,
      sdkVersion: this.sdkVersion,
      traceId: this.flowTraceId,
      delivery: this.flowDelivery,
      debugTag: this.debugTag,
      seq: this.seq,
    }
  }

  private processLog(
    level: LogLevel,
    title: string,
    data?: object,
    error?: Error,
  ) {
    // Queue log if not configured yet
    if (!this.isConfigured) {
      this.logQueue.push({ level, title, data, error })
      return
    }

    // Validate apiKey after configuration
    if (!this.apiKey) {
      console.error(
        'FunLogger: apiKey is not set. Please call configure() with a valid apiKey.',
      )
      return
    }

    const isProd = this.getFunLogEnv() === FunLogEnv.PRODUCTION

    // Emit to the platform transport in production
    if (isProd) {
      this.transport.log({
        level,
        title,
        context: this.buildLogContext(data),
        error,
      })
    }

    // Log to console in development or debug mode
    if (!isProd || this.isDebugMode) {
      const formattedData = data || ''
      switch (level) {
        case 'debug':
          console.debug(title, formattedData)
          break
        case 'info':
          console.log(title, formattedData)
          break
        case 'warn':
          console.warn(title, formattedData)
          break
        case 'error':
          console.error(title, formattedData, error)
          break
      }
    }
  }

  private onDebug({ title, data }: LogParams) {
    this.processLog('debug', title, data)
  }

  private onInfo({ title, data }: LogParams) {
    this.processLog('info', title, data)
  }

  private onWarn({ title, data, error }: LogParams) {
    this.processLog('warn', title, data, error)
  }

  private onError({ title, error, data }: LogParams) {
    this.processLog('error', title, data, error)
  }

  private extractError(error: unknown): Error | null {
    if (error instanceof Error) {
      return error
    }

    // common usage across the codebase
    if (
      typeof error === 'object' &&
      error !== null &&
      'error' in error &&
      error.error instanceof Error
    ) {
      return error.error
    }

    return null
  }

  /**========================
   * PUBLIC LOGGER FUNCTIONS
   *=========================*/

  public log(title: string, data?: object) {
    this.onInfo({ title, data })
  }

  public info(title: string, data?: object) {
    this.onInfo({ title, data })
  }

  public debug(title: string, data?: object) {
    this.onDebug({ title, data })
  }

  /**
   * Recovered failures log here, so an Error in `data` (directly or as
   * `data.error`) goes to the transport's error channel as it does for `error()`.
   */
  public warn(title: string, data?: object) {
    const error = this.extractError(data) ?? undefined
    this.onWarn({ title, data, error })
  }

  /**
   * @param errorOrData -
   * Previously was called "error" but since in the {@link Logger} interface, error is defined as object (which is the same thing as "any"), we treat it as of unknown type here for safety.
   * In a lot of places it's actually being used as a "data" prop, which also usually has an `.error` property representing an actual {@link Error} object.
   */
  public error(title: string, errorOrData: unknown, _data: object = {}) {
    // Trying to extract {@link Error} object
    const error = this.extractError(errorOrData) ?? undefined

    // Merging data
    const data = {
      ..._data,
      ...(typeof errorOrData === 'object' && errorOrData !== null
        ? errorOrData
        : {}),
    }

    this.onError({ title, error, data })
  }

  private flushLogQueue() {
    const queueCopy = [...this.logQueue]
    this.logQueue = []

    for (const queuedLog of queueCopy) {
      const { level, title, data, error } = queuedLog

      switch (level) {
        case 'debug':
          this.onDebug({ title, data })
          break
        case 'info':
          this.onInfo({ title, data })
          break
        case 'warn':
          this.onWarn({ title, data, error })
          break
        case 'error':
          this.onError({ title, data, error })
          break
      }
    }
  }

  public configure(
    apiKey: string | null,
    isDebug: boolean,
    sdkVersion: string,
    disableLogging = false,
  ) {
    this.apiKey = apiKey
    this.isDebugMode = isDebug
    this.sdkVersion = sdkVersion
    this.disableLogging = disableLogging
    this.isConfigured = true
    this.transport.setEnv?.(this.getFunLogEnv())
    this.transport.setTrackingConsent?.(
      this.disableLogging ? 'not-granted' : 'granted',
    )

    this.flushLogQueue()
  }

  /** Whether the host asked for debug output: a development build, or an explicit `debug`. */
  public get isDebug(): boolean {
    return this.isDebugMode
  }

  public getUserId() {
    return this.userId
  }

  public getUserAddress() {
    return this.userAddress
  }

  public getUserName() {
    return this.userName
  }

  public getUserLoginType() {
    return this.userLoginType
  }

  public getTypeLabel() {
    return this.typeLabel
  }

  public getL2Address() {
    return this.l2Address
  }

  /** Starts a flow's context. A delivery left from an earlier flow is dropped. */
  public setFlowContext({
    traceId,
    delivery = null,
  }: {
    traceId: string
    delivery?: FiatDeliveryKind | null
  }) {
    this.flowTraceId = traceId
    this.flowDelivery = delivery
  }

  /** Re-tags the open flow, e.g. when the buyer picks another target. */
  public setFlowDelivery(delivery: FiatDeliveryKind | null) {
    this.flowDelivery = delivery
  }

  public getFlowDelivery(): FiatDeliveryKind | null {
    return this.flowDelivery
  }

  public clearFlowContext() {
    this.flowTraceId = null
    this.flowDelivery = null
  }

  public setDebugTag(tag: string | null) {
    this.debugTag = tag
  }

  public getDebugTag(): string | null {
    return this.debugTag
  }

  public getTraceId(): string | null {
    return this.flowTraceId
  }

  public flush() {
    this.transport.flush?.()
  }

  public setUserInfo(
    userId: string,
    userAddress: string,
    userName: string,
    userLoginType: string,
    typeLabel: string,
    l2Address?: string,
  ) {
    this.userId = userId
    this.userAddress = userAddress
    this.userName = userName
    this.userLoginType = userLoginType
    this.typeLabel = typeLabel
    this.l2Address = l2Address ?? null
  }
}
