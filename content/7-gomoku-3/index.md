---
emoji: ⚫️
title: '고스트바둑왕(오목왕) 만들기#3'
date: '2025-01-13'
categories: Project
---

## 리팩토링이란?

> "결과의 변경 없이 코드의 구조를 재조정함"이란 뜻

## 1. 리팩토링

JavaScript 전체코드가 너무 길어져서 가독성을 높히기위해 파일을 나누고 리팩토링이란걸 해보겠습니다.

파일을 나누려고 합니다.

1. 메인이 되는 (main.js)
2. 화면을 보여주는 (view.js)
3. 게임의 로직이 있는 (gameLogic.js)
4. 이벤트가 발생하는 (eventHandlers.js)
5. 게임 룰 및 규칙 있는 (rules.js)

이렇게 다섯가지로 나눠볼려고한다.

## 2. main.js

```javascript
// main.js
import { resetBoardState } from './gameLogic.js';
import { createCheckerboard, createPlacementBoard } from './view.js';
import { addEventListeners } from './eventHandlers.js';

const table = document.getElementById('table'); // 시각적인 오목판
const go = document.getElementById('go'); // 바둑돌이 놓일 위치를 표시하는 판

// 화점 위치
const starPoints = [
  [3, 3],
  [3, 9],
  [3, 15],
  [9, 3],
  [9, 9],
  [9, 15],
  [15, 3],
  [15, 9],
  [15, 15],
];

// 게임 초기화
initializeGame();

// 게임 초기화
function initializeGame() {
  table.innerHTML = '';
  go.innerHTML = '';
  resetBoardState();
  createCheckerboard(table, starPoints);
  createPlacementBoard(go);
  addEventListeners(go);
}
```

## 3. view.js

```javascript
// 오목판 생성 함수
export function createCheckerboard(table, starPoints) {
  table.innerHTML = '';
  for (let i = 0; i < 18; i++) {
    const tr = document.createElement('tr');
    for (let j = 0; j < 18; j++) {
      const td = document.createElement('td');
      td.setAttribute('class', 'square');

      // 화점 위치에 점 추가
      if (starPoints.some(([x, y]) => x === i && y === j)) {
        const point = document.createElement('div');
        point.setAttribute('class', 'star-point');
        td.appendChild(point);
      }

      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
}

// 돌이 놓일 판 생성 함수
export function createPlacementBoard(go) {
  go.innerHTML = '';
  for (let i = 0; i < 17; i++) {
    const tr = document.createElement('tr');
    for (let j = 0; j < 17; j++) {
      const td = document.createElement('td');
      td.setAttribute('id', `${i}-${j}`);
      tr.appendChild(td);
    }
    go.appendChild(tr);
  }
}
```

## 4. gameLogic.js

```javascript
// 게임 상태 변수
let boardState; // 17x17 바둑판 상태
let currentPlayer = 'black'; // 현재 플레이어 (흑돌부터 시작)

// 게임 상태 초기화 함수
export function resetBoardState() {
  // 17x17 배열 생성, 모든 셀을 null로 초기화 (돌이 놓이지 않음)
  boardState = Array(17)
    .fill(null)
    .map(() => Array(17).fill(null));

  // 바둑돌 배치판의 모든 시각적 요소 초기화
  const cells = go.querySelectorAll('td');
  cells.forEach((cell) => {
    cell.className = '';
    cell.style.backgroundColor = '';
  });

  currentPlayer = 'black'; // 현재 플레이어를 흑돌로 초기화
}

// 다음 플레이어로 전환 함수
export function switchPlayer() {
  currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
}

// 승리 조건 확인 함수
export function checkWin(row, col, player) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1], // 가로, 세로, 대각선 ↘, 대각선 ↙
  ];

  for (const [dx, dy] of directions) {
    let count = 1;
    count += countStones(row, col, dx, dy, player);
    count += countStones(row, col, -dx, -dy, player);

    if (count >= 5) return true; // 5개 이상의 돌이 연속되면 승리
  }

  return false;
}

// 특정 방향으로 연속된 돌 개수 계산 함수
function countStones(row, col, dx, dy, player) {
  let count = 0;
  let x = row + dx;
  let y = col + dy;

  while (x >= 0 && x < 17 && y >= 0 && y < 17 && boardState[x][y] === player) {
    count++;
    x += dx;
    y += dy;
  }

  return count;
}

export { boardState, currentPlayer };
```

## 5. eventHandlers.js

