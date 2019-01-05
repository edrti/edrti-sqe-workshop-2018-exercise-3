import $ from 'jquery';
import {parseCodeLocation,symbolizeCode,findStart} from './code-analyzer';
const esgraph = require('esgraph');
import * as d3graphviz from 'd3-graphviz';
var escodegen = require('escodegen');
let counter=1;

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let inputVector = $('#input').val();
        let parsedCode = parseCodeLocation(codeToParse);
        let cfg = esgraph(parsedCode['body'][0]['body']);
        //$('#input').val(escodegen.generate(cfg[2][1].astNode));
        let symbolized=symbolizeCode(codeToParse,parsedCode);
        let index=findStart(parsedCode);
        let init=generateInit(inputVector,symbolized[0][index],symbolized[1]);
        handleGraphNodes(cfg,init);

    });
});


function generalInitEzer(locals,init,paramsArray,inputArray){
    for(let i=0;i<inputArray.length;i++){
        init = init+'let ' + paramsArray[i] + '=' + inputArray[i] + ';';
    }
    for(let i=0;i<locals.length;i++){
        init = init + 'let ' + locals[i].nameOfLocal + '=' + locals[i].value + ';';
    }
    return init;
}

function checkCondition(conditionLine,init){
    init=init+' '+conditionLine+';';
    return eval(init);
}

function generateInit(inputVector,params,locals){
    let init='';
    let inputArray=inputVector.split(',');
    if(params!=null)
        params = params.substring(params.indexOf('(')+1,params.indexOf(')'));
    let paramsArray = params.split(',');
    for(let i=0;i<paramsArray.length;i++)
        paramsArray[i]=paramsArray[i].trim();
    for(let i=0;i<inputArray.length;i++)
        inputArray[i]=inputArray[i].trim();
    init=generalInitEzer(locals,init,paramsArray,inputArray);
    return init;
}


function handleLet(letString){
    if(letString.trim().startsWith('let') && letString.trim().endsWith(';'))
        return letString.substring(letString.indexOf('let')+4,letString.lastIndexOf(';'));
    return letString;
}

function generateVizNode(ast,color,shapeType,index){
    let temp='';
    if(index!=null)
        temp = 'n'+index+' [label="'+'('+ast.index+')'+handleLet(escodegen.generate(ast.astNode))+'",color='+color+',shape='+shapeType+']\n';
    else{
        temp = 'n'+counter+' [label="'+'('+ast.index+')'+handleLet(escodegen.generate(ast.astNode))+'",color='+color+',shape='+shapeType+']\n';
        counter++;
    }
    return temp;
}

function evalConditions(cfgArray,init){
    //&& cfgArray[i].parent.type!='WhileStatement'
    for(let i=1;i<cfgArray.length-1;i++){
        if(cfgArray[i].astNode.type=='BinaryExpression'){
            let checker=escodegen.generate(cfgArray[i].astNode);
            let isTrue = checkCondition(checker,init);
            cfgArray[i]['isTrue']=isTrue;
        }
    }
}

function isWhile(cfgArray){
    for(let i=1;i<cfgArray.length-1;i++) {
        if (cfgArray[i].parent.type == 'WhileStatement')
            return true;
    }
    return false;
}

function arrayToString(vizArray){
    let retString='';
    for(let i=0;i<vizArray.length;i++){
        retString=retString+vizArray[i];
    }
    return retString;
}

function truePath (ast,vizArray){
    vizArray[ast.number]=generateVizNode(ast,'green','square',ast.index);
    ast['color']='green';
    if(ast.normal.type!=undefined && ast.normal.type!=null && ast.normal.type!='exit')
        truePath(ast.normal,vizArray);
}

function initiate(cfg,vizArray,isWhile){
    let a=-1;
    for(let i=1;i<cfg[2].length-1;i++){
        if(isWhile&&cfg[2][i].astNode.type=='BinaryExpression'){
            a=counter;
            counter++;
        }
        let color='black';
        let shape='square';
        cfg[2][i]['name']='n'+counter;
        cfg[2][i]['number']=i-1;
        cfg[2][i]['index']=counter;
        vizArray[i-1]=generateVizNode(cfg[2][i],color,shape,null);
    }
    return a;
}

function ezerForEval(cfg,i,vizArray){
    if(i!=1&&cfg[2][i].prev[0].astNode.type!='BinaryExpression'&&cfg[2][i-1].color!=null&&cfg[2][i-1].color=='green'){
        vizArray[i-1]=generateVizNode(cfg[2][i],'green','square',cfg[2][i].index);
        cfg[2][i]['color']='green';
    }
}

function evalEzerEzer(cfg,i,vizArray){
    ezerForEval(cfg,i,vizArray);
    if(cfg[2][i].isTrue==true){
        vizArray[i-1]=generateVizNode(cfg[2][i],'green','Mdiamond',cfg[2][i].index);
        cfg[2][i]['color']='green';
        truePath(cfg[2][i].true,vizArray);
    }
    else if(cfg[2][i].isTrue==false){
        vizArray[i-1]=generateVizNode(cfg[2][i],'green','Mdiamond',cfg[2][i].index);
    }
}

