const screen = document.querySelector('#screen');
const numberBtns = document.querySelectorAll('.number');
const operatorBtns = document.querySelectorAll('.operator')
const deleteBtn = document.querySelector('#delete');
const acBtn = document.querySelector('#clear-all');
const equalBtn = document.querySelector('#equal');
const decimalPointBtn = document.querySelector('#decimal-point');
const openingBraceBtn = document.querySelector('#opening-brace');
const closingBraceBtn = document.querySelector('#closing-brace');
const ansBtn = document.querySelector('#answer');
const cursorLeftBtn = document.querySelector('#cursor-left');
const cursorRightBtn = document.querySelector('#cursor-right');


let expression = [];
let currentNumber = '';
let answer = null;
const screenLimit = 30;
let numberOfCharacters = 0;
let cursorPosition = 0; //Cursor is inserted anfter alement of expression

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

function validateCurrentNumber(){
    if (currentNumber === '' || currentNumber === '.') {
        return 'Invalid number format: incomplete number.';
    }
   const decimalCount = currentNumber.split('.').length - 1;
   if (decimalCount > 1) {
        return 'Invalid number format: too many decimal points.';
    }
    return null;
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
        else if(token.type === 'brace'){
            if(token.value === '(') {
                stack.push(token);
            }
            else{
                while(stack.length && stack[stack.length - 1].value !== '('){
                    output.push(stack.pop());
                }
                // ensure parenthesis are matched correctly
                if (stack.length === 0) {
                    throw new Error("Mismatched parentheses detected in toPostfix");
                }
                stack.pop(); // remove opening brace from stack
            }
            
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
                if( num < 0){
                    alert('Negative square root not allowed!');
                    return;
                }
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
                       if (num2 === 0) {
                            alert("Division by zero is undefined.");
                            return;
                        }
                        stack.push(num1 / num2);
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

function validateExpression(expression){
    const len = expression.length;
    if(len <= 0 && currentNumber === '')  return 'Empty expression';
    if(currentNumber === '' && expression[len - 1].type === 'operator') return 'Expression cannot end with operator';
    const stack = [];
    
    for(let i = 0; i < len; ++i){
        const current = expression[i];
        const prev = expression[i - 1];
        const next = expression[i + 1];
        
          if ( prev && (current.type === 'operator' && prev.type === 'operator')) {
            const currVal = current.value;
            const prevVal = prev.value;

            // Allow √ after any operator 
            if (currVal === '√') continue;

            // Allow + / - after √ 
            if (prevVal === '√' && (currVal === '+' || currVal === '-')) continue;

            return `Invalid operator sequence: "${prevVal} ${currVal}"`;
        }

        if(current.type === 'brace'){
            if(current.value === '(') {
                stack.push('(');
                if(prev && (prev.type === 'number' || prev.value === ')')) return 'Invalid syntax: "(" cannot follow a number or ")"';
                if( next && (next.type === 'brace' && next.value === ')')) return 'Invalid syntax: empty parentheses "()"';
            }
            else {
                if( stack.length === 0) return 'Mismatched closing parenthesis';
                if( prev && prev.type === 'operator') return 'Invalid syntax: ")" cannot follow an operator';
                stack.pop();
            }
        }
    }
    if(stack.length > 0) return  'Mismatched opening parenthesis';
    
   
    if (currentNumber !== ''){
    let error = validateCurrentNumber();
    return error;
    }
    return null;
}


function updateScreen(){
    if(screen.value == answer) screen.value = '';
    let display = expression.map( (element) => element.value + ' ');
    if(currentNumber) display.push(currentNumber);
    screen.value = display.join(' ') + '|';

 }

function moveCursor(){
    let tokens = [...expression];
    if (currentNumber !== '') {
        tokens.push({ type: 'number', value: currentNumber });
    }
    
    let disp = [];

    for (let i = 0; i <= tokens.length; ++i) {
        if (i === cursorPosition) {
            if(i < tokens.length){
                 disp.push(tokens[i].value + '|');
                 continue;
            }
            else{
                disp.push('|');
            }
           
        }
        if (i < tokens.length) {
            disp.push(tokens[i].value);
        }
    }

    screen.value = disp.join(' ');
}

numberBtns.forEach((btn) =>{
    btn.addEventListener('click', (e) =>{
        if(numberOfCharacters >= screenLimit) return;
        //cursor is at the end of expression
        const currentDigit = e.target.innerText;
        if(cursorPosition === expression.length){
        currentNumber += currentDigit;
        ++numberOfCharacters;
        cursorPosition = expression.length;
        moveCursor();
        }
        else {
            const token = expression[cursorPosition];
            if(token && token.type === 'number'){
                token.value = token.value + currentDigit; 
                ++numberOfCharacters;
                moveCursor();
            }
           
        }
        
    });
});

operatorBtns.forEach((op) => {
    op.addEventListener('click', (e) =>{
        if(cursorPosition === expression.length){
            const prev = expression[cursorPosition - 1];
            const operator = e.target.innerText;
            if((prev && prev.type === 'operator') &&(!currentNumber)) return;
             if(numberOfCharacters >= screenLimit) return;
            if(currentNumber){
            if(currentNumber[currentNumber.length - 1] === '.') currentNumber += '0'; //adding zero after decimal point if nithing follows it
            const isInvalid = validateCurrentNumber();
            if( isInvalid) {
                alert(isInvalid);
                return;
            }
            expression.push({type: 'number', value: currentNumber});
            currentNumber = '';
       }
        if (expression.length === 0 && operator !== '√') {
            alert("Expression cannot start with operator: " + operator);
            return;
        }
        ++numberOfCharacters;
       expression.push({type: 'operator', value: operator});
       cursorPosition = expression.length;
       moveCursor();
    }
    else{
        const token = expression[cursorPosition];
        if(token && token.type === 'operator'){
            token.value = e.target.innerText;
            moveCursor();
        }
    }

    });
});

acBtn.addEventListener('click', () => {
    expression = [];
    currentNumber = '';
    numberOfCharacters = 0;
    answer = null;
    cursorPosition = 0;
    updateScreen();
});

deleteBtn.addEventListener('click', () => {
    if(cursorPosition === expression.length){
        if(currentNumber){
        currentNumber = currentNumber.slice(0, -1);
        moveCursor();
        return;
        }
        if(expression.length > 0){
            const last = expression.pop();
            cursorPosition = expression.length;
            moveCursor();
            return;
        }
    }
    const token = expression[cursorPosition];
    if(token && token.type === 'number'){
         token.value = token.value.slice(0,-1);
        moveCursor();
    }
});

equalBtn.addEventListener('click', () => {
    if (currentNumber) {
        expression.push({ type: 'number', value: currentNumber });
        currentNumber = '';
    }

    const validationError = validateExpression(expression);
    if(validationError){
        alert(validationError);
        return;
    }

    const postfix = toPostfix(expression);
    answer = evaluateExpression(postfix);
    expression = [];
    currentNumber = '';
    numberOfCharacters = 0;
    cursorPosition = 0;
    moveCursor();
    screen.value = answer;
});

decimalPointBtn.addEventListener('click', () => {
    if (cursorPosition === expression.length){
        if (currentNumber.includes('.')) return; // prevent multiple decimal points in the same number
        if (currentNumber === '') currentNumber = '0';
        currentNumber += '.';
        ++numberOfCharacters;
        cursorPosition = expression.length;
        moveCursor();
    }
    else{
        const token = expression[cursorPosition];
        if(token && token.type === 'number'){
                token.value = token.value + '.'; 
                ++numberOfCharacters;
                moveCursor();
            }
    }
});

openingBraceBtn.addEventListener('click' ,() => {
    if(numberOfCharacters >= screenLimit) return;
    if(currentNumber){
        if(currentNumber[currentNumber.length - 1] === '.') currentNumber += '0'; //adding zero after decimal point if nithing follows it
        const isInvalid = validateCurrentNumber();
        if( isInvalid) {
            alert(isInvalid);
            return;
         }
         expression.push({type: 'number', value: currentNumber});
         currentNumber = '';
          cursorPosition = expression.length;
          // add implicit multiplication if there is no operator between number and '('
         expression.push({type: 'operator', value: '*'});
    }
    expression.push({type: 'brace', value: '('});
     cursorPosition = expression.length;
    ++numberOfCharacters;
    moveCursor();

});

closingBraceBtn.addEventListener('click', () => {
    if(numberOfCharacters >= screenLimit) return;
    if(currentNumber){
        if(currentNumber[currentNumber.length - 1] === '.') currentNumber += '0'; //adding zero after decimal point if nithing follows it
        const isInvalid = validateCurrentNumber();
        if( isInvalid) {
            alert(isInvalid);
            return;
         }
         expression.push({type: 'number', value: currentNumber});
         currentNumber = '';
        cursorPosition = expression.length;
        
    }
    expression.push({type: 'brace', value: ')'});
    ++numberOfCharacters;
    cursorPosition = expression.length;
    moveCursor();
});

ansBtn.addEventListener('click', () => {
    if(answer === null) return;
    if(answer.toString().length + numberOfCharacters - currentNumber.length > screenLimit){
        alert('Limit of characters passed!');
        return;
    }
     numberOfCharacters -= currentNumber.length;
    currentNumber = answer.toString();
    numberOfCharacters += currentNumber.length;
    updateScreen();
})

cursorLeftBtn.addEventListener('click', () => {
    if(cursorPosition > 0){
       --cursorPosition;
       moveCursor();
    }
})

cursorRightBtn.addEventListener('click', () => {
    let tokens = [...expression];
    if (currentNumber !== '') tokens.push({ type: 'number', value: currentNumber });
    if(cursorPosition < tokens.length - 1){
        ++cursorPosition;
        moveCursor();
    }
})