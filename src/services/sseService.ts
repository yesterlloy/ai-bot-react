/**
 * SSE连接配置接口
 */
export interface SSEConfig {
  url: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: any;
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
  onOpen?: (event: Event) => void;
  onClose?: () => void;
  withCredentials?: boolean;
  retryInterval?: number;
  maxRetries?: number;
}

/**
 * SSE客户端类，用于处理Server-Sent Events连接
 */
export class SSEClient {
  private eventSource: EventSource | null = null;
  private config: SSEConfig;
  private retries: number = 0;
  private reconnectTimeout: any;
  private isClosed: boolean = false;

  constructor(config: SSEConfig) {
    this.config = {
      method: 'GET',
      headers: {},
      withCredentials: false,
      retryInterval: 1000,
      maxRetries: 5,
      ...config
    };

    this.connect();
  }

  /**
   * 创建SSE连接
   */
  private connect(): void {
    if (this.isClosed) return;

    try {
      // 构建URL参数
      let url = this.config.url;
      
      // 对于GET请求，可以将参数附加到URL
      if (this.config.method === 'GET' && this.config.body) {
        const params = new URLSearchParams();
        Object.entries(this.config.body).forEach(([key, value]) => {
          params.append(key, String(value));
        });
        url = `${url}?${params.toString()}`;
      }

      // 创建EventSource实例
      this.eventSource = new EventSource(url, {
        withCredentials: this.config.withCredentials
      });

      // 设置事件处理器
      this.eventSource.onmessage = (event: MessageEvent) => {
        try {
          // 尝试解析JSON数据
          const data = event.data ? JSON.parse(event.data) : null;
          if (this.config.onMessage) {
            this.config.onMessage(data);
          }
        } catch (error) {
          // 如果不是JSON数据，直接传递原始数据
          if (this.config.onMessage) {
            this.config.onMessage(event.data);
          }
        }
      };

      this.eventSource.onerror = (error: Event) => {
        if (this.config.onError) {
          this.config.onError(error);
        }
        
        // 处理重连逻辑
        this.handleReconnect();
      };

      this.eventSource.onopen = (event: Event) => {
        // 连接成功，重置重试计数
        this.retries = 0;
        if (this.config.onOpen) {
          this.config.onOpen(event);
        }
      };

    } catch (error) {
      console.error('Failed to create SSE connection:', error);
      this.handleReconnect();
    }
  }

  /**
   * 处理连接断开的重连逻辑
   */
  private handleReconnect(): void {
    // 清除之前的重连定时器
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    // 如果达到最大重试次数或已手动关闭，则不再重连
    if (this.retries >= (this.config.maxRetries || 5) || this.isClosed) {
      this.close();
      return;
    }

    // 增加重试计数
    this.retries++;

    // 设置重连定时器
    this.reconnectTimeout = setTimeout(() => {
      console.log(`Attempting to reconnect (${this.retries}/${this.config.maxRetries})...`);
      this.connect();
    }, this.config.retryInterval);
  }

  /**
   * 关闭SSE连接
   */
  public close(): void {
    this.isClosed = true;
    
    // 清除重连定时器
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // 关闭EventSource连接
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    // 调用关闭回调
    if (this.config.onClose) {
      this.config.onClose();
    }
  }
}

/**
 * 创建SSE连接的工厂函数
 * @param config SSE连接配置
 * @returns SSE客户端实例
 */
export function createSSE(config: SSEConfig): SSEClient {
  return new SSEClient(config);
}

/**
 * 处理POST请求的SSE连接（使用fetch API实现）
 */
export async function createSSEWithPost<T>(
  url: string,
  body: any,
  options: {
    headers?: Record<string, string>;
    onChunk?: (chunk: string) => void;
    onComplete?: (result: T) => void;
    onError?: (error: Error) => void;
  }
): Promise<() => void> {
  const { headers = {}, onChunk, onComplete, onError } = options;
  let controller: AbortController | null = new AbortController();
  let response: Response | null = null;
  let reader: ReadableStreamDefaultReader<string> | null = null;

  try {
    // 设置默认Content-Type
    const requestHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };

    // 发送POST请求
    response = await fetch(url, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(body),
      signal: controller?.signal,
      credentials: 'include' // 包含cookies
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // 获取响应体的读取器
    if (!response.body) {
      throw new Error('Response body is null');
    }

    // 创建文本解码器流
    reader = response.body
      .pipeThrough(new TextDecoderStream())
      .getReader();

    let accumulatedData = '';

    // 循环读取流数据
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        // 流结束
        if (onComplete && accumulatedData) {
          try {
            onComplete(JSON.parse(accumulatedData) as T);
          } catch (e) {
            console.error('Failed to parse complete response:', e);
          }
        }
        break;
      }

      // 处理接收到的数据
      accumulatedData += value;
      
      // 分割事件流数据
      const lines = (accumulatedData + value).split('\n');
      for (const line of lines) {
        if (line.startsWith('data:')) {
          const data = line.substring(5).trim();
          if (data && onChunk) {
            try {
              onChunk(data);
            } catch (e) {
              console.error('Error processing chunk:', e);
            }
          }
        }
      }
    }

  } catch (error) {
    if (onError && error instanceof Error) {
      onError(error);
    } else {
      console.error('SSE POST request failed:', error);
    }
  } finally {
    // 清理资源
    if (reader) {
      reader.releaseLock();
    }
  }

  // 返回关闭函数
  return () => {
    if (controller) {
      controller.abort();
      controller = null;
    }
  };
}

/**
 * 解析SSE事件数据的辅助函数
 */
export function parseSSEvent(eventData: string): any {
  try {
    return JSON.parse(eventData);
  } catch (error) {
    // 如果解析失败，返回原始数据
    return eventData;
  }
}