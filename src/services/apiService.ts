import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    // 可以在这里添加token等认证信息
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // 统一处理响应数据
    return response;
  },
  (error) => {
    // 统一处理错误
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 处理未授权错误
          localStorage.removeItem('authToken');
          // 可以跳转到登录页
          break;
        case 403:
          // 处理权限错误
          console.error('权限不足');
          break;
        case 404:
          // 处理资源不存在错误
          console.error('请求的资源不存在');
          break;
        case 500:
          // 处理服务器错误
          console.error('服务器错误');
          break;
        default:
          console.error('请求失败', error.response.data);
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('网络错误，请检查网络连接');
    } else {
      // 设置请求时发生错误
      console.error('请求配置错误', error.message);
    }
    return Promise.reject(error);
  }
);

// 常用请求方法封装
export const apiService = {
  // GET请求
  get<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.get(url, { params, ...config }).then((response) => response.data);
  },

  // POST请求
  post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.post(url, data, config).then((response) => response.data);
  },

  // PUT请求
  put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.put(url, data, config).then((response) => response.data);
  },

  // DELETE请求
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.delete(url, config).then((response) => response.data);
  },

  // PATCH请求
  patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return apiClient.patch(url, data, config).then((response) => response.data);
  },

  // 上传文件
  upload<T>(url: string, file: File, onUploadProgress?: (progressEvent: any) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    }).then((response) => response.data);
  }
};

export default apiClient;