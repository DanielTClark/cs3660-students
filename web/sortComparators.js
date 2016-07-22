'use strict';

function basicCmp(a, b) {
    if (a < b) return -1;
    if (a > b) return  1;
    return 0;
}

function cmpName(a, b) {
    let x = a.toLowerCase();
    let y = b.toLowerCase();
    
    return basicCmp(x, y);
}

function cmpNumber(a, b) {
    return basicCmp(a, b);
}

function cmpDate(a, b) {
    let x = Date.parse(a);
    let y = Date.parse(b);
    
    return basicCmp(x, y);
}

// takes student objects
function cmpFullName(a, b) {
    let lastOrd = cmpName(a.lname, b.lname);
    if (lastOrd === 0) {
        return cmpName(a.fname, b.fname);
    }
    
    return lastOrd;
}

