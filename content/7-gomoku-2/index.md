---
emoji: ⚫️
title: '고스트바둑왕(오목왕) 만들기#2'
date: '2025-01-12'
categories: Project
---

## 1. 바둑판 화점 찍기

```javascript
// 화점 위치 (오목판에서 별 모양의 점 위치)
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

// 오목판 생성 함수: 시각적인 바둑판을 생성
function createCheckerboard() {
  for (let i = 0; i < 18; i++) {
    // 18행(테두리를 포함한 크기)을 생성
    const tr = document.createElement('tr'); // 새로운 행(tr) 생성
    table.appendChild(tr); // 테이블에 행 추가

    for (let j = 0; j < 18; j++) {
      // 각 행에 대해 18개의 셀(td) 생성
      const td = document.createElement('td'); // 셀(td) 생성
      td.setAttribute('class', 'square'); // CSS 스타일을 위한 클래스 지정

      // 화점 위치에 별 모양의 점 추가
      if (starPoints.some(([x, y]) => x === i && y === j)) {
        const point = document.createElement('div');
        point.setAttribute('class', 'star-point'); // 화점 스타일 지정
        td.appendChild(point);
      }

      tr.appendChild(td); // 생성된 셀을 현재 행에 추가
    }
  }
}
```

```css
.star-point {
  position: absolute;
  top: -3px;
  left: -3px;
  width: 6px;
  height: 6px;
  background-color: black;
  border-radius: 50%;
}
```

![](01.png)

생각해보니 바둑판을 그릴 때 바둑판의 화점을 생각못해서 화점을 찍는 JavaScript, CSS 구현

## 2. 3-3, 4-4 규칙 구현

```javascript
// 바둑돌 배치 함수: 사용자가 돌을 놓을 때 호출
function handleStonePlacement(e) {
  const target = e.target; // 클릭된 요소 가져오기
  if (target.tagName !== 'TD') return; // 클릭된 요소가 셀이 아닐 경우 무시

  const [row, col] = target.id.split('-').map(Number); // 클릭된 셀의 행(row)과 열(col) 추출

  // 이미 돌이 놓인 경우 경고 메시지 표시 후 중단
  if (boardState[row][col] !== null) {
    alert('이미 돌이 놓인 자리입니다!');
    return;
  }

  // 3-3 또는 4-4 규칙 위반 확인 (흑돌인 경우만 적용)
  if (currentPlayer === 'black' && isForbiddenMove(row, col)) {
    alert('이 동작은 3-3 또는 4-4 규칙을 위반합니다. 다른 위치를 선택하세요.');
    return;
  }

  // 돌을 놓고 논리 상태 업데이트
  boardState[row][col] = currentPlayer; // 현재 플레이어의 돌 배치
  target.classList.add(`${currentPlayer}-stone`); // 시각적으로 돌 표시

  // 승리 조건 확인
  if (checkWin(row, col, currentPlayer)) {
    setTimeout(() => {
      alert(`${currentPlayer === 'black' ? '흑' : '백'}이 승리했습니다!`);
      initializeBoard(); // 승리 후 보드 초기화
    }, 100);
    return;
  }

  // 다음 플레이어로 전환
  currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
}

// 금지된 동작(3-3 또는 4-4) 확인 함수
function isForbiddenMove(row, col) {
  boardState[row][col] = 'black'; // 임시로 돌 배치
  const isThreeThree = checkDoubleThree(row, col); // 3-3 규칙 위반 확인
  const isFourFour = checkDoubleFour(row, col); // 4-4 규칙 위반 확인
  boardState[row][col] = null; // 임시 배치된 돌 제거
  return isThreeThree || isFourFour; // 둘 중 하나라도 위반 시 true 반환
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

#### 3-3 일 때

![](02.png)

#### 4-4 일 때

![](03.png)

## 3. 전체코드

```javascript
// DOM 요소
const table = document.getElementById('table'); // 시각적인 오목판을 나타내는 HTML 요소
const go = document.getElementById('go'); // 바둑돌이 놓이는 위치를 표시할 HTML 요소

// 게임 상태
let currentPlayer = 'black'; // 현재 플레이어 ('black' 또는 'white')를 저장
let boardState; // 17x17 크기의 배열로 게임 보드의 상태를 저장 (null, 'black', 'white')

// 화점 위치 (오목판에서 별 모양의 점 위치)
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

// 게임 초기화 함수: 보드를 초기화하고 이벤트 리스너를 설정
initializeBoard();

// 오목판 생성 함수: 시각적인 바둑판을 생성
function createCheckerboard() {
  for (let i = 0; i < 18; i++) {
    // 18행(테두리를 포함한 크기)을 생성
    const tr = document.createElement('tr'); // 새로운 행(tr) 생성
    table.appendChild(tr); // 테이블에 행 추가

    for (let j = 0; j < 18; j++) {
      // 각 행에 대해 18개의 셀(td) 생성
      const td = document.createElement('td'); // 셀(td) 생성
      td.setAttribute('class', 'square'); // CSS 스타일을 위한 클래스 지정

      // 화점 위치에 별 모양의 점 추가
      if (starPoints.some(([x, y]) => x === i && y === j)) {
        const point = document.createElement('div');
        point.setAttribute('class', 'star-point'); // 화점 스타일 지정
        td.appendChild(point);
      }

      tr.appendChild(td); // 생성된 셀을 현재 행에 추가
    }
  }
}

