import assert from 'assert';
import {parseCodeLocation, symbolizeCode} from '../src/js/code-analyzer';


describe('test table', () => {
    it('is generating function parameters', () => {
        let code='function foo(x, y, z){ let a = x + 1; let b = a + y; let c = 0; if (b < z) { c = c + 5; return x + y + z + c; } else if (b < z * 2) { c = c + x + 5; return x + y + z + c; } else { c = c + z + 5; return x + y + z + c; } }';
        let parsedCode=parseCodeLocation(code);
        let symbolized = symbolizeCode(code,parsedCode);
        assert.equal(JSON.stringify(symbolized[0]).replace(/\s/g, '')
            ,'["functionbfoo(x,y,z){leta=x+1;letb=a+y;letc=0;if(b<z){c=c+5;returnx+y+z+c}elseif(b<zz*2{c=cc+x+5returnxx+y+z+c}else{c=cc+z+5returnxx+y+z+c}"]'.replace(/\s/g, ''));});
    it('is generating function parameters', () => {
        let code='function foo(x, y, z){ let a = x + 1; let b = a + y; let c = 0; while (a < z) { c = a + b; z = c * 2; } return z; }';
        let parsedCode=parseCodeLocation(code);
        let symbolized = symbolizeCode(code,parsedCode);
        assert.equal(JSON.stringify(symbolized[0]).replace(/\s/g, '')
            ,'["functionfoo(x,y,z){leta=x+1;letb=a+y;letc=0;while(a<z){c=a+b;z=c*2;}returnz;}"]'.replace(/\s/g, ''));});
    it('is generating function parameters', () => {
        let code='function foo(x, y, z){ let t; let a = x + 1; let b = a + y; let c = 0; while (a < z) {if(a>0){ a++;} c = a + b; z = c * 2; x+3; c++;a+m[4];-2;} return z; }';
        let parsedCode=parseCodeLocation(code);
        let symbolized = symbolizeCode(code,parsedCode);
        assert.equal(JSON.stringify(symbolized[0]).replace(/\s/g, ''),'["functionfoo(x,y,z){lett;leta=x+1;letb=a+y;letc=0;while(a<z){if(a>0){a++;}c=a+b;z=c*2;x+3;c++;a+m[4];-2;}returnz;}"]'.replace(/\s/g, ''));});
});

describe('test table', () => {
    it('is generating function parameters', () => {
        let code='function foo(x, y, z){ let a = x + 1; let b = a + y; let c = 0; if (b < z) { c = c + 5; return x + y + z + c; } else if (b < z * 2) { c = c + x + 5; if(b<2){ b=2; } else{ b=4;} return x + y + z + c; } else { if(x>4){ x=4;} else if(x<4){ x=4;} else{ x=5;} c = c + z + 5; return x + y + z + c; } }';
        let parsedCode=parseCodeLocation(code);
        let symbolized = symbolizeCode(code,parsedCode);
        assert.equal(JSON.stringify(symbolized[0]).replace(/\s/g, '')
            ,'["functionbfoo(x,y,z2xleta=x+12letb=a+yxletc=0;if(bbz)4c=c+5;returnx+y+z+c4elseif(b<zz*2{c=cc+x+5if(b<2){b=2;4else{b=4;5returnxx+y+z+c}else{if(x>4){x=4;}elseif(x<4){x=4;}else{x=5;}c=cc+z+5returnxx+y+z+c}"]'.replace(/\s/g, ''));});
    it('is generating function parameters', () => {
        let code='function foo(x, y, z){ let a = x + 1; let b = a + y; let c = 0; if (b < z) { c = c + 5; return x + y + z + c; } else if (b < z * 2) { c = c + x + 5; if(b<2){ b=2; b++; -b; } else{ b=4; b++; -b; } return x + y + z + c; } else { if(x>4){ x=4;x++;x--;-x+2;} else if(x<4){ x=4;} else{ x=5;x++;-x;} c = c + z + 5; return x + y + z + c; } while(x>5){ } if(x>2){ } }';
        let parsedCode=parseCodeLocation(code);
        let symbolized = symbolizeCode(code,parsedCode);
        assert.equal(JSON.stringify(symbolized[0]).replace(/\s/g, '')
            ,'["functionbfoo(5,5y,2z24leta=x+12letb=a+yxletc=0;if(bbzx4c=c+5;returnx+y+z+c4elseif(b<zz*2{c=cc+x+5if(b<2x{b=2;b++;-b;}else{b=4;b++;-b;}returnxx+y+z+c}else{if(x>4){x=4;x++;x--;-x+2;}elseif(x<4){x=4;}else{x=5;x++;-x;}c=cc+z+5returnxx+y+z+cwhile(x>5){}if(x>2){}}"]'.replace(/\s/g, ''));});
    it('is generating function parameters', () => {
        let code='function foo(x, y, z){ x[4]; x++; x; -x; if(x++){ 1+2; } if(x>4){ 1+2; } if(a){ a; } while(x++){ x++;} while (x){ x;} while(x[4]){ x;} }';
        let parsedCode=parseCodeLocation(code);
        let symbolized = symbolizeCode(code,parsedCode);
        assert.equal(JSON.stringify(symbolized[0]).replace(/\s/g, '')
            ,'["functionfoo(x,y,z){x[4];x++;x;-x;if(x++){1+2;}if(x>4){1+2;}if(a){a;}while(x++){x++;}while(x){x;}while(x[4]){x;}}"]'.replace(/\s/g, ''));});
});

