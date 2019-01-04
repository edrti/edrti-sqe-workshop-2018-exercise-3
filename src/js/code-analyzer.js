import * as esprima from 'esprima';

const parseCodeLocation = (codeToParse) => {
    return esprima.parseScript(codeToParse,{loc: true});
};

function Info(_location,_type,_name,_condition,_value,_scope){
    this.location=_location;
    this.type=_type;
    this.nameOf=_name;
    this.condition=_condition;
    this.valueOf=_value;
    this.scope=_scope;
}

function Local(_name,_value){
    this.nameOfLocal=_name;
    this.value=_value;
}

const mapToFunction = {
    FunctionDeclaration : functionParser,
    Identifier: IdentifierParser,
    VariableDeclaration: variableDeclarationParser,
    VariableDeclarator: variableDeclaratorParser,
    ExpressionStatement: expressionStatementParser,
    AssignmentExpression: assignmentExpressionParser,
    BinaryExpression: parseBinaryExpression,
    WhileStatement: parseWhileStatement,
    IfStatement: parseIfStatement,
    UpdateExpression: parseUpdateExpression,
    ReturnStatement:parseReturnExpression
};

function isContain(arr,name){
    for(let i=0;i<arr.length;i++){
        if(arr[i].nameOfLocal==name)
            return i;
    }
    return -1;
}
function generateObject (parsedCode,arr,scope,stringArray){
    let type = parsedCode['type'];
    mapToFunction[type](parsedCode,arr,scope,stringArray);
}

function IdentifierParser(parsedCode,arr,scope,stringArray) {
    arr.push(new Info(parsedCode['loc']['start']['line'], 'variable declaration', parsedCode['name'], null, null, scope));
    let position=isContain(scope,parsedCode['name']);
    if(position!=-1){
        stringArray[parsedCode['loc']['start']['line']-1]='';
    }
}

function functionParser (parsedCode,arr,scope,stringArray){
    let nameOfFunction = parsedCode['id']['name'];
    arr.push(new Info(parsedCode['loc']['start']['line'],'function declaration',nameOfFunction,null,null,scope));
    for(let i=0;i<parsedCode['params'].length;i++)
        generateObject(parsedCode['params'][i],arr,scope,stringArray);
    let functionBody=parsedCode['body']['body'];
    for(let i=0;i<functionBody.length;i++){
        functionParserEzer(parsedCode,arr,functionBody,i,scope,stringArray);
    }
}

function functionParserEzer(parsedCode,arr,functionBody,i,scope,stringArray){
    if(functionBody[i]['type']!='ReturnStatement'){
        if(functionBody[i]['type']=='IfStatement')
            parseIfStatement(functionBody[i],arr,0,scope,stringArray);
        /*        else if(functionBody[i]['type']=='UpdateExpression')
            parseUpdateExpression(functionBody[i],arr,0,scope);
        else if(functionBody[i]['type']=='BinaryExpression')
            parseBinaryExpression(functionBody[i],arr,0,scope);*/
        else generateObject(functionBody[i],arr,scope,stringArray);
    }
    ezerForFunctionParserEzer(functionBody,i,arr,scope);
}

function ezerForFunctionParserEzer(functionBody,i,arr,scope){
    if(functionBody[i]['type']=='ReturnStatement') {
        arr.push(new Info(functionBody[i]['loc']['start']['line'],'return statement',null,null,getExpressionValue(functionBody[i]['argument'],scope),null));
    }
}

function variableDeclarationParser (parsedCode,arr,scope,stringArray){
    for(let i=0;i<parsedCode['declarations'].length;i++)
        generateObject(parsedCode['declarations'][i],arr,scope,stringArray);
}

function variableDeclaratorParser (parsedCode,arr,scope,stringArray){
    if(parsedCode['init']==null){
        arr.push(new Info(parsedCode['loc']['start']['line'],'variable declaration',parsedCode['id']['name'],null,null,scope));
        if(parsedCode['loc']['start']['line']!=1)
            scope.push(new Local(parsedCode['id']['name'],null));
    }
    else{
        vdbEzer(arr,parsedCode,scope,stringArray);
    }
    let position = isContain(scope, parsedCode['id']['name']);
    if (position != -1) {
        stringArray[parsedCode['loc']['start']['line']-1]='';
    }
}

