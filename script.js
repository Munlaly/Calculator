const screen = document.querySelector('#screen');
const numberBtns = document.querySelectorAll('.number');
const operatorBtns = document.querySelectorAll('.operator')
const deleteBtn = document.querySelector('#delete');
const acBtn = document.querySelector('#clear-all');
const equalBtn = document.querySelector('#equal');


let expression = [];
let currentNumber = '';
let answer;
const screenLimit = 30;
let numberOfCharacters = 0;

const precedence = {
    '+' : 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '%': 2,
    '^': 3,
    '√': 4, 
};
const rightAssociative = new Set(['^', '√']);

function isFloat(num){
    return num % 1 !== 0;
}

function mod(a, b) {
    return a - b * Math.floor(a / b);
}

function toPostfix(tokens){
    const output = [];
    const stack = [];

    for(const token of tokens){
        if(token.type === 'number'){
            output.push(token);
        }
        else if(token.type === 'operator')
            {
            const operator = token.value;
            while (stack.length && precedence[operator] <= precedence[stack[stack.length - 1].value] && !rightAssociative.has(operator)){
                output.push(stack.pop());
            }
            stack.push(token);
        }

    }

    while(stack.length){
        output.push(stack.pop());
    }
    return output;
}

function evaluateExpression(expression){
    const stack = [];
    for(token of expression){
        if(token.type === 'number'){
            stack.push(Number(token.value));
        }
        else if(token.type === 'operator'){
            const operator = token.value;
            if( operator === '√'){
                const num = stack.pop();
                stack.push(Math.sqrt(num));
            }
            else {
                const num2 = Number(stack.pop());
                const num1 = Number(stack.pop());
                switch(operator){
                    case '+': {
                        stack.push(num1 + num2); 
                        break;
                    }
                    case '-':{
                        stack.push(num1 - num2);
                        break;
                    }
                    case '*':{
                        stack.push(num1 * num2);
                        break;
                    }
                    case '/':{
                        if(num2 !== 0) stack.push(num1 / num2);
                        break;
                    }
                    case '%':{
                        stack.push(mod(num1, num2));
                        break;
                    }
                    case '^': {
                        stack.push(num1 ** num2);
                        break;
                    }
                }
            }
        }
    }
    return stack.pop();
}


function updateScreen(){
    if(screen.value == answer) screen.value = '';
    let display = expression.map( (element) => element.value + ' ');
    if(currentNumber) display.push(currentNumber);
    screen.value = display.join(' ');

}

numberBtns.forEach((btn) =>{
    btn.addEventListener('click', (e) =>{
        if(numberOfCharacters >= screenLimit) return;
        const currentDigit = e.target.innerText;
        currentNumber += currentDigit;
        ++numberOfCharacters;
        updateScreen();
    });
});

operatorBtns.forEach((op) => {
    op.addEventListener('click', (e) =>{
         if(numberOfCharacters >= screenLimit) return;
         ++numberOfCharacters;
        const operator = e.target.innerText;
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

equalBtn.addEventListener('click', () => {
    if (currentNumber) {
        expression.push({ type: 'number', value: currentNumber });
        currentNumber = '';
    }

    const postfix = toPostfix(expression);
    answer = evaluateExpression(postfix);
    expression = [];
    currentNumber = '';
    screen.value = answer;
    numberOfCharacters = 0;
})