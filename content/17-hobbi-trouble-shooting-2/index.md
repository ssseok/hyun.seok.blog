---
emoji: 🚨
title: 'SSE(Server-Sent Events) 연결 트러블 슈팅'
date: '2025-06-09'
categories: Trouble-Shooting
---

프로젝트 초기 SSE 방식은 백엔드에서 동기적으로 작동했기에 저희 프론트에서 자동 연결 시도 함수를 만든 상황입니다. (추 후에는 비동기로 하여 `eventSource.addEventListener` 에 `notification`(백엔드에서 네임 지정)으로 바꾸었습니다.)

## 문제점

- 초기에는 알림창을 열었을 때만 SSE 연결이 이루어지는 구조였습니다.

- 좋아요, 댓글 등의 실시간 알림 기능이 제대로 동작하지 않는 문제 발생

## 초기 동작

- 사용자가 웹 애플리케이션에 로그인한 상태에서도 알림 컴포넌트를 열기 전에는 SSE 연결이 활성화되지 않았습니다.

- 새로운 알림(예: 좋아요, 댓글)이 발생해도 사용자가 알림 UI를 열 때까지는 실시간으로 알림을 받지 못했습니다.

- 알림 UI를 닫거나 페이지를 이동하면 SSE 연결이 종료되어, 다시 알림 UI를 열어야만 연결이 재개되는 비효율적인 방식이었습니다.

## 원인 분석

알림 기능은 좋아요, 댓글 등 다양한 이벤트 발생 시 실시간으로 사용자에게 푸시되는 것이 핵심입니다.

SSE 연결이 알림 UI 로딩 시에만 의존적으로 동작하도록 설계되었기 때문에, 사용자가 알림 UI를 활성화하지 않은 상태에서는 실시간 알림을 받을 수 없는 문제가 발생했습니다. 

SSE 연결은 로그인 후 지속적으로 유지되어야 하는 성격을 가짐에도 불구하고, 특정 UI 액션에 종속적으로 구현된 것이 근본적인 원인이었습니다.

## 해결 방안

사용자 로그인 이후 알림 UI 활성화 여부와 상관없이 SSE 연결을 지속적으로 유지하기 위해 SSEHandler 컴포넌트를 구현하고 적용했습니다.

```typescript
// SSEHandler

'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { connectNotificationSSE } from '@/services/sse';
import { usePathname } from 'next/navigation';

export default function SSEHandler() {
  const { isAuthenticated } = useAuthStore();
  const pathname = usePathname();

  const isAuthPage = pathname === '/' || pathname === '/signup';

  useEffect(() => {
    if (isAuthPage || !isAuthenticated) return;

    let eventSource: EventSource | null = null;
    let retryCount = 0;
    const maxRetries = 5;
    const retryDelay = 10000;

    const connectSSE = () => {
      try {
        eventSource = connectNotificationSSE((data: string) => {
          try {
            retryCount = 0;
          } catch (error) {
            console.error('SSE 메시지 파싱 에러:', error);
          }
        });

        // SSE 이벤트 핸들러 설정
        if (eventSource) {
          eventSource.onopen = () => {
            retryCount = 0; // 연결 성공시 재시도 카운트 초기화
          };

          eventSource.onerror = () => {
            console.error('SSE 연결 에러 발생');
            if (eventSource) {
              eventSource.close();
              eventSource = null;
            }

            // 재연결 로직
            if (retryCount < maxRetries) {
              retryCount++;

              setTimeout(() => {
                eventSource = connectSSE();
              }, retryDelay);
            } else {
              console.error('최대 재시도 횟수를 초과했습니다.');
            }
          };
        }

        return eventSource;
      } catch (error) {
        console.error('SSE 연결 생성 중 에러:', error);
        return null;
      }
    };

    // 초기 SSE 연결
    eventSource = connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    };
  }, [isAuthenticated, pathname]);

  return null;
}
```

- `useEffect` 훅을 사용하여 사용자가 인증된 상태인지 확인하고, 인증된 경우에만 SSE 연결을 시도하도록 했습니다.

- 홈페이지(`/`) 또는 회원가입 페이지(`signup`)와 같이 SSE 연결이 불필요한 페이지에서는 연결을 시도하지 않도록 예외 처리를 추가했습니다.

- 네트워크 문제 등으로 SSE 연결이 끊어졌을 경우, 자동으로 재연결을 시도하는 로직을 구현했습니다. 최대 5번까지, 각 시도 간 10초의 지연 시간을 두어 서버 부하를 줄이면서도 연결 안정성을 높였습니다.

- 컴포넌트 언마운트 시 SSE 연결을 확실히 종료하도록 `useEffect`의 클린업 함수를 사용했습니다.

## 결과

SSEHandler 컴포넌트를 도입하고 로그인 상태 기반의 지속적인 연결 및 자동 재연결 로직을 적용한 결과, 사용자는 알림 UI를 열지 않아도 로그인 상태만 유지되면 좋아요, 댓글 등의 실시간 알림을 즉시 받을 수 있게 되었습니다. 이를 통해 사용자 경험이 크게 향상되었습니다.

```toc

```
