'use strict';
/* Author: Daniel Clark */
/* global $ Cookies angular */

const PAGE_SIZE = 10;

const tblSpec = {
    // order of columns in table
    // these may be generated properties, but must have a mapper defined if they are
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
    
    // transforms for if data should be displayed different than model
    "mappers": {
        "startDate" : s => formatDate(s.startDate, "MDY"),
        "year"      : s => nameForYear(s.year),     // real property
        "fullName"  : s => s.fname + ' ' + s.lname  // generated property
    }
};

//TODO
//Support for cookies
//Add tooltips to edit, del and view buttons
//Interface with server

let app = angular.module("studentsApp", ['ngCookies', 'ngMaterial', 'md.data.table']);

app.controller('studentsCtrl', ['$scope', '$http', '$cookies', '$mdDialog',
($scope, $http, $cookies, $mdDialog) => {
    $scope.tblSpec = tblSpec;
    $scope.students = [];
    $scope.deletedStudents = [];
    $scope.selected = [];

    $scope.sortedBy = 'fullName';
    $scope.reverseSort = false;

    let mode = $cookies.get('view');
    $scope.viewMode = mode ? mode : 'table';

    $scope.nameForYear = nameForYear;
    $scope.formatDate = formatDate;

    $scope.editingStudent = {};

    $http.get('/api/v1/students.json').then(res => {
        let list = res.data.slice(0, 12);
        list.forEach((id) => {
            $http.get(`/api/v1/students/${id}.json`).then(res => {
                let student = res.data;
                student.id = id;
                student.year = student.year.toString();
                student.startDate = new Date(student.startDate);
                $scope.students.push(student);
            });
        });
    });

    $scope.sortBy = header => {
        if ($scope.sortedBy === header) {
            $scope.reverseSort = !$scope.reverseSort;
        } else {
            $scope.sortedBy = header;
            $scope.reverseSort = false;
        }
    };

    $scope.studentToRow = student => {
        return tblSpec.order.map((idx) => {
            // if mapping function is present, use it, else just get the named attribute
            let transform = tblSpec.mappers[idx] ?
                tblSpec.mappers[idx] :
                () => student[idx];

            return transform(student);
        });
    }

    $scope.getterFor = header => {
        return s => {
            switch(header) {
                case 'fullName' : return s.lname + s.fname;
                default: return s[header];
            }
        };
    };

    $scope.startEditStudent = stu => {
        $scope.editMode = 'update';
        let copy = JSON.parse(JSON.stringify(stu));
        copy.startDate = new Date(copy.startDate);
        $scope.editingStudent = copy;

        $('#create-modal').modal();
    };

    $scope.deleteStudent = stu => {
        let idx = $scope.students.findIndex(s => s.id === stu.id);

        $http.delete(`/api/v1/students/${stu.id}.json`).then(res => {
            $scope.deletedStudents.push(stu);
            $scope.students.splice(idx, 1);
        });
    };

    $scope.restoreStudent = () => {
        let stu = $scope.deletedStudents.pop();

        $http.post('/api/v1/students', stu).then(res => {
            console.log(res);
            stu.id = res.data;
            $scope.students.push(stu);
        }, err => {
            $scope.deletedStudents.push(stu);
        });
    };

    $scope.showEditDialog = (ev, student) => {
        $mdDialog.show({
            controller: EditDialogController(student),
            templateUrl: 'editDialog.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true
        }).then(student => {
            if (student.id) { // update existing student
                let idx = $scope.students.findIndex(s => s.id === student.id);
                if (idx < 0) return;
                $http.put(`/api/v1/students/${student.id}.json`, student).then(res => {
                    console.log(`Updated student ${student.id}`);
                    $scope.students[idx] = student;
                });
            } else { // add as new student
                $http.post('/api/v1/students', student).then(res => {
                    student.id = res.data;
                    $scope.students.push(student);
                    console.log(`Added student ${student.id}`);
                });
            }
        });
    };

    $scope.submitEditForm = () => {
        if ($scope.editMode === 'create') {
            $scope.students.push($scope.editingStudent);

            $http.post('/api/v1/students', $scope.editingStudent).then(res => {
                console.log(`Created student ${res}`);
                $('#create-modal').modal('hide');
            });

        } else if ($scope.editMode === 'update') {
            let idx = $scope.students.findIndex(s => s.id === $scope.editingStudent.id);
            let stu = $scope.students[idx] = $scope.editingStudent;
            $scope.editingStudent = {};

            $http.put(`/api/v1/students/${stu.id}.json`, stu).then(res => {
                console.log(`Updated student ${stu.id}`);
                $('#create-modal').modal('hide');
            });
        }
    };
}]);

function addStudent(student) {

}

function updateStudent(student) {

}

function EditDialogController(student) {
    return ($scope, $mdDialog) => {
        $scope.stu = student ? JSON.parse(JSON.stringify(student)) : {startDate: new Date()};
        $scope.stu.startDate = new Date($scope.stu.startDate);

        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.answer = function (answer) {
            $mdDialog.hide(answer);
        };
    };
}

function nameForYear(year) {
    let names = ['Freshman', 'Sophomore', 'Junior', 'Senior'];
    return names[year - 1];
}

function formatDate(dateString, type) {
    let date = new Date(dateString);
    let day = ("0" + date.getDate()).slice(-2);
    let month = ("0" + (date.getMonth() + 1)).slice(-2);
    let year = date.getFullYear();
    
    if (type == "YMD") return `${year}-${month}-${day}`;
    if (type == "MDY") return `${month}/${day}/${year}`;
}

