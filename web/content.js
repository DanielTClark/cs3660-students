'use strict';

/* 
Author: Daniel Clark

*/

/* global $ Cookies */

const PAGE_SIZE = 10;

let tblSpec = {
    // order of columns in table
    // these may either by real properties or pseudo-properties
    // if a pseudo-property is defined, a mapper must be defined to produce it
    // for a pseudo-property, you must also define a custom comparator and write it into genCmp
    "order": ["fullName", "startDate", "year",
            "street", "city", "state", "zip", "phone",
            "edit", "delete"],
    
    "labels": {
        "fullName"  : "Name",
        "startDate" : "Start Date",
        "year"      : "Year",
        "street"    : "Street",
        "city"      : "City",
        "state"     : "State",
        "zip"       : "Zip",
        "phone"     : "Phone",
        "edit"      : "",
        "delete"    : ""
    },
    
    // tranforms for if data should be displayed different than model
    "mappers": {
        "startDate" : genDateCol,
        "year"      : s => nameForYear(s.year),     // real property
        "fullName"  : s => s.fname + ' ' + s.lname,  // pseudo property
        "edit"      : genEditCol,
        "delete"    : genDelCol
    },
    
    // mapping of which comparator type to use for which column.
    // comparators for real properties use original, not transformed, property values.
    // compares strings after lowercasing them if not defined.
    "comparators": {
        "fullName"  : "fullName",
        "year"      : "number",
        "zip"       : "number",
        "startDate" : "date",
        "edit"      : "none",
        "delete"    : "none"
    },
    
    "sortIcon": {
        "fullName"  : "glyphicon-sort-by-alphabet",
        "startDate" : "glyphicon-sort-by-attributes",
        "year"      : "glyphicon-sort-by-attributes",
        "street"    : "glyphicon-sort-by-alphabet",
        "city"      : "glyphicon-sort-by-alphabet",
        "state"     : "glyphicon-sort-by-alphabet",
        "zip"       : "glyphicon-sort-by-order",
        "phone"     : "glyphicon-sort-by-order"
    }
};

class SortWatcher {
    constructor() {
        this.sortIdx = null;
        this.ascending = true;
    }
    
    isSortedBy(idx, asc = true) {
        if (this.sortIdx === idx) {
            return asc === this.ascending;
        }
        
        return false;
    }
    
    sortedBy(idx, asc) {
        this.sortIdx = idx;
        this.ascending = asc;

        // hide all sort glyphs then show the one on the sorted column
        $(".sort-glyph").css("visibility", "hidden");
        showSortGlyph(idx, asc);
        
        // set sorting cookies
        Cookies.set("sort-idx", idx, {expires: 30});
        Cookies.set("sort-asc", asc, {expires: 30});
    }
}

let students = [];
let watcher = new SortWatcher();
let editMode = "create";

function nameForYear(year) {
    let names = ['Freshman', 'Sophomore', 'Junior', 'Senior'];
    return names[year - 1];
}

// factory method for comparators
function genCmp(attr, type) {
    /* global cmpNumber cmpFullName cmpDate cmpName */
    if (type === 'none') return undefined;
    
    return (a, b) => {
        let x = a[attr]; // x and y will be undefined for pseudo-properties
        let y = b[attr];
        
        switch (type) {
            case 'fullName' : return cmpFullName(a, b);
            case 'number'   : return cmpNumber(x, y);
            case 'date'     : return cmpDate(x, y);
            default         : return cmpName(x, y);
        }
    };
}

function genHead() {
    let html = "<thead><tr>";
    
    let cells = 
        tblSpec.order.map((idx) => {
            let html = `<th id='${idx}-head'>${tblSpec.labels[idx]}`;
            if (tblSpec.comparators[idx] !== "none") {
                html += `&nbsp;<span id='${idx}-glyph' class='sort-glyph glyphicon ${tblSpec.sortIcon[idx]}'></span>`;
            }
            html += '</th>';
            return html;
        });
    
    html += cells.join("");
    html += "</tr></thead>";
    
    return html;
}

function genRow(student) {
    let html = `<tr id='row-${student.id}'>`;
    
    let data = tblSpec.order.map((idx) => {
        // if mapping function is present, use it, else just get the named attribute
        let transform = tblSpec.mappers[idx] ?
                        tblSpec.mappers[idx] :
                        () => student[idx];
        
        return transform(student);
    });
    
    html += data.map(d => `<td>${d}</td>`)
                .join('');
    
    html += "</tr>";
    return html;
}

function genDateCol(student) {
    let date = new Date(student.startDate);
    return date.toDateString();
}

function genEditCol(student) {
    return `
        <button id='edit-${student.id}-btn' type='button' class='btn btn-primary edit-btn'>
            <span class="glyphicon glyphicon-edit"></span>
        </button>`;
}

function genDelCol(student) {
    return `
        <button id='del-${student.id}-btn' type='button' class='btn btn-primary del-btn'>
            <span class="glyphicon glyphicon-trash"></span>
        </button>`;
}

function genTile(student) {
    return `
        <div class='col-xs-6 col-md-4 col-lg-3'>
            <div class='dummy'></div>
            <a class='thumbnail'>
                <div>
                    <img src='//placekitten.com/60/60' class='right img-rounded'>
                    <h3>${student.fname} ${student.lname}</h3>
                </div>
                
                <p>${nameForYear(student.year)}, Started ${student.startDate}</p>
                
                <p>${student.phone}</p>
                
                <p>${student.street}<br />
                ${student.city} ${student.state}, ${student.zip}</p>
            </a>
        </div>`;
}