function evalEzer(vizArray,cfg){
    for(let i=1;i<cfg[2].length-1;i++){
        if(i==1){
            vizArray[i-1]=generateVizNode(cfg[2][i],'green','square',cfg[2][i].index);
            cfg[2][i]['color']='green';
        }
        evalEzerEzer(cfg,i,vizArray);
    }
}

function ezerForTheWhile(cfg,nodeName){
    let gen='';
    for(let t=1;t<cfg[2].length-1;t++){
        if(cfg[2][t].nextSibling==undefined&& cfg[2][t].astNode.type!='ReturnStatement' && cfg[2][t].astNode.type!='BinaryExpression')
            gen=gen+cfg[2][t].name+ ' -> ' + nodeName+ '\n';
    }
    return gen;
}

function handleWhile(cfg,i,count){
    let color='green';
    let nodeName='n'+counter;
    let gen = nodeName + ' [label = "'+'('+count+')' +'NULL", color = '+color+', shape ="square"]\n';
    counter++;
    gen=gen+ezerForTheWhile(cfg,nodeName);
    if(cfg[2][i].prev[0].name!=undefined && cfg[2][i].prev[0].name!=null){
        gen=gen+ cfg[2][i].prev[0].name + ' -> ' + nodeName +'\n';
        gen=gen+ nodeName + ' -> ' + cfg[2][i].name +'\n';
    }
    return gen;
}

function handleNotWhileEzer(cfg,i,gen,j,nodeName){
    if(cfg[2][i].prev[j].name!=undefined && cfg[2][i].prev[j].name!=null && cfg[2][i].prev[j].astNode.type=='BinaryExpression'){
        counter++;
        counter--;
        return '';
    }
    else if(cfg[2][i].prev[j].name!=undefined )
        return cfg[2][i].prev[j].name + ' -> ' + nodeName +'\n';
}

function handleNotWhile(cfg,i){
    let color='green';
    let nodeName='n'+counter;
    let gen = nodeName + ' [label = " ", color = '+color+', shape ="circle"]\n';
    counter++;
    for(let j=0;j<cfg[2][i].prev.length;j++){
        gen=gen+ handleNotWhileEzer(cfg,i,gen,j,nodeName);
    }
    gen=gen+nodeName+ ' -> ' + cfg[2][i].name+ '\n';
    return gen;
}

function ezerEzer(cfg,i,connectionString){
    if(cfg[2][i].astNode.type=='BinaryExpression'){
        connectionString=connectionString+ cfg[2][i].name + ' -> ' +cfg[2][i].true.name +'[label = "true"]'+'\n';
        connectionString=connectionString+ cfg[2][i].name + ' -> ' +cfg[2][i].false.name +'[label = "false"]'+'\n';
    }
    return connectionString;
}

function tryEzer(cfg,i,connectionString){
    if(cfg[2][i].prev[0].name!=undefined && cfg[2][i].prev[0].name!=null&& cfg[2][i].prev[0].astNode.type!='BinaryExpression'){
        connectionString=connectionString + cfg[2][i].prev[0].name + ' -> ' + cfg[2][i].name  + '\n';
    }
    return connectionString;
}

function ezerEzerEzer(connectionString,cfg,i,whileIs,count){
    if((!whileIs) && cfg[2][i].prev.length>1){
        connectionString=connectionString+handleNotWhile(cfg,i);
    }
    else if (whileIs && cfg[2][i].prev.length>1){
        connectionString=connectionString+handleWhile(cfg,i,count);
    }
    else
        connectionString=tryEzer(cfg,i,connectionString);
    return connectionString;
}

function handleGraphEzer(cfg,connectionString,count){
    let whileIs=isWhile(cfg[2]);
    for(let i=1;i<cfg[2].length-1;i++){
        connectionString=ezerEzer(cfg,i,connectionString);
        connectionString=ezerEzerEzer(connectionString,cfg,i,whileIs,count);
    }
    return connectionString;
}

function returnChange(vizArray,cfg){
    let index=-1;
    for(let i=1;i<cfg.length-1;i++){
        if(cfg[i].astNode.type=='ReturnStatement')
            index=i;
    }
    vizArray[index-1]='n'+cfg[index].index+' [label="'+'('+cfg[index].index+')'+handleLet(escodegen.generate(cfg[index].astNode))+'",color='+'green'+',shape='+'square'+']\n';
}
function handleGraphNodes(cfg,init){
    let vizArray=[];
    let whileIs=isWhile(cfg[2]);
    let nullCounter=initiate(cfg,vizArray,whileIs);
    if(whileIs||!whileIs){
        evalConditions(cfg[2],init);
        evalEzer(vizArray,cfg);
    }
    let connectionString='';
    returnChange(vizArray,cfg[2]);
    connectionString=handleGraphEzer(cfg,connectionString,nullCounter);
    let final = arrayToString(vizArray)+connectionString;
    let string = 'digraph G {'+final+'}';
    d3graphviz.graphviz('#graph').renderDot(string);
}
