---
emoji: 🙋🏻
title: 'DTO 필드 변수의 prefix 이슈'
date: '2025-06-09'
categories: Trouble-Shooting
---

백엔드에서 DTO 만들어서 프론트에서 api 연동시 Response 값이 다르게 와서 문제가 발생한 상황입니다

## 문제점

중복을 확인하는 검증에서 Dto 클래스 필드의 변수를 isDuplicate로 지정을 했었다.

그 후 프론트에서의 API 연동에서 isDuplicate가 아니라 duplicate로 표시가 되었다.

```java
@Getter
@AllArgsConstructor
public class DuplicateCheckResponse {
    private boolean isDuplicate;
}
```

기대되는 값은

```json
{
  "isDuplicate": false
}
```

이지만 표시되는 값은 `"duplicate": false` 였다.

## 원인 분석

원인은 lombok의 getter와 json을 직렬화 & 역직렬화하는 jackson 라이브러리에 있었다.

lombok 라이브러리의 공식 문서를 살펴보면,

You can annotate any field with @Getter and/or @Setter, to let lombok generate the default getter/setter automatically.

A default getter simply returns the field, and is named getFoo if the field is called foo(or isFoo if the field's type is boolean).이라고 되어있다. 

해석하면 lombok은 `getFoo()`와 같이 prefix로 get를 사용하는데, `boolean` 자료형의 getter는 `isFoo()`처럼 prefix로 is를 사용한다고 되어있다.

한편, jackson 라이브러리는 json 객체의 직렬화 과정에서 getter와 setter를 이용한다.

`getFoo()`의 경우 get을 지우고, `setFoo()`의 경우에는 set을 지우는 것이다. 공식문서에는 이렇게 나와있다.

By default Jackson maps the fields of a JSON object to fields in a Java object by matching the names of the JSON field to the getter and setter methods in the Java object. Jackson removes the "get" and "set" part of the names of the getter and setter methods, and converts the first character of the remaining name to lowercase.

해석하면 기본적으로 Jackson은 JSON 객체의 필드를 Java 객체의 필드에 매핑하고. JSON 필드의 이름을 Java 객체의 getter 및 setter 메서드와 일치시킨다. 그리고 Jackson은 getter 및 setter 메서드 이름에서 "get"과 "set" 부분을 제거하고, 나머지 이름의 첫 글자를 소문자로 변환한다.

따라서 lombok에 의해 `isDuplicate`는 `getIsDuplicate`가 아니라 `isDuplicate`로 만들어졌기 때문에 jackson 라이브러리가 prefix인 is를 지워서 `duplicate`가 표시된 것이다.

## 해결 시도

이를 해결하기 위해 primitive 타입인 boolean 대신 wrapper 클래스인 Boolean을 사용했다.

```java
@Getter
@AllArgsConstructor
public class DuplicateCheckResponse {
    private Boolean isDuplicate;
}
```

다만 Boolean은 클래스이기 때문에 null 값이 들어갈 수 있어 NPE가 발생할 가능성이 있다. 또한 boolean에 비해 메모리를 더 차지한다는 단점이 있다.

그렇지만 코드 상에서 null 값이 될 수 있는 상황은 없다.

## 결과

다른 해결방안으로는 boolean 타입의 변수명을 is~로 짓지 않는 것이다.

`isDelete`→ `deleted`

`isDuplicate`→ `duplicated`

```toc

```
