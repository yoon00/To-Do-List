import { insertLast, getNode } from "./lib/dom.js";
import { getStorage, setStorage } from "./lib/storage.js";

// save시 Prettier가 작동하도록 설정되어 있으면 아마도 한 줄로 다 엮어버릴 거에요.
// 저는 그냥 Shift + Alt + F 눌렀을 때만 작동하도록 설정해뒀습니다.

// 탭 상태를 보기 위한 전역 flag
let tabFlag = false;

let inputToDoForm = getNode("#add-todo-form");
let inputToDoText = getNode("#add-todo-input");
let inputToDoBtn = getNode("#add-todo-btn");
let todoUl = getNode("#todo-list-ul");
let completeTabBtn = getNode("#select-complete-btn");
let incompleteTabBtn = getNode("#select-incomplete-btn");

// 윈도우가 로드 될 때 (시작될 때)
window.addEventListener("load", () => {
  init();
});

// 페이지가 로드되었을 때 실행
// localStorage에서 기존 todo 데이터를 불러와 목록 복원
function init() {
  let todoListArray = getStorage();
  todoListArray.forEach((element) => {
    element.date = new Date(element.date);
    if (tabFlag === element.completed) renderItem(element);
  });
}

// form submit 처리 방지
inputToDoForm.addEventListener("submit", (e) => {
  e.preventDefault();
});

// 제출 이벤트 처리
inputToDoBtn.addEventListener("click", () => {
  handleAdd();
});

// 키다운 이벤트 처리
inputToDoText.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    handleAdd();
  }
});

completeTabBtn.addEventListener("click", (e) => {
  if (!tabFlag) {
    moveToCompleteTab();
    completeTabBtn.classList.add("active-tab");
    incompleteTabBtn.classList.remove("active-tab");
  }
});

incompleteTabBtn.addEventListener("click", (e) => {
  if (tabFlag) {
    moveToInCompleteTab();
    incompleteTabBtn.classList.add("active-tab");
    completeTabBtn.classList.remove("active-tab");
  }
});

// 생성된 li는 document click 이벤트로 처리해야 함.
document.addEventListener("click", (e) => {
  let optionalBtn = e.target.closest(".todo-list-optional");
  let completeBtn = e.target.closest(".todo-list-complete-btn");

  if (optionalBtn) {
    const id = optionalBtn.closest("li")?.dataset.id;
    handleRemove(id);
  }

  if (completeBtn) {
    const id = completeBtn.closest("li")?.dataset.id;
    handleComplete(id);
  }
});

// 완료 탭으로 이동
function moveToCompleteTab() {
  tabFlag = true;
  renderTab();
}

// 미완료 탭으로 이동
// ImComplete -> InComplete로 변경
function moveToInCompleteTab() {
  tabFlag = false;
  renderTab();
}

// 추가된 함수 : 버튼과 keydown 이벤트를 한번에 관리하기 위한 컨트롤러
function handleAdd() {
  // validation
  if (inputToDoText.value.trim() === "") {
    return;
  }

  // id : 난수 id, value : 입력값(Contents), itemObj : 아이템 객체, updated : 새로운 아이템 객체가 추가된 Array
  let id = self.crypto.randomUUID();
  let value = inputToDoText.value;
  let itemObj = createItemObject(id, value);
  let todoListArray = getStorage();
  let updated = addItemArray(todoListArray, itemObj);

  setStorage(updated);
  renderItem(itemObj);
  inputToDoText.value = "";
}

// <ul> 안에서 항목을 클릭하면 실행됨
// 해당 항목을 제거하고, 배열에서도 삭제하며, localStorage 업데이트
function handleRemove(id) {
  let updated = removeItemArray(id);
  removeItem(id);
  setStorage(updated);
}

function handleComplete(id) {
  let updated = getCompleteTodoListArray(id);
  setStorage(updated);
  // removeItem 재사용
  removeItem(id);
}

// 새로운 할 일을 todoListArray에 객체 형태로 추가
function addItemArray(todoListArray, itemObj) {
  let updated = todoListArray.concat(itemObj);
  return updated;
}