function vdbEzer(arr,parsedCode,scope,stringArray){
    arr.push(new Info(parsedCode['loc']['start']['line'],'variable declaration',parsedCode['id']['name'],null,getExpressionValue(parsedCode['init'],scope),scope));
    if(stringArray[parsedCode['loc']['start']['line']-1]!=null && !stringArray[parsedCode['loc']['start']['line']-1].includes('function'))
        scope.push(new Local(parsedCode['id']['name'],getExpressionValue(parsedCode['init'],scope)));
}

function expressionStatementParser (parsedCode,arr,scope,stringArray){
    if(parsedCode['expression']['type']=='AssignmentExpression')
        assignmentExpressionParser(parsedCode['expression'],arr,scope,stringArray);
    else if(parsedCode['expression']['type']=='BinaryExpression')
        parseBinaryExpression(parsedCode['expression'],arr,scope,stringArray);
    else if(parsedCode['expression']['type']=='UpdateExpression')
        parseUpdateExpression(parsedCode['expression'],arr,scope,stringArray);
    else IdentifierParser(parsedCode['expression'],arr,scope,stringArray);
}


function assignmentExpressionParser (parsedCode,arr,scope,stringArray){
    let value = getExpressionValue(parsedCode['right'],scope);
    arr.push(new Info(parsedCode['loc']['start']['line'],'assignment expression',parsedCode['left']['name'],null,value,scope));
    let position=isContain(scope,parsedCode['left']['name']);
    if(position!=-1){
        scope[position].value=value;
        stringArray[parsedCode['loc']['start']['line']-1]='';
    }
    else{
        let sub;
        sub=stringArray[parsedCode['loc']['start']['line']-1].substring(parsedCode['right']['loc']['start']['column'], parsedCode['right']['loc']['end']['column']);
        stringArray[parsedCode['loc']['start']['line']-1] = stringArray[parsedCode['loc']['start']['line']-1].replace(sub,value);
    }
}

function getBinaryExpressionValue(parsedCode,scope){
    let leftValue=getBinaryExpressionSideValue(parsedCode,'left',scope).toString();
    let rightValue=getBinaryExpressionSideValue(parsedCode,'right',scope).toString();
    let op=leftValue.concat(' ',parsedCode['operator'].toString());
    return op+' '+(rightValue);
}

function getBinaryExpressionSideValue(parsedCode,side,scope){
    if (parsedCode[side]['type']=='BinaryExpression')
        return getBinaryExpressionValue(parsedCode[side],scope);
    else if(parsedCode[side]['type']=='Identifier'){
        let position=isContain(scope,parsedCode[side]['name']);
        if(position!=-1)
            return '('+scope[position].value+')';
        return parsedCode[side]['name'];
    }
    return getBinaryExpressionSideValueEzer(parsedCode,side,scope);
}

function getBinaryExpressionSideValueEzer(parsedCode,side,scope){
    if(parsedCode[side]['type']=='Literal')
        return parsedCode[side]['value'];
    else if(parsedCode[side]['type']=='MemberExpression')
        return getMemberExpressionValue(parsedCode[side],scope);
    return parsedCode[side]['operator']+getExpressionValue(parsedCode[side]['argument'],scope);
}

function getMemberExpressionValue(parsedCode,scope){
    let left = parsedCode['object']['name'];
    let inside = getExpressionValue(parsedCode['property'],scope);
    let op=left+'[';
    let op2=inside+']';
    return op+op2;
}

function getExpressionValue(parsedCode,scope){
    if(parsedCode['type']=='BinaryExpression')
        return getBinaryExpressionValue(parsedCode,scope);
    else if(parsedCode['type']=='Identifier'){
        let position=isContain(scope,parsedCode['name']);
        if(position!=-1)
            return '('+scope[position].value+')';
        return parsedCode['name'];
    }
    else return getExpressionValueEzer(parsedCode,scope);
}

function getExpressionValueEzer(parsedCode,scope){
    if(parsedCode['type']=='UnaryExpression')
        return parsedCode['operator']+getExpressionValue(parsedCode['argument'],scope);
    else if(parsedCode['type']=='MemberExpression')
        return getMemberExpressionValue(parsedCode,scope);
    else if(parsedCode['type']=='Literal')
        return parsedCode['value'];
    return getExpressionValue(parsedCode['argument'],scope)+parsedCode['operator'];
}

