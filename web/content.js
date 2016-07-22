'use strict';

/* 
* Author: Daniel Clark
* 
* NOTE TO READERS
* If you are files in the dist folder, this is transpiled code.
* The original source is in the src folder.
*
* Milestone 1: Have a static mockup website. 
*              Completed
* 
* Milestone 2: Static tiles view added. Icons have tooltips. Table gets data dynamically. Estimate: 2-4 hours
*              Completed except for tooltips.
* 
* Milestone 3: Tiles get data dynamically. Sorting added to table view. Estimate 2-4 hours
*              Completed. Tooltips added. Table sorts. Modal implemented.
*                         Displayed sort glyphs for bonus, because it made sense to do it now.
*
* Milestone 4: Cookies added. Tests and Layout cleaned up. Estimate 2-6 hours
*              Completed. All pure functions except for HTML generators have tests.
*                         Fixed up display of sort glyphs according to new info in class.
*                         Layout for tile view now includes placeholder image.
*/

/* global $ Cookies */

let tblSpec = {
    // order of columns in table
    // these may either by real properties or pseudo-properties
    // if a pseudo-property is defined, a mapper must be defined to produce it
    // for a pseudo-property, you must also define a custom comparator and write it into genCmp
    "order": ["fullName", "startDate", "year",
            "street", "city", "state", "zip", "phone"],
    
    "labels": {
        "fullName"  : "Name",
        "startDate" : "Start Date",
        "year"      : "Year",
        "street"    : "Street",
        "city"      : "City",
        "state"     : "State",
        "zip"       : "Zip",
        "phone"     : "Phone"
    },
    
    // tranforms for if data should be displayed different than model
    "mappers": {
        "year"     : s => nameForYear(s.year),     // real property
        "fullName" : s => s.fname + ' ' + s.lname  // pseudo property
    },
    
    // mapping of which comparator type to use for which column.
    // comparators for real properties use original, not transformed, property values.
    // compares strings after lowercasing them if not defined.
    "comparators": {
        "fullName"  : "fullName",
        "year"      : "number",
        "zip"       : "number",
        "startDate" : "date"
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

function nameForYear(year) {
    let names = ['Freshman', 'Sophomore', 'Junior', 'Senior'];
    return names[year - 1];
}

// factory method for comparators
function genCmp(attr, type) {
    /* global cmpNumber cmpFullName cmpDate cmpName */
    
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

function genHead(spec) {
    let html = "<thead><tr>";
    
    let cells = 
        spec.order.map((idx) => {
            return `
                <th id='${idx}-head'>
                ${spec.labels[idx]}&nbsp;
                <span id='${idx}-glyph' class='sort-glyph glyphicon ${spec.sortIcon[idx]}'></span>
                </th>`;
        });
    
    html += cells.join("");
    html += "</tr></thead>";
    
    return html;
}

function genRow(student) {
    let html = "<tr>";
    
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

function populateTiles(students) {
    let tiles = students.map(genTile);
    $("#student-tiles").append(tiles.join(''));
}

// populates head then uses repopTable() to populate body
function populateTable(students) {
    let tbl = $("#student-tbl");
    tbl.append(genHead(tblSpec));
    
    repopTable(students);
}

// handles population and repopulation of body
function repopTable(students) {
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
    data.sort(cmp);
    if (!asc) data.reverse();
}

function addSorting(students, watcher) {
    // add click handler to each table header
    for (let idx of tblSpec.order) {
        $(`#${idx}-head`).click(() => {
            
            // show modal
            $("#spinner-modal").modal({
                backdrop: "static",
                keyboard: false
            });
            
            // do sort
            // ascending only if the column isn't already sorted that way
            let asc = !watcher.isSortedBy(idx);
            sortData(students, idx, asc);
            
            // do sorting and hide modal after delay
            setTimeout(() => {
                repopTable(students);
                watcher.sortedBy(idx, asc);
                
                $("#spinner-modal").modal("hide");
            }, 1000);
            
        }); // end of click handler
    } // end for
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

class Watcher {
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

function render(students) {
    let view = Cookies.get("view");
    showView(view);
    if (view === "tiles") $("#opt-tiles").button("toggle")
    
    populateTiles(students); // done before sorting
    
    let sortIdx = Cookies.get("sort-idx");
    let sortAsc = Cookies.get("sort-asc") === "true";
    
    if (sortIdx) sortData(students, sortIdx, sortAsc);
    
    populateTable(students);
    
    let watcher = new Watcher();
    addSorting(students, watcher);
    
    if (sortIdx) watcher.sortedBy(sortIdx, sortAsc);
     
    $("a.thumbnail").click(function() {
        $("a.thumbnail").removeClass("active");
        $(this).addClass("active");
    });
}

$(document).ready(() => {
    if (window.TESTING) return;
    
    $.getJSON("/api/students", (result) => {
        render(result);
    });
    
    $("#opt-table").click(() => {
        showView("table");
    }).tooltip();
    
    $("#opt-tiles").click(() => {
        showView("tiles");
    }).tooltip();
});
