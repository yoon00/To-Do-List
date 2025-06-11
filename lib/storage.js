// localStorage 관련 유틸리티 관리하는 js파일입니다


const WEED_LOCALSTORAGE_KEY = "WEED_LOCALSTORAGE_KEY"

// 각 요소의 객체가 들어간 Array를 반환합니다.
// undefined, null 일 경우에는 빈 배열을 반환
export function getStorage(){
    return JSON.parse(localStorage.getItem(WEED_LOCALSTORAGE_KEY)) || [];
}

// LocalStorage에 직렬화된 값을 저장합니다.
export function setStorage(dataArr){
    localStorage.setItem(WEED_LOCALSTORAGE_KEY, JSON.stringify(dataArr));
}