const screen = document.querySelector('#screen');
const numberBtns = document.querySelectorAll('.number');
const operatorBtns = document.querySelectorAll('.operator')
const deleteBtn = document.querySelector('#delete');
const acBtn = document.querySelector('#clear-all');
const parantasisBtn = document.querySelector('#parantesis');


let expression = [];
let currentNumber = '';

function updateScreen(){
    let display = expression.map( (element) => element.value + ' ');
    if(currentNumber) display.push(currentNumber);
    screen.value = display.join(' ');

}

numberBtns.forEach((btn) =>{
    btn.addEventListener('click', (e) =>{
        const currentDigit = e.target.innerText;
        currentNumber += currentDigit;
        updateScreen();
    });
});

operatorBtns.forEach((op) => {
    op.addEventListener('click', (e) =>{
        const operator = e.target.innerText;
        console.log(operator);
       if(currentNumber){
        expression.push({type: 'number', value: currentNumber});
        currentNumber = '';
       }
       expression.push({type: 'operator', value: operator});
       updateScreen();
    });
});

acBtn.addEventListener('click', () => {
    expression = [];
    currentNumber = '';
    updateScreen();
});

deleteBtn.addEventListener('click', () => {
    if(currentNumber){
        currentNumber = currentNumber.slice(0, -1);
        updateScreen();
        return;
    }
    if(expression.length > 0){
        const last = expression.pop();
        if(last.type == 'number'){
            currentNumber = last.value.slice(0,-1);
        }
    }
    updateScreen();
})