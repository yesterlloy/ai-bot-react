
import React from 'react';
import type { IMessage } from '@/store/aiBotContext'

export const parseChunk = (chunk: string): IMessage => {
  try {
    const json = JSON.parse(chunk) as IMessage;
    if(!json.id) {
        json.id = Date.now().toString() + '_bot';
    }
    if(!json.sender) {
        json.sender = 'bot';
    }
    return json;
  } catch (error) {
    console.log('error', error);
    return  {
        id: Date.now().toString(),
        content: chunk,
        sender: 'bot',
        timestamp: new Date()
    };
  }
}


/**
 * 判断是否为React组件类型（函数组件或类组件）
 * @param {*} value - 要检查的值
 * @returns {boolean} 是否为组件类型
 */
export function isComponentType(value: any) {
  // 函数组件：是函数且名称以大写字母开头（React约定）
  if (typeof value === 'function') {
    return value.name.charAt(0) === value.name.charAt(0).toUpperCase();
  }
  
  // 类组件：继承自React.Component
  if (value && value.prototype && value.prototype.isReactComponent) {
    return true;
  }
  
  return false;
}

/**
 * 判断是否为React组件实例（React元素）
 * @param {*} value - 要检查的值
 * @returns {boolean} 是否为组件实例
 */
export function isComponentInstance(value: any) {
  // React元素有$$typeof属性且为React元素符号
  return React.isValidElement(value);
}