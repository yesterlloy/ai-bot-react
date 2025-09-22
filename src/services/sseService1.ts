import { apiService } from './apiService'; // 若仍找不到模块，请检查 apiService 文件是否存在于同目录下，或确认路径是否正确

// 如果 apiService 文件位于同一目录下但未找到，可尝试以下几种可能的修正方式：
// 1. 若 apiService 文件扩展名为 .ts 或 .tsx，可以明确指定扩展名
// import { apiService } from './apiService.ts';
// 2. 若 apiService 文件位于子目录中，需要修正路径
// import { apiService } from '../path/to/apiService';
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
    }, this.config.retryInterval) ;
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
 * 处理POST请求的SSE连接（使用apiService.post实现）
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
  let isAborted = false;

  try {
    // 发送POST请求，并通过配置暴露底层xhr对象
    const response = await apiService.post<{ data: string }>(url, body, {
      headers,
      responseType: 'text',
      // 使用onDownloadProgress处理流式响应
      onDownloadProgress: (progressEvent) => {
        if (isAborted) return;
        
        const xhr = progressEvent.target as XMLHttpRequest;
        const responseText = xhr.responseText;
        
        if (responseText && onChunk) {
          // 简单分割事件流数据
          const lines = responseText.split('\n');
          for (const line of lines) {
            if (line.startsWith('data:')) {
              const data = line.substring(5).trim();
              if (data) {
                try {
                  onChunk(data);
                } catch (e) {
                  console.error('Error processing chunk:', e);
                }
              }
            }
          }
        }
      }
    });

    // 请求完成后调用onComplete
    if (onComplete && response && !isAborted) {
      try {
        onComplete(response as T);
      } catch (e) {
        console.error('Failed to parse complete response:', e);
      }
    }

  } catch (error) {
    if (!isAborted && onError && error instanceof Error) {
      onError(error);
    } else if (!isAborted) {
      console.error('SSE POST request failed:', error);
    }
  }

  // 返回关闭函数
  return () => {
    isAborted = true;
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