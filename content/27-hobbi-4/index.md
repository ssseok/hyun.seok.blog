---
emoji: 🤒
title: '[HOBBi] 이메일 인증 커스텀 훅에 대해서'
date: '2025-07-17'
categories: Project
---

회원가입 이메일 인증에 대해서 관한 커스텀 훅을 기록한 내용입니다.

처음 초기에는 이메일 인증 메일 확인 시 받은 메일함에서 이메일 인증 완료를 누르면 로컬 스토리지에 인증 상태를 넣어 자동으로 이메일 인증 완료가 되게끔 했었는데 문제는 모바일에서는 사용할 수 없는 단점과 로컬 스토리지에 인증 상태가 저장되어있으니깐 회원가입을 이메일 인증을 완료한 상태에서 다른 탭에서 회원가입을 처음부터 시작하면 이메일 인증이 완료되는 오류로 코드번호를 받아서 이메일 인증하는 것으로 바꿔보았습니다.

# use_email_verification (이메일 확인 시 로컬 스토리지 인증 상태) 리팩토링 전

## use_email_verification 이메일 인증 훅

### 주요 기능

1. 이메일 중복 확인 (회원가입 시)
2. 인증 메일 발송
3. 인증 타이머 관리(3분 카운트다운)
4. 인증 상태 관리 및 동기화
5. 로컬 스토리지를 통한 인증 상태 유지
6. 다중 창 간 인증 상태 동기화

### 시나리오

- 회원가입 : 이메일 중복 확인 후 인증 메일 발송
- 비밀번호 찾기 : 중복 확인 없이 인증 메일 발송

### 프로세스

1. 이메일 입력 확인
2. 이메일 중복 확인 (회원가입 시)
3. 인증 메일 발송
4. 3분 타이머 시작
5. 사용자가 메일에서 인증 링크 클릭
6. 인증 완료 시 상태 업데이트

```tsx
 * @param sendVerificationEmail - 인증 메일 발송 함수 (기본값: authService.sendVerificationEmail)
 * @param skipDuplicateCheck - 이메일 중복 확인 스킵 여부 (비밀번호 찾기 시 사용)
```

```tsx
const {
  signupData, // 회원가입 데이터
  updateSignupData, // 회원가입 데이터 업데이트
  isEmailVerified, // 이메일 인증 상태
  setIsEmailVerified, // 이메일 인증 상태 설정
  setIsLoading, // 로딩 상태 설정
  setIsError, // 에러 상태 설정
  setErrorMessage, // 에러 메시지 설정
  isEmailSent, // 이메일 인증 메일 발송 상태
  setIsEmailSent, // 이메일 인증 메일 발송 상태 설정
  emailTimer, // 이메일 인증 타이머
  setEmailTimer, // 이메일 인증 타이머 설정
} = useSignupStore();
```

```tsx
useEffect(() => {
  let timer: NodeJS.Timeout;

  // ===== 타이머 실행 조건 확인 =====
  // 이메일이 발송되고 타이머가 0보다 큰 경우에만 타이머 실행
  if (isEmailSent && emailTimer > 0) {
    timer = setInterval(() => {
      // ===== 타이머 감소 =====
      setEmailTimer(emailTimer - 1);

      // ===== 타이머 종료 처리 =====
      // 타이머가 1 이하가 되면 이메일 발송 상태 초기화
      if (emailTimer <= 1) {
        setIsEmailSent(false);
      }
    }, 1000); // 1초마다 실행
  }

  // ===== 클린업 함수 =====
  // 컴포넌트 언마운트 또는 의존성 변경 시 타이머 초기화
  return () => {
    if (timer) clearInterval(timer);
  };
}, [isEmailSent, emailTimer, setEmailTimer, setIsEmailSent]);
```