function parseReturnExpression (parsedCode,arr,scope,stringArray) {
    let value = getExpressionValue(parsedCode['argument'], scope);
    arr.push(new Info(parsedCode['loc']['start']['line'], 'return statement', null, null, value, null));
    let sub;
    sub = stringArray[parsedCode['loc']['start']['line'] - 1].substring(7+parsedCode['loc']['start']['column'], parsedCode['loc']['end']['column']);
    stringArray[parsedCode['loc']['start']['line'] - 1] = stringArray[parsedCode['loc']['start']['line'] - 1].replace(sub, value);
}

function parseBinaryExpression(parsedCode,arr,scope){
    arr.push(new Info(parsedCode['loc']['start']['line'],'binary expression',parsedCode['left']['name'],null,getBinaryExpressionValue(parsedCode,scope),scope));
}

function parseWhileStatement(parsedCode,arr,scope,stringArray){
    let value=getExpressionValue(parsedCode['test'],scope);
    arr.push(new Info(parsedCode['loc']['start']['line'],'while statement',null,value,null,scope));
    let whileBody;
    whileSymEzer(stringArray,parsedCode,scope);
    let whileScope = JSON.parse(JSON.stringify(scope));
    //if(parsedCode['body']['body']!=null) {
    //  whileBody=parsedCode['body']['body'];
    //whileStatementParserEzer(whileBody,arr,whileScope,stringArray);}
    whileBody=parsedCode['body']['body'];
    whileStatementParserEzer(whileBody,arr,whileScope,stringArray);
}

function whileSymEzer(stringArray,parsedCode,scope){
    let sub;
    let sub2;
    if(parsedCode['test']['type']=='BinaryExpression') {
        sub = stringArray[parsedCode['loc']['start']['line'] - 1].substring(parsedCode['test']['left']['loc']['start']['column'], parsedCode['test']['left']['loc']['end']['column']);
        sub2 = stringArray[parsedCode['loc']['start']['line'] - 1].substring(parsedCode['test']['right']['loc']['start']['column'], parsedCode['test']['right']['loc']['end']['column']);
        stringArray[parsedCode['loc']['start']['line'] - 1] = stringArray[parsedCode['loc']['start']['line'] - 1].replace(sub, getExpressionValue(parsedCode['test']['left'], scope));
        stringArray[parsedCode['loc']['start']['line'] - 1] = stringArray[parsedCode['loc']['start']['line'] - 1].replace(sub2, getExpressionValue(parsedCode['test']['right'], scope));
    }
    else{
        sub = stringArray[parsedCode['loc']['start']['line'] - 1].substring(parsedCode['test']['loc']['start']['column'], parsedCode['test']['loc']['end']['column']);
        stringArray[parsedCode['loc']['start']['line'] - 1] = stringArray[parsedCode['loc']['start']['line'] - 1].replace(sub, getExpressionValue(parsedCode['test'], scope));

    }
}

function whileStatementParserEzer(whileBody,arr,whileScope,stringArray){
    for(let i=0;i<whileBody.length;i++){
        if(whileBody[i]['type']=='IfStatement')
            parseIfStatement(whileBody[i],arr,0,whileScope,stringArray);
        /*        else if(whileBody[i]['type']=='UpdateExpression')
            parseUpdateExpression(whileBody[i],arr,whileScope);
        else if(whileBody[i]['type']=='BinaryExpression')
            parseBinaryExpression(whileBody[i],arr,whileScope);*/
        else generateObject(whileBody[i],arr,whileScope,stringArray);
    }
}

function parseIfStatement(parsedCode,arr,num,scope,stringArray){
    if(num==0)
        arr.push(new Info(parsedCode['loc']['start']['line'],'if statement',null,getExpressionValue(parsedCode['test'],scope),null,scope));
    else
        arr.push(new Info(parsedCode['loc']['start']['line'],'else if statement',null,getExpressionValue(parsedCode['test'],scope),null,scope));
    symIfEzer(stringArray,parsedCode,scope);
    let ifScope = JSON.parse(JSON.stringify(scope));
    ezerIfParser(ifScope,stringArray,parsedCode,arr);
    //if(parsedCode['consequent']['body']!=null){
    //  ezerIfParser(ifScope,stringArray,parsedCode,arr);}
    //else generateObject(parsedCode['consequent'],arr,ifScope,stringArray);
    if(parsedCode['alternate']!=null){
        parseIfStatementEzer(parsedCode,arr,scope,stringArray);}
}