```javascript
import { boardState, switchPlayer, checkWin, resetBoardState, currentPlayer } from './gameLogic.js';

import { isForbiddenMove } from './rules.js';

export function handleStonePlacement(e) {
  const target = e.target;
  if (target.tagName !== 'TD') return;

  const [row, col] = target.id.split('-').map(Number);

  if (boardState[row][col] !== null) {
    alert('이미 돌이 놓인 자리입니다!');
    return;
  }

  // 3-3 또는 4-4 규칙 위반 확인 (흑돌인 경우만 적용)
  if (currentPlayer === 'black' && isForbiddenMove(row, col)) {
    alert('이 동작은 3-3 또는 4-4 규칙을 위반합니다. 다른 위치를 선택하세요.');
    return;
  }

  boardState[row][col] = currentPlayer;
  target.classList.add(`${currentPlayer}-stone`);

  // 승리 조건 확인
  if (checkWin(row, col, currentPlayer)) {
    setTimeout(() => {
      alert(`${currentPlayer === 'black' ? '흑' : '백'}이 승리했습니다!`);
      resetBoardState();
    }, 100);
    return;
  }
  switchPlayer();
}

export function addEventListeners(go) {
  go.addEventListener('click', (e) => handleStonePlacement(e));
}
```

## 6. rules.js

```javascript
import { boardState } from './gameLogic.js';

// 3-3,4-4 규칙 위반 확인 함수
export function isForbiddenMove(row, col) {
  boardState[row][col] = 'black';
  const isThreeThree = checkDoubleThree(row, col);
  const isFourFour = checkDoubleFour(row, col);
  boardState[row][col] = null;
  return isThreeThree || isFourFour;
}

// 3-3 규칙 확인 함수
function checkDoubleThree(row, col) {
  let threeDirections = []; // 열린 삼(Open Three)의 방향 저장
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1], // 가로, 세로, 대각선 ↘, 대각선 ↙
  ];

  for (const [dx, dy] of directions) {
    if (isOpenThree(row, col, dx, dy)) {
      threeDirections.push([dx, dy]); // 열린 삼 발견 시 방향 추가
    }
    if (threeDirections.length >= 2) return true; // 두 방향 이상 발견 시 3-3 규칙 위반
  }

  return false; // 3-3 규칙 위반 아님
}

// 열린 삼(Open Three) 확인 함수
function isOpenThree(row, col, dx, dy) {
  let count = 1; // 현재 돌 포함 돌 개수
  let openEnds = 0; // 열린 끝부분 개수

  // 앞쪽 방향 탐색
  let x = row + dx;
  let y = col + dy;
  while (x >= 0 && x < 17 && y >= 0 && y < 17 && boardState[x][y] === 'black') {
    count++;
    x += dx;
    y += dy;
  }
  if (x >= 0 && x < 17 && y >= 0 && y < 17 && boardState[x][y] === null) {
    openEnds++; // 열린 끝 발견 시 증가
  }

  // 뒤쪽 방향 탐색
  x = row - dx;
  y = col - dy;
  while (x >= 0 && x < 17 && y >= 0 && y < 17 && boardState[x][y] === 'black') {
    count++;
    x -= dx;
    y -= dy;
  }
  if (x >= 0 && x < 17 && y >= 0 && y < 17 && boardState[x][y] === null) {
    openEnds++; // 열린 끝 발견 시 증가
  }

  // 정확히 3개의 돌이 있고 양쪽 끝이 열려 있는지 확인
  return count === 3 && openEnds === 2;
}

// 4-4 규칙 확인 함수
function checkDoubleFour(row, col) {
  let fourCount = 0; // 정확한 사(4)의 개수
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (const [dx, dy] of directions) {
    if (isExactFour(row, col, dx, dy)) {
      fourCount++;
    }
    if (fourCount >= 2) return true; // 두 방향 이상 발견 시 4-4 규칙 위반
  }

  return false; // 4-4 규칙 위반 아님
}

// 정확한 사(4) 확인 함수
function isExactFour(row, col, dx, dy) {
  let count = 1; // 현재 돌 포함 돌 개수

  // 앞쪽 방향 탐색
  let x = row + dx;
  let y = col + dy;
  while (x >= 0 && x < 17 && y >= 0 && y < 17 && boardState[x][y] === 'black') {
    count++;
    x += dx;
    y += dy;
  }

  // 뒤쪽 방향 탐색
  x = row - dx;
  y = col - dy;
  while (x >= 0 && x < 17 && y >= 0 && y < 17 && boardState[x][y] === 'black') {
    count++;
    x -= dx;
    y -= dy;
  }

  return count === 4; // 정확히 4개의 돌이 있는지 반환
}
```

## 다음에 해야 할 것

- ~~흑돌일 때 33 규칙 넣기~~
- ~~버그 찾아서 고치기~~
- ~~리팩토링하기~~
- (흑돌, 백돌 각각의)스탑워치 놓기
- WebRCT 이용해서 실시간으로 채팅이나, 게임방 만들기

```toc

```
