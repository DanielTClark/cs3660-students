'use strict';
/* Author: Daniel Clark */
/* global $ Cookies angular */

const PAGE_SIZE = 10;

const tblSpec = {
    // order of columns in table
    // these may be generated properties, but must have a mapper defined if they are
    headers: ["fullName", "startDate", "year",
            "street", "city", "state", "zip", "phone"],
    
    labels: {
        fullName  : "Name",
        startDate : "Start Date",
        year      : "Year",
        street    : "Street",
        city      : "City",
        state     : "State",
        zip       : "Zip",
        phone     : "Phone"
    },
    
    // transforms for if data should be displayed different than model
    mappers: {
        fullName  : s => s.fname + ' ' + s.lname,  // generated property
        startDate : s => formatDate(s.startDate, "MDY"),
        year      : s => nameForYear(s.year)     // real property
    }
};

let app = angular.module("studentsApp", ['ngCookies', 'ngMaterial', 'md.data.table']);

app.controller('studentsCtrl', ['$scope', '$http', '$cookies', '$mdDialog',
($scope, $http, $cookies, $mdDialog) => {
    $scope.tblSpec = tblSpec;
    $scope.students = [];
    $scope.deletedStudents = [];
    $scope.selected = [];

    $scope.sortedBy = 'fullName';
    $scope.reverseSort = false;

    let mode = $cookies.get('tabIdx');
    $scope.tabIdx = mode ? mode : 0;

    $scope.nameForYear = nameForYear;
    $scope.formatDate = formatDate;

    $http.get('/api/v1/students.json').then(res => {
        let list = res.data.slice(0, 10);
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

    $scope.saveTab = idx => {
        $cookies.put('tabIdx', idx);
    };

    $scope.getterFor = header => {
        if (header[0] === '-') {
            header = header.slice(1);
            $scope.orderDesc = true;
        } else {
            $scope.orderDesc = false;
        }

        return student => {
            switch (header) {
                case 'fullName': return student.lname + ' ' + student.fname;
                default: return student[header];
            }
        };
    };

    $scope.studentToRow = student => {
        return tblSpec.headers.map((idx) => {
            // if mapping function is present, use it, else just get the named attribute
            let transform = tblSpec.mappers[idx] ?
                tblSpec.mappers[idx] :
                () => student[idx];

            return transform(student);
        });
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

}]);

app.directive("mdCardColumns", ['$mdMedia', ($mdMedia) => {
    return {
        restrict: 'E',
        scope: { 'repeat': '=', 'edit': '=', 'delete': '=' },
        templateUrl: 'md-columns.html',
        link: (scope, element, attrs, ctrl, transclude) => {
            scope.repeatItem = attrs.repeatItem;

            scope.columns = () => {
                if ($mdMedia('lg')) return [0,1,2];
                if ($mdMedia('md')) return [0,1];
                if ($mdMedia('sm')) return [0];
                if ($mdMedia('xs')) return [0];
            };

            scope.data = (idx) => {
                let size = scope.repeat.length;
                let c = scope.columns().length;
                let part = Math.ceil(size / c);
                return scope.repeat.slice(idx * part, (idx + 1) * part);
            };
        }
    };
}]);

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