describe('test table', () => {
    it('is generating function parameters', () => {
        let code='let d=2,g=5; function foo(x, y, z){ let a = x + 1+xx; let b = a + y-d+g; let c = 0+d+xx; if (b+d < z+xx) { c = c + 5; return x + y + z + c; } else if (b < z * 2) { c = c + x + 5; return x + y + z + c; } else { c = c + z + 5; return x + y + z + c; } } let xx=2;';
        let parsedCode=parseCodeLocation(code);
        let symbolized = symbolizeCode(code,parsedCode);
        assert.equal(JSON.stringify(symbolized[0]).replace(/\s/g, '')
            ,'["letd=2,g=5;bunctionfoo(x,y,z){leta=x+1+xx;letb=a+y-d+g;letc=0+d+xx;if(b+dz*2+xx){c+5+5;retx+y+z+c+c;}elseif(b<z*2){cc+x+5+5;retux+y+z+cc;}else{cc+z+55;returx+y+z+cc;}}letxx=2;"]'.replace(/\s/g, '')
        );
    });
    it('is generating function parameters', () => {
        let code='let d=2,g=5; function foo(x, y, z){ let a; let b,c; if(x>4){ while(-x){} } } let xx=2;';
        let parsedCode=parseCodeLocation(code);
        let symbolized = symbolizeCode(code,parsedCode);
        assert.equal(JSON.stringify(symbolized[0]).replace(/\s/g, '')
            ,'["letd=2,g=5;functionfoo(x,y,z){leta;letb,c;if(x>4){while(-x){}}}letxx=2;"]'.replace(/\s/g, '')
        );
    });
});

describe('test table', () => {
    it('is generating function parameters', () => {
        let code='function foo(x, y, z){ let a = x + 1; let b = a + y; let c = 0; if (b < z) { c = c + 5; return x + y + z + c; } else if (b < z * 2) { c = c + x + 5; if(b<2){ b=2; } else{ b=4;} return x + y + z + c; } else { if(x>4){ x=4;} else if(x<4){ x=4;} else{ x=5;} c = c + z + 5; return x + y + z + c; } }';
        let parsedCode=parseCodeLocation(code);
        let symbolized = symbolizeCode(code,parsedCode);
        assert.equal(JSON.stringify(symbolized[0]).replace(/\s/g, '')
            ,'["functionbfoo(x,y,z2xleta=x+12letb=a+yxletc=0;if(bbz)4c=c+5;returnx+y+z+c4elseif(b<zz*2{c=cc+x+5if(b<2){b=2;4else{b=4;5returnxx+y+z+c}else{if(x>4){x=4;}elseif(x<4){x=4;}else{x=5;}c=cc+z+5returnxx+y+z+c}"]'.replace(/\s/g, ''));});
    it('is generating function parameters', () => {
        let code='function foo(x, y, z){ let a = x + 1; let b = a + y; let c = 0; if (b < z) { c = c + 5; return x + y + z + c; } else if (b < z * 2) { c = c + x + 5; if(b<2){ b=2; b++; -b; } else{ b=4; b++; -b; } return x + y + z + c; } else { if(x>4){ x=4;x++;x--;-x+2;} else if(x<4){ x=4;} else{ x=5;x++;-x;} c = c + z + 5; return x + y + z + c; } while(x>5){ } if(x>2){ } }';
        let parsedCode=parseCodeLocation(code);
        let symbolized = symbolizeCode(code,parsedCode);
        assert.equal(JSON.stringify(symbolized[0]).replace(/\s/g, '')
            ,'["functionbfoo(5,5y,2z24leta=x+12letb=a+yxletc=0;if(bbzx4c=c+5;returnx+y+z+c4elseif(b<zz*2{c=cc+x+5if(b<2x{b=2;b++;-b;}else{b=4;b++;-b;}returnxx+y+z+c}else{if(x>4){x=4;x++;x--;-x+2;}elseif(x<4){x=4;}else{x=5;x++;-x;}c=cc+z+5returnxx+y+z+cwhile(x>5){}if(x>2){}}"]'.replace(/\s/g, ''));});
    it('is generating function parameters', () => {
        let code='function foo(x, y, z){ x[4]; x++; x; -x; if(x++){ 1+2; } if(x>4){ 1+2; } if(a){ a; } while(x++){ x++;} while (x){ x;} while(x[4]){ x;} }';
        let parsedCode=parseCodeLocation(code);
        let symbolized = symbolizeCode(code,parsedCode);
        assert.equal(JSON.stringify(symbolized[0]).replace(/\s/g, '')
            ,'["functionfoo(x,y,z){x[4];x++;x;-x;if(x++){1+2;}if(x>4){1+2;}if(a){a;}while(x++){x++;}while(x){x;}while(x[4]){x;}}"]'.replace(/\s/g, ''));});
});

