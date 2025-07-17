---
emoji: 🙏
title: 'Zod 라이브러리에 대해서(+프로젝트 리팩토링 중..)👋'
date: '2025-07-01'
categories: Dev
---

# zod

HOBBi 프로젝트 리팩토링을 진행중 길어지는 유효성 검사 코드에 어떻게 하면 “가독성 좋게 코드를 구현할 수 있을까?” 생각중에 Zod라는 라이브러리를 사용 및 공부하기 위해 작성해보았습니다.

## **Zod란?**

**Zod**는 TypeScript를 위한 **스키마 선언 및 검증 라이브러리**입니다. 런타임에서 데이터의 타입과 구조를 검증하면서, 동시에 TypeScript 타입을 자동으로 추론해주는 강력한 도구입니다.

## **주요 특징**

1.  **TypeScript First**

```tsx
import { z } from 'zod';

// 스키마 정의
const UserSchema = z.object({
  name: z.string().min(2, '이름은 2글자 이상이어야 합니다'),
  email: z.string().email('유효한 이메일을 입력해주세요'),
  age: z.number().min(18, '18세 이상이어야 합니다'),
});

// TypeScript 타입 자동 추론
type User = z.infer<typeof UserSchema>;
// 결과: { name: string; email: string; age: number; }
```

1. **런타임 검증**

```tsx
// 데이터 검증
const userData = {
  name: 'John',
  email: 'john@example.com',
  age: 25,
};

const result = UserSchema.safeParse(userData);
if (result.success) {
  // 검증 성공 - result.data는 타입이 보장된 데이터
  console.log(result.data.name); // ✅ 타입 안전
} else {
  // 검증 실패 - result.error에 에러 정보
  console.log(result.error.errors);
}
```

## **기본 스키마 타입들**

- **Primitive Types (원시 타입)**
  ```tsx
  const schema = z.object({
    string: z.string(),
    number: z.number(),
    boolean: z.boolean(),
    date: z.date(),
    null: z.null(),
    undefined: z.undefined(),
  });
  ```
- **String 검증**
  ```tsx
  const emailSchema = z
    .string()
    .email('유효한 이메일을 입력해주세요')
    .min(5, '이메일은 5글자 이상이어야 합니다')
    .max(100, '이메일은 100글자를 초과할 수 없습니다');

  const passwordSchema = z
    .string()
    .min(8, '비밀번호는 8글자 이상이어야 합니다')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '영문 대소문자와 숫자를 포함해야 합니다');
  ```
- **Number 검증**
  ```tsx
  const ageSchema = z
    .number()
    .int('정수를 입력해주세요')
    .min(0, '나이는 0 이상이어야 합니다')
    .max(120, '나이는 120 이하여야 합니다');

  const priceSchema = z.number().positive('가격은 양수여야 합니다').multipleOf(100, '100원 단위로 입력해주세요');
  ```

## 고급 기능들

1. **조건부 검증**

```tsx
const UserSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'], // 에러 위치 지정
  });
```

1. **선택적 필드**

```tsx
const ProfileSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  bio: z.string().optional(), // 선택적 필드
  avatar: z.string().url().nullable(), // null 허용
});
```

1. **배열 검증**

```tsx
const TagsSchema = z.array(z.string()).min(1, '최소 1개의 태그가 필요합니다').max(5, '최대 5개의 태그만 가능합니다');

const NumbersSchema = z.array(z.number()).nonempty('배열이 비어있을 수 없습니다');
```

1. **Union Types**

```tsx
const StatusSchema = z.union([z.literal('pending'), z.literal('approved'), z.literal('rejected')]);

// 또는 더 간단하게
const StatusSchema = z.enum(['pending', 'approved', 'rejected']);
```

## **검증 방법들**

1. **parse() - 예외 발생**

```tsx
try {
  const user = UserSchema.parse(invalidData);
  // 성공 시 user는 타입이 보장된 데이터
} catch (error) {
  // 실패 시 ZodError 예외 발생
  console.log(error.errors);
}
```

1. **safeParse() - 안전한 검증**

```tsx
const result = UserSchema.safeParse(data);
if (result.success) {
  // result.data 사용
} else {
  // result.error.errors 사용
}
```

1. **parseAsync() - 비동기 검증**

```tsx
const AsyncSchema = z.object({
  email: z
    .string()
    .email()
    .refine(async (email) => {
      // 데이터베이스에서 이메일 중복 확인
      return !(await isEmailExists(email));
    }, '이미 사용 중인 이메일입니다'),
});

const result = await AsyncSchema.parseAsync(data);
```

## **Zod의 장점**

### **1. 타입 안전성**

- 런타임 검증과 컴파일 타임 타입 추론을 동시에 제공
- TypeScript와 완벽한 통합

### **2. 에러 처리**

- 상세하고 사용자 친화적인 에러 메시지
- 에러 위치와 컨텍스트 정보 제공

### **3. 확장성**

- 복잡한 검증 로직도 쉽게 구현
- 커스텀 검증 함수 지원

### **4. 성능**

- 가벼운 번들 크기
- 효율적인 검증 알고리즘

### **5. 개발자 경험**

- 직관적인 API
- 풍부한 문서화
- 활발한 커뮤니티

## **다른 라이브러리와의 비교**

| 기능            | Zod        | Yup      | Joi      | Ajv        |
| --------------- | ---------- | -------- | -------- | ---------- |
| TypeScript 지원 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐   | ⭐⭐     | ⭐⭐⭐     |
| 타입 추론       | ⭐⭐⭐⭐⭐ | ⭐⭐     | ⭐       | ⭐⭐       |
| 에러 메시지     | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐     |
| 성능            | ⭐⭐⭐⭐   | ⭐⭐⭐   | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 번들 크기       | ⭐⭐⭐⭐   | ⭐⭐⭐   | ⭐⭐     | ⭐⭐⭐⭐⭐ |

```toc

```