- 이메일 인증 타이머 관리 `useEffect`
- 인증 메일 발송 후 3분간 카운트다운 타이머를 실행
- 동작 방식
  - 이메일이 발송되고 타이머가 0보다 큰 경우에만 타이머 실행
  - 1초마다 타이머 값을 1씩 감소
  - 타이머가 1 이하가 되면 이메일 발송 상태 초기화
  - 컴포넌트 언마운트 시 타이머 정리
- 의존성 변경 시 이전 타이머 정리 후 새 타이머 시작

```tsx
const checkEmailAndSendVerification = async () => {
  // ===== 이메일 입력 확인 =====
  if (!signupData.email) {
    setIsError(true);
    setErrorMessage('이메일을 입력해주세요.');
    return;
  }

  try {
    // ===== 상태 초기화 =====
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    // ===== 이메일 중복 확인 =====
    // 비밀번호 찾기에서는 중복 확인을 스킵
    if (!config?.skipDuplicateCheck) {
      const duplicateResponse = await authService.checkEmailDuplicate(signupData.email);

      // ===== 중복 이메일 처리 =====
      // 중복된 이메일인 경우 에러 처리
      if (
        typeof duplicateResponse === 'object' &&
        duplicateResponse !== null &&
        'isDuplicate' in duplicateResponse &&
        duplicateResponse.isDuplicate
      ) {
        setIsError(true);
        setErrorMessage('이미 등록된 회원입니다.');
        return;
      }
    }

    // ===== 인증 메일 발송 =====
    // 설정에서 커스텀 함수를 사용하거나 기본 함수 사용
    const sendEmail = config?.sendVerificationEmail || authService.sendVerificationEmail;
    await sendEmail(signupData.email);

    // ===== 타이머 시작 =====
    // 3분(180초) 타이머 시작
    setEmailTimer(180);
    setIsEmailSent(true);
  } catch (error) {
    // ===== 에러 처리 =====
    setIsError(true);
    setErrorMessage(error instanceof Error ? error.message : '이메일 인증 과정에서 오류가 발생했습니다.');
  } finally {
    // ===== 로딩 상태 해제 =====
    setIsLoading(false);
  }
};
```

- 이메일 중복 확인 및 인증 메일 발송 함수

```tsx
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
```

- 타이머 시간을 mm:ss 형식 변환하는 함수
- 변환 예시
  - 180초 → 3:00
  - 125초 → 2:05

```tsx
useEffect(() => {
  // ===== 로컬 스토리지에서 인증 상태 확인 =====
  const checkVerificationStatus = () => {
    const storedVerified = localStorage.getItem('emailVerified') === 'true';
    const storedEmail = localStorage.getItem('verifiedEmail');

    // ===== 인증 상태 복원 조건 =====
    // 저장된 인증 정보가 현재 이메일과 일치하는 경우 인증 상태 복원
    if (storedVerified && storedEmail && (!signupData.email || signupData.email === storedEmail)) {
      updateSignupData({ email: storedEmail });
      setIsEmailVerified(true);
      setIsEmailSent(false);
    }
  };

  // ===== 초기 상태 확인 =====
  checkVerificationStatus();

  // ===== 다중 창 동기화 =====
  // 다른 창에서의 인증 상태 변경 감지
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'emailVerified' || e.key === 'verifiedEmail') {
      checkVerificationStatus();
    }
  };

  // ===== 스토리지 이벤트 리스너 등록 =====
  window.addEventListener('storage', handleStorageChange);

  // ===== 클린업 함수 =====
  // 컴포넌트 언마운트 시 이벤트 리스너 제거
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
}, []);
```

- 이메일 인증 상태 관리 `useEffect`
- 로컬 스토리지를 통해 인증 상태를 유지하고, 여러 창 간의 인증 상태를 동기화합니다.
- 주요 기능
  - 로컬 스토리지에서 인증 상태 복원
  - 다중 창 간 인증 상태 동기화
  - 인증 완료 시 자동 상태 업데이트
