app.controller('RecipeListController', 
    [   '$scope', 
        'MyDBService', 
        'AnswerData', 
        function($scope, MyDBService, AnswerData) {

    loadList();

    // リスト読込処理
    function loadList() {
        // リスト取得
        MyDBService.connect().then(
            function(db) {
                // RECIPEテーブルを全件検索
                return MyDBService.select(db, new RecipeCls());
            }
        ).then(
            function(resultList) {
                // 検索結果を画面に設定する
                $scope.results = resultList;
            }
        );
    };

    // 詳細ページへの遷移 
    $scope.showDetailPage = function(data) {
        AnswerData.set(data);
        myNavigator.pushPage('recipe-detail.html');
    }

}]);