// 바둑돌이 놓일 판 생성 함수: 논리적인 바둑판을 생성
function createPlacementBoard() {
  for (let i = 0; i < 17; i++) {
    // 17행(실제 게임 영역)을 생성
    const tr = document.createElement('tr'); // 새로운 행 생성
    go.appendChild(tr); // 바둑돌 배치판에 행 추가

    for (let j = 0; j < 17; j++) {
      // 각 행에 대해 17개의 셀(td) 생성
      const td = document.createElement('td'); // 셀 생성
      td.setAttribute('id', `${i}-${j}`); // 셀 ID를 "행-열" 형식으로 지정
      tr.appendChild(td); // 생성된 셀을 현재 행에 추가
    }
  }
}

// 보드 초기화 함수: 보드와 게임 상태를 초기화
function initializeBoard() {
  table.innerHTML = ''; // 기존 테이블 내용 삭제
  go.innerHTML = ''; // 기존 바둑돌 배치판 내용 삭제

  createCheckerboard(); // 시각적인 오목판 생성
  createPlacementBoard(); // 논리적인 바둑판 생성

  resetBoardState(); // 게임 상태 초기화
  addEventListeners(); // 클릭 이벤트 리스너 추가
}

// 게임 상태 초기화 함수
function resetBoardState() {
  // 17x17 배열 생성, 모든 셀을 null로 초기화 (돌이 놓이지 않음)
  boardState = Array(17)
    .fill(null)
    .map(() => Array(17).fill(null));

  // 바둑돌 배치판의 모든 시각적 요소 초기화
  const cells = go.querySelectorAll('td');
  cells.forEach((cell) => {
    cell.className = ''; // CSS 클래스 제거
    cell.style.backgroundColor = ''; // 인라인 스타일 초기화
  });

  currentPlayer = 'black'; // 현재 플레이어를 흑돌로 초기화
}

// 이벤트 리스너 추가 함수: 바둑돌 배치판에 클릭 이벤트 추가
function addEventListeners() {
  go.addEventListener('click', handleStonePlacement); // 클릭 시 handleStonePlacement 실행
}

// 바둑돌 배치 함수: 사용자가 돌을 놓을 때 호출
function handleStonePlacement(e) {
  const target = e.target; // 클릭된 요소 가져오기
  if (target.tagName !== 'TD') return; // 클릭된 요소가 셀이 아닐 경우 무시

  const [row, col] = target.id.split('-').map(Number); // 클릭된 셀의 행(row)과 열(col) 추출

  // 이미 돌이 놓인 경우 경고 메시지 표시 후 중단
  if (boardState[row][col] !== null) {
    alert('이미 돌이 놓인 자리입니다!');
    return;
  }

  // 3-3 또는 4-4 규칙 위반 확인 (흑돌인 경우만 적용)
  if (currentPlayer === 'black' && isForbiddenMove(row, col)) {
    alert('이 동작은 3-3 또는 4-4 규칙을 위반합니다. 다른 위치를 선택하세요.');
    return;
  }

  // 돌을 놓고 논리 상태 업데이트
  boardState[row][col] = currentPlayer; // 현재 플레이어의 돌 배치
  target.classList.add(`${currentPlayer}-stone`); // 시각적으로 돌 표시

  // 승리 조건 확인
  if (checkWin(row, col, currentPlayer)) {
    setTimeout(() => {
      alert(`${currentPlayer === 'black' ? '흑' : '백'}이 승리했습니다!`);
      initializeBoard(); // 승리 후 보드 초기화
    }, 100);
    return;
  }

  // 다음 플레이어로 전환
  currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
}

// 금지된 동작(3-3 또는 4-4) 확인 함수
function isForbiddenMove(row, col) {
  boardState[row][col] = 'black'; // 임시로 돌 배치
  const isThreeThree = checkDoubleThree(row, col); // 3-3 규칙 위반 확인
  const isFourFour = checkDoubleFour(row, col); // 4-4 규칙 위반 확인
  boardState[row][col] = null; // 임시 배치된 돌 제거
  return isThreeThree || isFourFour; // 둘 중 하나라도 위반 시 true 반환
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

// 승리 조건 확인 함수
function checkWin(row, col, player) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (const [dx, dy] of directions) {
    let count = 1;
    count += countStones(row, col, dx, dy, player); // 앞쪽 방향 돌 개수
    count += countStones(row, col, -dx, -dy, player); // 뒤쪽 방향 돌 개수

    if (count >= 5) return true; // 5개 이상의 돌이 연속되면 승리
  }

  return false; // 승리 조건 미충족
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

  return count; // 해당 방향으로 연속된 돌 개수 반환
}
```

## 다음에 해야 할 것

- ~~흑돌일 때 33 규칙 넣기~~
- ~~버그 찾아서 고치기~~
- 리팩토링하기
- (흑돌, 백돌 각각의) 스탑워치 놓기
- WebRCT 이용해서 실시간으로 채팅이나, 게임방 만들기

[출처](https://yermi.tistory.com/entry/Toy-Project-%EC%9D%B4%EB%B2%88%EC%97%90%EB%8A%94-%EC%9B%B9-%ED%8E%98%EC%9D%B4%EC%A7%80-%EC%98%A4%EB%AA%A9%EC%9D%B4%EB%8B%A42%F0%9F%8E%B2-JavaScript%EB%A1%9C-%EC%98%A4%EB%AA%A9-%EB%A1%9C%EC%A7%81-%EA%B5%AC%ED%98%84%ED%95%98%EA%B8%B0)

```toc

```
