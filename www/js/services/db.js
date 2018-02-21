app.service('MyDBService', 
    [
        '$q', 
        '$timeout', 
        '$http',
        function($q, $timeout, $http){
    
    // サービスで取り扱うテーブル一覧(クラスで管理)
    var TABLES = [
            new RecipeCls(),
            new TroubleCls(),
            new RelationRecTroCls()
        ];
        
    // 初期化時に登録するデータ
    var INITIALIZE = [];
    // レシピデータ
    $http.get("table-data/recipes.json").then(function(response){
        response.data.forEach(function(data) {
            INITIALIZE.push(new RecipeCls(data.id, data.name, data.knowledge, data.effect, data.imgPath));    
        });
    });
    // 悩みデータ
    $http.get("table-data/troubles.json").then(function(response){
        response.data.forEach(function(data) {
            INITIALIZE.push(new TroubleCls(data.id, data.name, data.knowledge, data.effect, data.imgPath));    
        });
    });
    // リレーションデータ
    $http.get("table-data/relation-rec-tro.json").then(function(response){
        response.data.forEach(function(data) {
            INITIALIZE.push(new RelationRecTroCls(data.id, data.recipe_id, data.trouble_id));    
        });
    });

    // DBへの接続
    // DBに何らかの処理を行う際には、必ずこれを通す
    this.connect = function () {
        var deferred = $q.defer();

        $timeout(function(){
            console.log('Start connect');
            
            var name = 'localdb';
            var version = '1.0';
            var description = 'Web SQL Database for team AND';
            var size = 5 * 1024 * 1024;
            this.db = window.openDatabase(name, version, description, size);

            // テーブル作成 ---------------
            this.db.transaction( function(tx) {
                for (var id in TABLES) {
                    // リストにあるテーブルを作成していく
                    var tbl = TABLES[id];

                    // 一旦既存のがあったら削除する
                    var sql = 'DROP TABLE IF EXISTS '+ tbl.table_name;
                    //console.log(sql);
                    tx.executeSql(sql);

                    // 改めてテーブルを作成する
                    // オートインクリメントしない
                    //sql = 'CREATE TABLE IF NOT EXISTS '+ tbl.table_name +' (col_id integer primary key autoincrement, '+ tbl.getColumnsIgnoreId().join(',') +')';
                    sql = 'CREATE TABLE IF NOT EXISTS '+ tbl.table_name +' (col_id integer primary key, '+ tbl.getColumnsIgnoreId().join(',') +')';
                    //console.log(sql);
                    tx.executeSql(sql);
                }

                for (var data of INITIALIZE) {

                    //var params = data.getValuesIgnoreId();
                    var params = data.getValues();

                    // 値の数だけqueryを生成しておく
                    var query = [];
                    for (var p of params) {
                        query.push("?");
                    }

                    // データを投入する
                    //var sql = 'INSERT INTO '+ data.table_name +' ('+ data.getColumnsIgnoreId().join(',') +') VALUES ('+ query.join(',') +')';
                    var sql = 'INSERT INTO '+ data.table_name +' ('+ data.getColumns().join(',') +') VALUES ('+ query.join(',') +')';
                    //console.log(sql);
                    //console.log(JSON.stringify(params));
                    tx.executeSql(sql, params);
                }
            }, function(err){console.log("error : " + err.message);}
            );

            console.log('End connect');
            deferred.resolve(db);
        }, 0);

        return deferred.promise;
    };

    // 検索条件を元にデータを返す
    // db: conncectで取得したdbクラス
    // condtion: BaseTableClsのサブクラス
    this.select = function(db, condition) {
        var deferred = $q.defer();

        var resultList = [];

        $timeout(function(){
            db.readTransaction(
                function(tx){

                    var sql = 'SELECT * FROM '+ condition.table_name;
                    var columns = [];
                    var values = [];

                    // 条件オブジェクトで値が入っているものを条件として加える
                    for (var p in condition) {
                        if (p.toLowerCase().indexOf("col_") == 0 && condition[p]) {
                            columns.push(p);
                            values.push(condition[p]);
                        }
                    }

                    var whereSql = "";
                    if ( columns.length > 0 ) {
                        // 条件があった場合、WHERE句追加
                        whereSql = " WHERE ";
                        for (var i = 0; i < columns.length; i++) {
                            if (i > 0) {
                                // 1個以上の場合、AND追加
                                whereSql += " AND ";
                            }
                            whereSql += columns[i] + " = ?";
                        }

                        //console.log(whereSql);
                    }

                    sql += whereSql;

                    console.log("SQL : " + sql);

                    tx.executeSql(sql , values
                        , function(tx, rs){
                            // 成功時
                            for (var i = 0; i < rs.rows.length; i++) {
                                var row = rs.rows.item(i);

                                // 検索条件のコンストラクタからオブジェクト再生成
                                var Const = condition.constructor;
                                var data = new Const();

                                // 検索結果をオブジェクトに設定
                                for (var r in row) {
                                    data[r] = row[r];
                                }

                                resultList.push(data);
                            }                           

                            console.log("resultList.length: "+ resultList.length);
                            deferred.resolve(resultList);
                        }, function(tx, err) {
                            // SELECT失敗時
                            console.error("select 失敗: TBL="+ condition.table_name);
                            console.error(JSON.stringify(err));
                            deferred.resolve(null);
                        });
                }, 
                function(err){
                    // トランザクション失敗時
                    console.error("select TRANSACTION 失敗: TBL="+ condition.table_name);
                    console.error(err);
                }, 
                function(){
                    // トランザクション成功時
                    // console.log("select TRANSACTION 成功: TBL="+ condition.table_name);
                }
            );
        }, 0);

        return deferred.promise;
    }

    // レシピと悩みの双方から知見を取得する
    // 無理矢理感満載
    // db: conncectで取得したdbクラス
    // mainTable: 主体となるテーブル（レシピor悩み）
    // subTable: ひもづくテーブル（レシピor悩み）
    // relationTable: 関係テーブル
    this.getAllKnowledge = function(db, mainTable, subTable, relationTable) {
        var deferred = $q.defer();

        var resultList = [];

        $timeout(function(){
            db.readTransaction(
                function(tx){

                    var sql = 'SELECT a.col_id        as id \
                                    , a.col_name      as name \
                                    , a.col_effect    as effect \
                                    , a.col_knowledge as knowledge \
                                    , a.col_imgPath   as imgPath \
                                    , group_concat(b.col_tag) as tags\
                                 FROM ' + mainTable.table_name + ' a \
                                 LEFT OUTER JOIN ' + relationTable.table_name + ' r \
                                   ON a.col_id = r.col_' + mainTable.table_name + '_id \
                                 LEFT OUTER JOIN ( select col_id \
                                                        , col_id || ":" || col_name as col_tag \
                                                     from ' + subTable.table_name + ') b \
                                   ON b.col_id = r.col_' + subTable.table_name + '_id \
                                WHERE a.col_id = ? \
                                GROUP BY a.col_id';

                    //console.log("SQL : " + sql);
                    var values = [];
                    values.push(mainTable.col_id);

                    tx.executeSql(sql , values
                        , function(tx, rs){
                            // 成功時
                            for (var i = 0; i < rs.rows.length; i++) {
                                var row = rs.rows.item(i);
                                resultList.push(row);
                            }                           

                            console.log("resultList.length: "+ resultList.length);
                            deferred.resolve(resultList);
                        }, function(tx, err) {
                            // SELECT失敗時
                            console.error("SQL 失敗");
                            console.error(JSON.stringify(err));
                            deferred.resolve(null);
                        });
                }, 
                function(err){
                    // トランザクション失敗時
                    console.error("getKnowledge TRANSACTION 失敗: TBL="+ mainTable.table_name);
                    console.error(err);
                },
                function(){
                    // トランザクション成功時
                } 
            );
        }, 0);

        return deferred.promise;
    }

}]);