function populateTiles() {
    let tiles = students.map(genTile);
    $("#student-tiles").append(tiles.join(''));
}

// populates head then uses repopTable() to generate an empty body
function initTable() {
    let tbl = $("#student-tbl");
    tbl.append(genHead());
    tbl.append("<tbody>");
}

// handles population and repopulation of body
function repopTable() {
    let tbl = $("#student-tbl");
    
    tbl.find("tbody").remove();
    tbl.append("<tbody>");
    
    let rows = students.map(genRow);
    
    for (let r of rows) {
        tbl.find("tbody").append(r);
    }
}

function showSortGlyph(idx, asc) {
    let glyph = $(`#${idx}-glyph`);
    glyph.css('visibility', 'visible');
    
    let clsAsc = tblSpec.sortIcon[idx];
    let clsDesc = clsAsc + '-alt';
    
    if (asc) {
        glyph.removeClass(clsDesc);
        glyph.addClass(clsAsc);
    } else {
        glyph.removeClass(clsAsc);
        glyph.addClass(clsDesc);
    }
}

function sortData(data, idx, asc = true) {
    let type = tblSpec.comparators[idx];
    let cmp = genCmp(idx, type);
    
    if (cmp === undefined) return;
    
    data.sort(cmp);
    if (!asc) data.reverse();
    
    watcher.sortedBy(idx, asc);
}

function addSorting() {
    // add click handler to each table header
    for (let idx of tblSpec.order) {
        $(`#${idx}-head`).click(() => {
            let asc = !watcher.isSortedBy(idx);
            sortData(students, idx, asc);
            repopTable(students);
        });
    }
}

function addEditing() {
    // uses 'students' global
    for (let s of students) {
        $(`#edit-${s.id}-btn`).click(function(event) {
            startEdit(s);
        });
        
        $(`#del-${s.id}-btn`).click(function(event) {
            console.log("DELETE clicked");
            sendDelete(s);
        });
    }
}

function startEdit(student) {
    
}

function sendCreate(student) {
    $.post('/api/v1/students', student, (data) => {
        student.id = data;
        addStudent(student);
    }, 'json');
}

function sendUpdate(student) {
    if (!student.id) throw "Student ID not set";
    $.ajax({
        url: `/api/v1/students/${student.id}.json`,
        type: 'PUT',
        success: updateRow,
        data: student,
        contentType: 'json'
    });
    
    function updateRow() {
        console.log(`successful UPDATE of ${student.id}`);
    }
}

function sendDelete(student) {
    if (!student.id) throw "Student ID not set";
    $.ajax({
        url: `/api/v1/students/${student.id}.json`,
        type: 'DELETE',
        success: deleteRow,
        data: '',
        contentType: 'json'
    });
    
    function deleteRow() {
        console.log(`successful DELETE of ${student.id}`);
    }
}

function showView(view) {
    if (view === "table") {
        $("#student-tiles").hide();
        $("#student-tbl").show();
        
        Cookies.set("view", "table", {expires: 30});
    } else if (view === "tiles") {
        $("#student-tbl").hide();
        $("#student-tiles").show();
        
        Cookies.set("view", "tiles", {expires: 30});
    }
}

function addStudent(student) {
    students.push(student);
    $('#student-tbl tbody').append(genRow(student));
    $('#student-tiles').append(genTile(student));
}

function finishRender() {
    let sortIdx = Cookies.get("sort-idx");
    let sortAsc = Cookies.get("sort-asc") === "true";
    
    addSorting();
    
    if (sortIdx) {
        sortData(students, sortIdx, sortAsc);
        repopTable();
    }
    
    addEditing();
    
    $("a.thumbnail").click(function() {
        $("a.thumbnail").removeClass("active");
        $(this).addClass("active");
    });
}

$(document).ready(() => {
    if (window.TESTING) return;
    
    let view = Cookies.get('view');
    showView(view ? view : 'table');
    if (view === 'tiles') $('#opt-tiles').button('toggle');
    
    initTable(); // init table with no entries
    
    $.getJSON('/api/v1/students.json', (result) => {
        result = result.slice(0, PAGE_SIZE);
        
        let count = 0;
        
        for (let id of result) {
            $.getJSON(`/api/v1/students/${id}.json`, (s) => {
                s.id = id;
                addStudent(s);
                
                if (++count === result.length) {
                    finishRender();
                }
            });
        }
    });
    
    $("#opt-table").click(() => {
        showView("table");
    }).tooltip();
    
    $("#opt-tiles").click(() => {
        showView("tiles");
    }).tooltip();
    
    $('#create-form').submit(function(event) {
        let formData = $(this).serializeArray();
        let stu = {};
        
        for (let pair of formData) {
            stu[pair.name] = pair.value;
        }
        
        switch (editMode) {
            case "create": 
                sendCreate(stu);
                break;
            case "edit": 
                sendUpdate(stu);
                break;
        }
        
        $("#create-modal").modal('hide');
        
        event.preventDefault();
    });
    
    $('#add-button').click(function(event) {
        editMode = "create";
        $('#create-modal').modal();
    });
});