// 추가된 함수 : 아이템 객체를 반환함.
function createItemObject(id, value) {
  return {
    id,
    contents: value,
    date: new Date(Date.now()),
    completed: false,
  };
}

// 추가된 함수 : Date에서 월, 일 format으로 출력
function dateFormat(date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

// 추가된 함수 : 현재 시각과 targetDate와의 차이 비교해서 return
function getDateDiff(targetDate) {
  const now = new Date(); // 현재 시각
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const target = new Date(targetDate);
  const targetDateOnly = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  const diffTime = targetDateOnly - today;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 1) return 0
  else if (diffDays <= 3) return 1
  else if (diffDays > 3) return 2

  // 음수일 경우
  return "";
}

// 추가된 함수 : 해당 아이템 완료된 함수를 리턴하는 함수
function getCompleteTodoListArray(id) {
  let todoListArray = getStorage();
  let updated = todoListArray.map((el) =>
    el.id === id ? { ...el, completed: !el.completed } : el
  );
  return updated;
}

// `createItem`을 사용해 생성된 `<li>`를 `target` 요소의 맨 뒤에 추가함 (ul 목록 안에 li가 삽입되는 구조)
function renderItem(itemObj) {
  const createdLi = createItem(itemObj);
  insertLast(todoUl, createdLi);
}

// 할 일 항목을 문자열로 생성
// 항목이 늘어나 파라미터를 객체로 변경.
function createItem(itemObj) {
  // 작업 완료 상태, font-color class 정의
  const svgIcons = 
  {
    true: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_35_85)">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18 9L16.59 7.58Z" fill="#9CE3A5"/>
        </g>
        <defs>
        <clipPath id="clip0_35_85">
        <rect width="24" height="24" fill="white"/>
        </clipPath>
        </defs>
        </svg>`,
    false: `<svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clip-path="url(#clip0_35_88)">
          <path
            d="M12 2C6.47 2 2 6.47 2 12C2 17.53 6.47 22 12 22C17.53 22 22 17.53 22 12C22 6.47 17.53 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z"
            fill="#A4A4A4"
          />
        </g>
        <defs>
          <clipPath id="clip0_35_88">
            <rect width="24" height="24" fill="white" />
          </clipPath>
        </defs>
      </svg>
    `
  };

  const fontColorClasses = ['date-normal',
    'date-warm',
    'date-danger'
  ]

  let DateDiffClass = tabFlag ? "" : fontColorClasses[getDateDiff(itemObj.date)];

  /* html */
  // closet(selector) 가장 근처에 있는 부모 요소를 가져온다.
  return `
    <li class="todo-list-cell" data-id='${itemObj.id}'>
            <div class="align-wrap">
              <button class="todo-list-complete-btn" >
              ${svgIcons[String(itemObj.completed)]}
              </button>
              <div class="todo-list-text">${itemObj.contents}</div>
            </div>
            <div class="align-wrap">
            <div class="todo-list-date ${DateDiffClass}">${dateFormat(itemObj.date)}</div>
            <button type="button" class="todo-list-optional">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 9V11H15V9H5ZM10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.59 18 2 14.41 2 10C2 5.59 5.59 2 10 2C14.41 2 18 5.59 18 10C18 14.41 14.41 18 10 18Z"
                  fill="#FF6969"
                />
              </svg>
            </button>
            </div>
          </li>
    `;
}

// 해당 data-id를 가진 <li> 요소를 찾아 DOM에서 제거
function removeItem(id) {
  // 지금 전체에 li 1개당 1개 요소씩
  let todoNodeList = Array.from(todoUl.children);
  todoNodeList.forEach((todoNodeLi) => {
    if (todoNodeLi.dataset.id === id) {
      todoNodeLi.remove();
    }
  });
}

// 배열에서 해당 id와 일치하는 항목을 제거 (filter 사용)
function removeItemArray(id) {
  let todoListArray = getStorage();
  let updated = todoListArray.filter((el) => id !== el.id);
  return updated;
}

// 추가된 함수 : 탭이 변경되었을 때 호출됨.
function renderTab() {
  todoUl.innerHTML = "";
  init();
}
