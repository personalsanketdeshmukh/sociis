firstapp.controller('selectFromTableCtrl', function ($scope, $window, TemplateService, NavigationService, $timeout, $state, $stateParams, $filter, toastr) {
    var i = 0;
    $scope.getValues = function (filter, insertFirst) {

        var dataSend = {
            keyword: $scope.search.modelData,
            filter: filter,
            page: 1
        };
        if (dataSend.keyword === null || dataSend.keyword === undefined) {
            dataSend.keyword = "";
        }
        NavigationService[$scope.api](dataSend, ++i, function (data) {
            if (data.value) {
                $scope.list = data.data.results;
                if ($scope.search.modelData) {
                    $scope.showCreate = true;
                    _.each($scope.list, function (n) {
                        // if (n.name) {
                        if (_.lowerCase(n.name) == _.lowerCase($scope.search.modelData)) {
                            $scope.showCreate = false;
                            return 0;
                        }
                        // }else{
                        //     if (_.lowerCase(n.officeCode) == _.lowerCase($scope.search.modelData)) {
                        //       $scope.showCreate = false;
                        //       return 0;
                        //   }
                        // }

                    });
                } else {
                    $scope.showCreate = false;

                }
                if (insertFirst) {
                    if ($scope.list[0] && $scope.list[0]._id) {
                        // if ($scope.list[0].name) {
                        $scope.sendData($scope.list[0]._id, $scope.list[0].name);
                        // }else{
                        //   $scope.sendData($scope.list[0]._id, $scope.list[0].officeCode);
                        // }
                    } else {
                        console.log("Making this happen");
                        // $scope.sendData(null, null);
                    }
                }
            } else {
                console.log("Making this happen2");
                $scope.sendData(null, null);
            }


        });
    };


    $scope.search = {
        modelData: ""
    };

    $scope.listview = false;
    $scope.showCreate = false;
    $scope.typeselect = "";
    $scope.showList = function () {
        var areFiltersThere = true;
        var filter = {};
        if ($scope.filter) {
            filter = JSON.parse($scope.filter);
        }
        var filterName = {};
        if ($scope.filterName) {
            filterName = JSON.parse($scope.filterName);
        }

        function getName(word) {
            var name = filterName[word];
            if (_.isEmpty(name)) {
                name = word;
            }
            return name;
        }

        if (filter) {
            _.each(filter, function (n, key) {
                if (_.isEmpty(n)) {
                    areFiltersThere = false;
                    toastr.warning("Please enter " + getName(key));
                }
            });
        }
        if (areFiltersThere) {
            $scope.listview = true;
            $scope.searchNew(true);
        }
    };
    $scope.closeList = function () {
        $scope.listview = false;
    };
    $scope.closeListSlow = function () {
        $timeout(function () {
            $scope.closeList();
        }, 500);
    };
    $scope.searchNew = function (dontFlush) {
        if (!dontFlush) {
            $scope.model = "";
        }
        var filter = {};
        if ($scope.filter) {
            filter = JSON.parse($scope.filter);
        }
        $scope.getValues(filter);
    };
    $scope.createNew = function (create) {
        var newCreate = $filter("capitalize")(create);
        var data = {
            name: newCreate
        };
        if ($scope.filter) {
            data = _.assign(data, JSON.parse($scope.filter));
        }
        NavigationService[$scope.create](data, function (data) {
            if (data.value) {
                toastr.success($scope.name + " Created Successfully", "Creation Success");
                $scope.model = data.data._id;
                $scope.ngName = data.data.name;
            } else {
                toastr.error("Error while creating " + $scope.name, "Error");
            }
        });
        $scope.listview = false;
    };
    $scope.sendData = function (val, name) {
        $scope.search.modelData = name;
        $scope.ngName = name;
        $scope.model = val;
        $scope.listview = false;
    };
    $scope.$watch('model', function (newVal, oldVal) {
        if ($scope.model) {
            if (_.isObject($scope.model)) {
                $scope.sendData($scope.model._id, $scope.model.name);
            }
        }
    });
})