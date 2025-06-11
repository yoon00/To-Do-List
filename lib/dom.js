// dom 관련 유틸리티 관리하는 js파일입니다


// 무슨 기능을 더 구현해야 하는지 잘 모르겠네요 ㅎㅁㅎ;
export function getNode(separator){
    return document.querySelector(separator);
}

// parent : 추가하고 싶은 노드 요소, htmlString : 추가할 요소
export function insertLast(parent, htmlString){
    parent.insertAdjacentHTML("beforeend", htmlString);
}