- 동작 방식
  - 컴포넌트 마운트 시 로컬 스토리지 확인
  - 저장된 인증 정보가 현재 이메일과 일치하면 인증 상태 복원
  - StorageEvent 리스너 등록으로 다른 창의 변경 감지
  - 인증 상태 변경 시 자동 동기화

```tsx
return {
  isEmailVerified, // 이메일 인증 상태
  isEmailSent, // 이메일 인증 메일 발송 상태
  emailTimer, // 이메일 인증 타이머
  formatTime, // 타이머 시간 포맷
  checkEmailAndSendVerification, // 이메일 중복 확인 및 인증 메일 발송
};
```

- 훅 반환값

---

# use_email_verification (이메일 인증 코드 6자리) 리팩토링 후

### 주요 기능

1. 이메일 중복 확인(회원가입 시)
2. 인증 메일 발송(6자리 코드 포함)
3. 인증 타이머 관리(3분 카운트 다운)
4. 인증 상태 관리

### 시나리오

- 회원가입: 이메일 중복 확인 후 인증 메일 발송
- 비밀번호 찾기: 중복 확인 없이 인증 메일 발송

### 프로세스

1. 이메일 입력 확인
2. 이메일 중복 확인
3. 인증 메일 발송
4. 3분 타이머 시작
5. 사용자가 메일에서 6자리 코드 확인
6. 코드 입력 후 인증 완료

```tsx
 * @param sendVerificationEmail - 인증 메일 발송 함수 (기본값: authService.sendVerificationEmail)
 * @param skipDuplicateCheck - 이메일 중복 확인 스킵 여부 (비밀번호 찾기 시 사용)
```

```tsx
interface EmailVerificationConfig {
  sendVerificationEmail?: typeof authService.sendVerificationEmail;
  skipDuplicateCheck?: boolean;
}
```

- 인터페이스

```tsx
  sendVerificationEmail: async (email: string) => {
    return fetchApi('/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
  },
```

- 이메일 인증 전송
- 회원가입 후 이메일 인증을 위한 인증 코드를 전송합니다.

```tsx
const {
  signupData, // 회원가입 데이터
  setIsLoading, // 로딩 상태 설정
  setIsError, // 에러 상태 설정
  setErrorMessage, // 에러 메시지 설정
  isEmailVerified, // 이메일 인증 완료 여부
  isEmailSent, // 이메일 인증 메일 발송 상태
  setIsEmailSent, // 이메일 인증 메일 발송 상태 설정
  emailTimer, // 이메일 인증 타이머
  setEmailTimer, // 이메일 인증 타이머 설정
} = useSignupStore();
```

```tsx
useEffect(() => {
  let timer: NodeJS.Timeout;

  // ===== 타이머 실행 조건 확인 =====
  // 이메일이 발송되고 타이머가 0보다 큰 경우에만 타이머 실행
  if (isEmailSent && emailTimer > 0) {
    timer = setInterval(() => {
      // ===== 타이머 감소 =====
      setEmailTimer(emailTimer - 1);

      // ===== 타이머 종료 처리 =====
      // 타이머가 1 이하가 되면 이메일 발송 상태 초기화
      if (emailTimer <= 1) {
        setIsEmailSent(false);
      }
    }, 1000); // 1초마다 실행
  }

  // ===== 클린업 함수 =====
  // 컴포넌트 언마운트 또는 의존성 변경 시 타이머 초기화
  return () => {
    if (timer) clearInterval(timer);
  };
}, [isEmailSent, emailTimer, setEmailTimer, setIsEmailSent]);
```

- 이메일 인증 타이머 관리 `useEffect`
- 인증 메일 발송 후 3분간 카운트다운 타이머를 실행
- 동작 방식
  - 이메일이 발송되고 타이머가 0보다 큰 경우에만 타이머 실행
  - 1초마다 타이머 값을 1씩 감소
  - 타이머가 1 이하가 되면 이메일 발송 상태 초기화
  - 컴포넌트 언마운트 시 타이머 정리
