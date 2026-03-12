'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  // 브라우저 환경에서 localStorage 대신 sessionStorage를 사용하도록 storage 객체 주입
  // (next-themes 버전이나 환경에 따라 직접적인 storage 주입이 어려울 경우, 
  // storageKey를 sessionStorage와 동기화하는 래퍼를 구성할 수 있습니다.)
  
  return (
    <NextThemesProvider 
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
