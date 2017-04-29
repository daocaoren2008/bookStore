var controllers = angular.module('appModule.controller', []);
controllers.controller('homeCtrl', ['$scope', '$sce', function ($scope, $sce) {
    $scope.note = $sce.trustAsHtml('<h1>欢迎来到我的书店！</h1>')
}]);
controllers.controller('addCtrl', ['$scope','Books','$location', function ($scope, Books, $location) {
    $scope.addBook = function () {
        var obj = {bookName: $scope.bookName, bookPrice: $scope.bookPrice, bookCover: $scope.bookCover};
        Books.save(obj).$promise.then(function (data) {
            $location.path('/list');
        });
    }
}]);
controllers.controller('listCtrl', ['$scope', 'Books', function ($scope, Books) {
    $scope.books = Books.query();
}]);
controllers.controller('detailCtrl', ['$scope', '$routeParams', 'Books', function ($scope, $routeParams, Books,$location) {
    $scope.flag = true;
    var id = $routeParams.id;
    $scope.book = Books.get({id: id});
    $scope.delete = function () {
        Books.remove({id: id}).$promise.then(function () {//发送请求会默认拼上/book/
            $location.path('/list');
        })
    };
    $scope.changeFlag = function () {
        $scope.flag = !$scope.flag;
        $scope.temp = JSON.parse(JSON.stringify($scope.book));
    };
    $scope.cancel = function () {
        $scope.flag = !$scope.flag;
    };
    $scope.update = function () {
        Books.update({id:id},$scope.temp).$promise.then(function () {
            $scope.flag = true;
            $scope.book = $scope.temp;
        })
    }

}]);