- 의존성 변경 시 이전 타이머 정리 후 새 타이머 시작

```tsx
const checkEmailAndSendVerification = async () => {
  // ===== 이메일 입력 확인 =====
  if (!signupData.email) {
    setIsError(true);
    setErrorMessage('이메일을 입력해주세요.');
    return;
  }

  try {
    // ===== 상태 초기화 =====
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    // ===== 이메일 중복 확인 =====
    // 비밀번호 찾기에서는 중복 확인을 스킵
    if (!config?.skipDuplicateCheck) {
      const duplicateResponse = await authService.checkEmailDuplicate(signupData.email);

      // ===== 중복 이메일 처리 =====
      // 중복된 이메일인 경우 에러 처리
      if (
        typeof duplicateResponse === 'object' &&
        duplicateResponse !== null &&
        'isDuplicate' in duplicateResponse &&
        duplicateResponse.isDuplicate
      ) {
        setIsError(true);
        setErrorMessage('이미 등록된 회원입니다.');
        return;
      }
    }

    // ===== 인증 메일 발송 =====
    // 설정에서 커스텀 함수를 사용하거나 기본 함수 사용
    const sendEmail = config?.sendVerificationEmail || authService.sendVerificationEmail;
    await sendEmail(signupData.email);

    // ===== 타이머 시작 =====
    // 3분(180초) 타이머 시작
    setEmailTimer(180);
    setIsEmailSent(true);
  } catch (error) {
    // ===== 에러 처리 =====
    setIsError(true);
    setErrorMessage(error instanceof Error ? error.message : '이메일 인증 과정에서 오류가 발생했습니다.');
  } finally {
    // ===== 로딩 상태 해제 =====
    setIsLoading(false);
  }
};
```

- 이메일 중복 확인 및 인증 메일 발송 함수
- 처리 과정
  - 이메일 입력 확인
  - 로딩 상태 설정 및 에러 초기화
  - 이메일 중복 확인(설정에 따라 스킵 가능)
  - 인증 메일 발송(6자리 코드 포함)
  - 타이머 시작
  - 에러 처리 및 상태 정리
- 에러 처리
  - 이메일 미입력 : “이메일을 입력해주세요.”
  - 중복 이메일 : “이미 등록된 회원입니다.”
  - API 오류 : 서버 에러 메시지 또는 기본 메시지
- 설정 옵션
  - skipDuplicateCheck: 중복 확인 스킵 (비밀번호 찾기 시)
  - sendVerificationEmail: 커스텀 인증 메일 발송 함수

```tsx
  checkEmailDuplicate: async (email: string) => {
    return fetchApi('/user/validation/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
  },
```

- 이메일 중복 확인

```tsx
  sendVerificationEmail: async (email: string) => {
    return fetchApi('/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
  },
```

- 이메일 인증 전송

```tsx
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
```

- 타이머 시간을 mm:ss 형식 변환하는 함수
- 변환 예시
  - 180초 → 3:00
  - 125초 → 2:05

```tsx
  return {
    isEmailVerified, // 이메일 인증 완료 여부
    isEmailSent, // 이메일 인증 메일 발송 상태
    emailTimer, // 이메일 인증 타이머
    formatTime, // 타이머 시간 포맷
    checkEmailAndSendVerification, // 이메일 중복 확인 및 인증 메일 발송
  };

   * - isEmailVerified: 이메일 인증 완료 여부 (boolean)
   * - isEmailSent: 인증 메일 발송 여부 (boolean)
   * - emailTimer: 남은 인증 시간 (number, 초 단위)
   * - formatTime: 타이머 시간 포맷팅 함수 (seconds: number) => string
   * - checkEmailAndSendVerification: 인증 메일 발송 함수 (async function)
```

- 반환값

```toc

```