function symIfEzer(stringArray,parsedCode,scope){
    let sub,sub2;
    if(parsedCode['test']['type']=='BinaryExpression') {
        sub = stringArray[parsedCode['loc']['start']['line'] - 1].substring(parsedCode['test']['left']['loc']['start']['column'], parsedCode['test']['left']['loc']['end']['column']);
        sub2 = stringArray[parsedCode['loc']['start']['line'] - 1].substring(parsedCode['test']['right']['loc']['start']['column'], parsedCode['test']['right']['loc']['end']['column']);
        stringArray[parsedCode['loc']['start']['line'] - 1] = stringArray[parsedCode['loc']['start']['line'] - 1].replace(sub, getExpressionValue(parsedCode['test']['left'], scope));
        stringArray[parsedCode['loc']['start']['line'] - 1] = stringArray[parsedCode['loc']['start']['line'] - 1].replace(sub2, getExpressionValue(parsedCode['test']['right'], scope));
    }
    else{
        sub = stringArray[parsedCode['loc']['start']['line'] - 1].substring(parsedCode['test']['loc']['start']['column'], parsedCode['test']['loc']['end']['column']);
        stringArray[parsedCode['loc']['start']['line'] - 1] = stringArray[parsedCode['loc']['start']['line'] - 1].replace(sub, getExpressionValue(parsedCode['test'], scope));
    }
}

function ezerIfParser(ifScope,stringArray,parsedCode,arr) {
    let ifBody = parsedCode['consequent']['body'];
    for (let i = 0; i < ifBody.length; i++) {
        if (ifBody[i]['type'] == 'IfStatement')
            parseIfStatement(ifBody[i], arr, 0, ifScope, stringArray);
        /*        else if (ifBody[i]['type'] == 'UpdateExpression')
            parseUpdateExpression(ifBody[i], arr, ifScope);
        else if (ifBody[i]['type'] == 'BinaryExpression')
            parseBinaryExpression(ifBody[i], arr, ifScope);*/
        else generateObject(ifBody[i], arr, ifScope, stringArray);
    }
}
function parseIfStatementEzer(parsedCode,arr,scope,stringArray){
    let ifScope = JSON.parse(JSON.stringify(scope));
    if(parsedCode['alternate']['type']!=null && parsedCode['alternate']['type']=='IfStatement')
        parseIfStatement(parsedCode['alternate'],arr,1,ifScope,stringArray);
    else {
        ezerForIf(parsedCode,arr,ifScope,stringArray);
    }
}

function ezerForIf(parsedCode,arr,scope,stringArray){
    let ifBody=parsedCode['alternate']['body'];
    for(let i=0;i<ifBody.length;i++){
        if(ifBody[i]['type']=='IfStatement')
            parseIfStatement(ifBody[i],arr,0,scope,stringArray);
        else generateObject(ifBody[i],arr,scope,stringArray);
    }
}

function parseUpdateExpression(parsedCode,arr,scope){
    arr.push(new Info(null,'update expression',null,null,getExpressionValue(parsedCode['argument'],scope)+parsedCode['operator'],scope));
}

function symbolizeCode(codeToParse,parsedCode){
    let localsArray=[];
    let stringArray=codeToParse.split('\n');
    let index=findStart(parsedCode);
    for(let i=0;i<index;i++)
        generateObject(parsedCode['body'][i],[],localsArray,stringArray);
    for(let i=index+1;i<parsedCode['body'].length;i++)
        generateObject(parsedCode['body'][i],[],localsArray,stringArray);

    generateObject(parsedCode['body'][index],[],localsArray,stringArray);

    return [stringArray,localsArray];
}

function findStart(parsedCode){
    let ret=1;
    for(let i=0;i<parsedCode['body'].length;i++){
        if(parsedCode['body'][i]['type']=='FunctionDeclaration')
            ret=i;
    }
    return ret;
}


export {findStart,parseCodeLocation,generateObject,symbolizeCode};