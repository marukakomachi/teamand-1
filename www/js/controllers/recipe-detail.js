app.controller('RecipeDetailController', 
    [
        '$scope', 
        'MyDBService', 
        'AnswerData', 
        function($scope, MyDBService, AnswerData) {

    var target = AnswerData.get();

    loadData();

    // データ読込処理
    function loadData() {
        // レシピからの食知見を取得
        MyDBService.connect().then(
            function(db) {
                console.log("GET ALL KNOWLEDGE : " + target.col_name);
                var mainTable = new RecipeCls(target.col_id);
                var subTable = new TroubleCls();
                var relationTable = new RelationRecTroCls();
                return MyDBService.getAllKnowledge(db, mainTable, subTable, relationTable);
            }
        ).then(
            function(resultList) {
                // 検索結果を画面に設定する（１件のはず）
                $scope.data = resultList[0];
                $scope.data.tagList = [];
                
                var tagInfos = $scope.data.tags.split(",");
                tagInfos.forEach(function(tagInfo){
                    var t = tagInfo.split(":");
                    $scope.data.tagList.push({col_id: t[0], col_name: t[1]});
                });
            }
        );      
    };
    
    // 悩み詳細ページへの遷移 
    $scope.showTroubleDetailPage = function(trouble_data) {
        AnswerData.set(trouble_data);
        myNavigator.pushPage('trouble-detail.html');
    }
}]);