describe('test table', () => {
    it('is generating function parameters', () => {
        let code='let d=2,g=5; function foo(x, y, z){ let a = x + 1+xx; let b = a + y-d+g; let c = 0+d+xx; if (b+d < z+xx) { c = c + 5; return x + y + z + c; } else if (b < z * 2) { c = c + x + 5; return x + y + z + c; } else { c = c + z + 5; return x + y + z + c; } } let xx=2;';
        let parsedCode=parseCodeLocation(code);
        let symbolized = symbolizeCode(code,parsedCode);
        assert.equal(JSON.stringify(symbolized[0]).replace(/\s/g, '')
            ,'["letd=2,g=5;bunctionfoo(x,y,z){leta=x+1+xx;letb=a+y-d+g;letc=0+d+xx;if(b+dz*2+xx){c+5+5;retx+y+z+c+c;}elseif(b<z*2){cc+x+5+5;retux+y+z+cc;}else{cc+z+55;returx+y+z+cc;}}letxx=2;"]'.replace(/\s/g, ''));});
    it('is generating function parameters', () => {
        let code='let d=2,g=5; function foo(x, y, z){ let a; let b,c; if(x>4){ while(-x){} } } let xx=2;';
        let parsedCode=parseCodeLocation(code);
        let symbolized = symbolizeCode(code,parsedCode);
        assert.equal(JSON.stringify(symbolized[0]).replace(/\s/g, '')
            ,'["letd=2,g=5;functionfoo(x,y,z){leta;letb,c;if(x>4){while(-x){}}}letxx=2;"]'.replace(/\s/g, ''));});
    it('is generating function parameters', () => {
        let code='let d=2,g=5; function foo(x, y, z){ let a; let b,c; if(x>4){ while(-x){} } else { while(x){} } } let xx=2;';
        let parsedCode=parseCodeLocation(code);
        let symbolized = symbolizeCode(code,parsedCode);
        assert.equal(JSON.stringify(symbolized[0]).replace(/\s/g, '')
            ,'["letd=2,g=5;functionfoo(x,y,z){leta;letb,c;if(x>4){while(-x){}}else{while(x){}}}letxx=2;"]'.replace(/\s/g, ''));});
});

describe('test table', () => {

    it('is generating function parameters', () => {
        let code='function foo(x, y, z){ \n' +
            'let a = x + 1; \n' +
            'let b = a + y; \n' +
            '\n' +
            'let c = 0;\n' +
            ' let d;\n' +
            ' d;\n' +
            ' let t;\n' +
            ' let cc=t;\n' +
            'cc=2;\n' +
            'return z; }';
        let parsedCode=parseCodeLocation(code);
        let symbolized = symbolizeCode(code,parsedCode);
        assert.equal(JSON.stringify(symbolized[0]).replace(/\s/g, '')
            ,'["functionfoo(x,y,z){","","","","","","","","","","returnz;}"]'.replace(/\s/g, ''));});

});

describe('test table', () => {
    it('is generating function parameters', () => {
        let code='function foo(x,y){\n' +
            '\tif(x>4){\n' +
            '\t}\n' +
            '\telse{\n' +
            '\t\twhile(x){\n' +
            '\t\treturn 4;\n' +
            '\t\t}\n' +
            '\t\treturn 2;\n' +
            '\t}\n' +
            '\treturn 4;\n' +
            '}';
        let parsedCode=parseCodeLocation(code);
        let symbolized = symbolizeCode(code,parsedCode);
        assert.equal(JSON.stringify(symbolized[0]).replace(/\s/g, '')
            ,'["functionfoo(x,y){","\\tif(x>4){","\\t}","\\telse{","\\t\\twhile(x){","\\t\\treturn4","\\t\\t}","\\t\\treturn2","\\t}","\\treturn4;","}"]'.replace(/\s/g, ''));});

});





