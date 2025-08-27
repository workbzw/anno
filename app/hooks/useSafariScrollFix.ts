import { useEffect } from 'react';

export function useSafariScrollFix() {
  useEffect(() => {
    // 禁用 document 的过度滚动
    document.documentElement.style.overscrollBehavior = 'none';
    document.body.style.overscrollBehavior = 'none';
    
    return () => {
      // 清理
      document.documentElement.style.overscrollBehavior = '';
      document.body.style.overscrollBehavior = '';
    };
  }, []);
}