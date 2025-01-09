---
emoji: 🖍️
title: 'CSS Grid vs FlexBox 언제 사용해야 할까?'
date: '2025-01-09'
categories: Dev
---

## Why?

The Odin Project를 하면서 grid 와 flex에 대해서 나왔는데 개발을 하면서 display에 대한 배치를 정확하게 생각해 본 적은 없었지만, 과제를 하면서 grid 와 flex를 상황에 맞게 언제 사용해야 할지 의문점이 들어서 글을 남겨보려 한다.

[The Odin Project](https://www.theodinproject.com/lessons/node-path-intermediate-html-and-css-using-flexbox-and-grid)

## CSS Grid vs FlexBox

일단 grid와 flex에 차이점에 대해서 알아볼 필요가 있다.

#### 차이점

**Flex Box**
1차원 레이아웃용으로 설계된 Flexbox는 단일 축(가로 또는 세로)을 따라 항목을 정렬한다. 컨테이너 내의 공간을 분배하고 품목을 한 방향으로 정렬하는 데 이상적이다.

**CSS Grid**
2차원 레이아웃을 위한 CSS 그리드를 사용하면 열과 행을 동시에 제어할 수 있다. 따라서 두 축을 따라 정렬해야 하는 보다 복잡한 레이아웃에 적합하다.

#### 각각의 사용시기

**Flex Box**

- 항목을 한 방향(행 또는 열)으로 정렬할 때
- 더 간단한 구성 요소 수준 레이아웃.

**CSS Grid**

- 행과 열 모두에 대한 제어가 필요한 레이아웃.
- 복잡한 전체 페이지 디자인.
- 2차원에서 요소를 정확하게 배치해야 하는 시나리오.

## 결론

[출처](https://webdesign.tutsplus.com/flexbox-vs-css-grid-which-should-you-use--cms-30184a)
