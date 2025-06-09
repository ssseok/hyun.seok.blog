---
emoji: 🚨
title: 'Next.js Middleware를 활용한 인증 라우팅 트러블 슈팅'
date: '2025-06-09'
categories: Trouble-Shooting
---

HOBBi 프로젝트에서 Next.js 15 버전을 사용했는데 인증이 된 사람과 비회원 즉 인증이 안된사람들의 라우팅을 어떻게 처리할지 생각중 [Next.js Middleware](https://nextjs.org/docs/pages/building-your-application/routing/middleware) 공식문서를 보게되었고, 프로젝트에 활용해보면 좋겠다는 생각이 들어서 사용하게 되었습니다.

## 문제점

Next.js의 미들웨어를 사용하여 라우팅 시 사용자 인증 상태를 확인하고 접근 권한을 제어하려 했으나, 미들웨어 환경에서는 `localStorage`에 저장된 정보에 접근할 수 없었습니다.

미들웨어는 클라이언트 측 스크립트가 실행되기 전에 요청을 가로채 처리하므로, 브라우저 API인 `localStorage`를 사용할 수 없습니다.

## 원인 분석

- 미들웨어에는 실행 환경에 제약이 있습니다. 미들웨어는 서버에서 실행이 됩니다. 이 환경은 `window` 객체나 `localStorage`와 같은 클라이언트 측 웹 API에 접근할 수 없습니다.

- 따라서 `localStorage`에 저장된 사용자 인증 상태 정보는 미들웨어에서 확인할 수 없으며, 페이지 접근 권한 제어 로직을 미들웨어에서 수행하는 것이 불가능했습니다.

## 해결 방안

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 비회원 사용자가 접근 가능한 경로 패턴
const PUBLIC_PATH_PATTERNS = [
  /^\/$/,
  /^\/signup$/,
  /^\/find_password$/,
  /^\/verify_email$/,
  /^\/verify_fail$/,
  /^\/posts$/,
  /^\/posts\/search/,
  /^\/posts\/\d+$/,
];

// 로그인한 사용자가 접근하면 리다이렉트할 경로
const AUTH_REDIRECT_PATHS = ['/', '/signup'];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const authCookie = request.cookies.get('auth-storage');

  let isAuthenticated = false;
  if (authCookie?.value) {
    try {
      const decodedValue = decodeURIComponent(authCookie.value);
      const authData = JSON.parse(decodedValue);
      isAuthenticated = authData.state?.isAuthenticated === true;
    } catch (error) {
      console.error('인증 쿠키 파싱 오류:', error);
    }
  }

  // 로그인한 사용자가 '/' 또는 '/signup'에 접근하면 '/posts'로 리다이렉트
  if (isAuthenticated && AUTH_REDIRECT_PATHS.includes(path)) {
    return NextResponse.redirect(new URL('/posts', request.url));
  }

  // 비회원 사용자의 접근 제어
  if (!isAuthenticated) {
    const isPublicPath = PUBLIC_PATH_PATTERNS.some((pattern) => pattern.test(path));
    if (!isPublicPath) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

// 미들웨어가 적용될 경로 설정
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

- 사용자 로그인 상태 및 인증 토큰을 `localStorage` & HTTP 쿠키에 저장하도록 변경했습니다.(접근 방식 변경)

- HTTP 쿠키는 클라이언트에서 서버로 요청 시 자동으로 함께 전송됩니다. Next.js 미들웨어는 들어오는 요청(`NextRequest`) 객체를 통해 쿠키 정보에 접근할 수 있습니다.(쿠키 활용 이유)

### 로직 순서

1. 미들웨어는 요청이 들어올 때 `auth-storage` 쿠키를 확인하고, 쿠키 값 파싱을 통해 사용자의 인증 상태(`isAuthenticated`)를 판단합니다.

2. 인증된 사용자가 로그인 페이지(`/`) 또는 회원가입 페이지(`/signup`)와 같이 로그인 이후 접근할 필요가 없는 경로에 접근하려 할 경우, 게시글 목록 페이지(`/posts`)로 리다이렉트 시킵니다.

3. 인증되지 않은 사용자가 접근하려 할 경우, `PUBLIC_PATH_PATTERNS`에 정의된 공개 경로인지 확인하고, 공개 경로가 아니면 로그인 페이지(`/`)로 리다이렉트 시켜 접근을 차단합니다.

## 결과

쿠키를 통해 인증 상태를 전달하고, 미들웨어에서 이 정보를 파싱하여 정의된 라우팅 규칙에 따라 사용자의 페이지 접근을 제어함으로써 안정적인 인증 라우팅을 구축할 수 있었습니다.

```toc

```
