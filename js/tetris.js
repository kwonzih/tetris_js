//BLOCKS 변수 이용가능
import BLOCKS from "./blocks.js"

//DOM
const playground = document.querySelector(".playground > ul");
const gameText = document.querySelector(".game_text");
const scoreDisplay = document.querySelector(".score");
const restartButton = document.querySelector(".game_text > button");
const speedUpButton = document.querySelector(".duration_updown > .up");
const speedDownButton = document.querySelector(".duration_updown > .down");

//SETTING
const GAME_ROWS = 20;
const GAME_COLS = 10;


//variables
let score = 0; //점수 
let duration = 500; //떨어지는 속도
let downInterval; //다음 아이템 나오는 속도
let tempMovingItem; //아이템을 잠깐 담아두는 곳


const movingItem = {
    type:"",
    direction: 3, //아이템 방향 지표
    top: 0 , // DOM 좌표 기준 
    left: 0, // 중앙에서 떨어지도록
}
init()

/**functions ****************************************************/ 

//GAME 시작
function init(){
    
    // console.log(blockArray[randomIndex][0])
    // console.log(blockArray)
    // blockArray.forEach(block => {
    //     //block[0] 각 블럭의 이름
    //     console.log(block[0]) 
    // })
    tempMovingItem = {...movingItem}

    for(let i=0;i< GAME_ROWS ;i++){ 
        prependNewLine()
    } /**20번 반복 >> 20줄 */
    generateNewBlock()
} 


//console.log(playground) /**<ul> </ul>*/

//DOM 모양
function prependNewLine(){
    const li = document.createElement("li")
    const ul = document.createElement("ul")
    // console.log(li)
    // console.log(ul)
    for (let j=0;j<10;j++){
        const matrix = document.createElement("li");
        ul.prepend(matrix); //li가 담긴 ul 10개
    } // 10칸
    li.prepend(ul) // ul 10개가 담긴 li
    playground.prepend(li) //li 20를 가진 playground
}

//BLOCK 모양
function renderBlocks(moveType=""){
    /** 각각의 프로퍼티들을 변수로 사용 */
    const {type,direction,top,left} = tempMovingItem;
    // console.log(type,direction,top,left)
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove(type,"moving")
        // console.log(moving)
    })  

    /**BLOCKS[type][direction].forEach() - renderBlocks() 중간에 break 할 수 없음
     * → .some() - return true 로 변경, 더 효율적    */
    BLOCKS[type][direction].some(block => {
        const x = block[0] + left; /** 줄 */
        const y = block[1] + top; /** 칸 */
        /** console.log({playground}) 
            * >> childNodes : NodeList[21] 
             * >> childNodes : NodeList[0] 
              * >> childNodes : NodeList[10] */
        /** 범위 밖으로 블럭이 벗어날 시 콘솔에 에러 발생 → 삼항 연산자 사용 
            * const xxx = 조건? 참: 거짓 */ 
        const target = playground.childNodes[y]? playground.childNodes[y].childNodes[0].childNodes[x] : null;
        const isAvailable = checkEmpty(target);
        if(isAvailable){
            target.classList.add(type,"moving")
        } else {
            tempMovingItem = {...movingItem}
            // renderBlocks() 
            /** 재귀 함수 
            → 쿨스택,맥시멈, 엑시드 등 오류 발생  
            → setTimeout 함수로 나중에 하게끔 설정 */
            setTimeout(()=>{
                if(moveType === 'retry'){
                    clearInterval(downInterval)
                    showGameoverText()
                }
                renderBlocks('retry');
                // 블럭 하단 고정
                if(moveType === "top"){
                    seizeBlock();
                }
            },0)
            // renderBlocks();
            return true;
        }
        //console.log(target) /** <li> </li>*/
    });
    movingItem.left = left;
    movingItem.top = top;
    movingItem.direction = direction;
    }

//seizeBlock
function seizeBlock(){
        const movingBlocks = document.querySelectorAll(".moving");
        movingBlocks.forEach(moving => {
            moving.classList.remove("moving");
            moving.classList.add("seized");
    })
    checkMatch();
    // generateNewBlock();
}

//checkMatch 한줄 블럭 없애기
function checkMatch(){
    const childNodes = playground.childNodes;
    childNodes.forEach(child=>{
        let matched = true;
        child.children[0].childNodes.forEach(li=>{
            if(!li.classList.contains("seized")){
                matched = false;
            } 
        })
        if(matched){
            child.remove();
            prependNewLine();
            score += 10;
            scoreDisplay.innerText = score;
            
        }
    })
    generateNewBlock()
}

//generateNewBlock 다음 새 아이템 생김
function generateNewBlock() {

    clearInterval(downInterval);
    downInterval = setInterval(()=>{
        moveBlock('top',1)
    },duration)
    
    /** BLOCKS 갯수 = BLOCKS 가 가진 프로퍼티 배열 길이
        * BLOCKS.length → undefined ∵BLOCKS : Object 
        * console.log(Object.entries(BLOCKS).length) */
    const blockArray = Object.entries(BLOCKS);
    const randomIndex = Math.floor(Math.random() * blockArray.length)
   
    // movingItem.type = blockArray[randomIndex][0] //랜덤
    movingItem.type = blockArray[randomIndex][0]
    movingItem.top = 0;
    movingItem.left = 3;
    movingItem.direction = 0;
    tempMovingItem = {...movingItem} // 복사
    renderBlocks();
}

//checkEmpty
function checkEmpty(target){
    /** contains() seized라는 클래스가 o → true 반환 */
    if(!target || target.classList.contains("seized")){
        // target /= 빈값
        return false;
    }
    return true;
}

//moveBlock
function moveBlock(moveType,amount){
    //renderBlocks함수에서 tempMovingItem으로 위치 변경
    tempMovingItem[moveType] += amount;
    // moveBlock이 됐을 때만 renderBlocks실행
    renderBlocks(moveType);
}

//changeDirection
function changeDirection(){
    // 반복되는 모양 → 비효율적
    // tempMovingItem.direction += 1;
    // if(tempMovingItem === 4){
    //     tempMovingItem.direction = 0;
    // }
    const direction = tempMovingItem.direction;
    /** 왜 4가 아니라 3이지? 그리고 direction 하면 오류가 남 
     * Uncaught TypeError: Assignment to constant variable.
     * direction === 3 ? direction = 0 : direction += 1 ; */
    direction === 3 ? tempMovingItem.direction = 0 : tempMovingItem.direction += 1 ;
    renderBlocks();
}

//dropBlock 스페이스바 → 바로 내려오기
function dropBlock(){
    clearInterval(downInterval);
    downInterval = setInterval(()=>{
        moveBlock('top',1)
    },5)
}

//
function showGameoverText(){
    gameText.style.display = "flex"
}


//event handling
document.addEventListener("keydown", e => {
    switch (e.keyCode){
        case 39:
            moveBlock("left",1);
            break;
        case 37:
            moveBlock("left",-1);
            break;
        case 40:
            moveBlock("top",1)
            break;
        case 38:
            changeDirection();
            break;
        case 32:
            dropBlock();
            break;
        default:
            break;
    }
    // console.log(e)
})

restartButton.addEventListener("click",()=>{
    movingItem.score = 0;
    duration = 500;
    gameText.style.display = "none" ; 
    playground.innerHTML = "";
    init();
})

speedUpButton.addEventListener("click",()=>{
    playground.innerHTML = ""; 
    duration -= 120;
    init();
})

speedDownButton.addEventListener("click",()=>{
    playground.innerHTML = ""; 
    duration += 120;
    init();
})