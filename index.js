import { getNode, insertLast } from "./lib/dom.js";
import { getStorage, setStorage } from "./lib/storage.js";

const inputForm = getNode("#add-todo-form");
const input = getNode("#add-todo-input");
const todoList = getNode("#todo-list-ul");
const completeTab = getNode("#select-complete-btn");
const incompleteTab = getNode("#select-incomplete-btn");
//const addButton = getNode("#add-todo-btn")

// 탭 상태
let currentTab = false;

// "_월 _일" 변환 함수
// date 문자열이 아닌 date 객체 - new Date()를 써야 객체가 됨, Date() 시 date 문자열
function formatDate(dateObj) {
  const month = dateObj.getMonth() + 1;
  const date = dateObj.getDate();
  return `${month}월 ${date}일`;
}

// 할 일 문자열 생성
function createItem({ content, id, date, complete }) {
    // 미완료 svg
  const uncheckedSvg = 
        `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_35_88)">
        <path d="M12 2C6.47 2 2 6.47 2 12C2 17.53 6.47 22 12 22C17.53 22 22 17.53 22 12C22 6.47 17.53 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z"fill="#A4A4A4"/>
        </g>
        <defs>
        <clipPath id="clip0_35_88">
        <rect width="24" height="24" fill="white" />
        </clipPath>
        </defs>
        </svg>`;

    // 완료 svg
  const checkedSvg =     
        `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_35_85)">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18 9L16.59 7.58Z" fill="#9CE3A5"/>
        </g>
        <defs>
        <clipPath id="clip0_35_85">
        <rect width="24" height="24" fill="white"/>
        </clipPath>
        </defs>
        </svg>`;

  return `
    <li class="todo-list-cell" data-id="${id}">
      <div class="align-wrap">
        <button class="todo-list-complete-btn" type="button">
          ${complete ? checkedSvg : uncheckedSvg}
        </button>
        <div class="todo-list-text">${content}</div>
      </div>
      <div class="align-wrap">
        <div class="todo-list-date">${formatDate(new Date(date))}</div>
        <button type="button" class="todo-list-optional">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 9V11H15V9H5ZM10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.59 18 2 14.41 2 10C2 5.59 5.59 2 10 2C14.41 2 18 5.59 18 10C18 14.41 14.41 18 10 18Z" fill="#FF6969"/>
          </svg>
        </button>
      </div>
    </li>
  `;
}

// 할 일 렌더링
function renderItem(target, item) {
  insertLast(target, createItem(item));
}

// 할 일 삭제
function removeItem(id) {
  const ri = todoList.querySelector(`li[data-id="${id}"]`);
  if (ri) ri.remove();
}

// 배열에 할 일 추가
function addItemArray(item) {
  let todoListArray = getStorage();
  todoListArray.push(item);
  setStorage(todoListArray);
}

// 배열에 할 일 삭제
function removeItemArray(id) {
  let todoListArray = getStorage();
  todoListArray = todoListArray.filter(item => item.id !== id);
  setStorage(todoListArray);
}

// 할 일 추가 이벤트
// Form에서 submit event 발생하면 동작(enter, +버튼)
inputForm.addEventListener("submit", e => {
  // reload 방지
  e.preventDefault();
  handleTodoList();
});

// addButton.addEventListener("click", e => {
//   handleTodoList();
// });

// 할 일 추가 함수
function handleTodoList(){
  //공백 입력 금지
  const val = input.value.trim();
  if (val === '') return;

  const newItem = {
    id: self.crypto.randomUUID(),
    content: val,
    date: new Date(),
    complete: false
  };

  addItemArray(newItem); 

  // 할 일 추가 시 미완료 된 탭일 때만 렌더링
  if (currentTab === false) {
    renderItem(todoList, newItem); 
  } 
  input.value = '';
}

// 할 일 클릭 이벤트
// 동적으로 생성된 요소들 이벤트 위임(todoList 자체가 동적으로 생성될 시 document에 이벤트)
todoList.addEventListener("click", e => {
  const id = e.target.closest("li.todo-list-cell").dataset.id;
  
  // 할 일 완료 이벤트
  if (e.target.closest(".todo-list-complete-btn")) {
    handleComplete(id);
    //완료 이벤트 후 리턴으로 삭제 이벤트 차단
    return;
  }

  // 할 일 제거 이벤트
  if (e.target.closest(".todo-list-optional")) {
    handleRemove(id);
  }
});

// 할 일 완료 함수
function handleComplete(id){
  let todoListArray = getStorage();
  
  // 배열이 아니므로 find 사용
  const item = todoListArray.find(item => item.id === id);
  item.complete = !item.complete;
  
  setStorage(todoListArray);
  renderTab();
}

// 할 일 삭제 함수
function handleRemove(id){
  removeItemArray(id);
  removeItem(id);
}

// 탭에 따라 완료 상태 필터링 후 렌더링
function renderTab() {
  // 원래 있던 항목들 비어줌
  todoList.innerHTML = "";
  init();
}

// 미완료 탭 이벤트
incompleteTab.addEventListener("click", () => {
    moveToIncompleteTab();
    incompleteTab.classList.add("active-tab");
    completeTab.classList.remove("active-tab");
});

// 미완료 탭 함수
function moveToIncompleteTab(){
  currentTab = false;
  renderTab();
}

// 완료 탭 이벤트
completeTab.addEventListener("click", () => {
    moveToCompleteTab();
    completeTab.classList.add("active-tab");
    incompleteTab.classList.remove("active-tab");
});

// 완료 탭 함수
function moveToCompleteTab(){
  currentTab = true;
  renderTab();
}

// 초기화 함수
function init() {
  let todoListArray = getStorage();

// 미완료/완료 필터링
const filteredListArray = todoListArray.filter(item => currentTab ? item.complete : !item.complete);

// 필터링 된 할 일 렌더링
filteredListArray.forEach(item => {
  renderItem(todoList, item);
});
}

//초기화
init();