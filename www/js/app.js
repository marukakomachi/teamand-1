// This is a JavaScript file
var tasks = {
  dbName: "eatCheck", //dbの名前
  dbVersion: 2,       //dbのバージョン
  db: null            //dbをここに入れます
};

//init用メソッド
tasks.init = function() {
    var request = indexedDB.open(tasks.dbName,tasks.dbVersion); //dbに接続
    var tableName = 'recipe';
    
    request.onupgradeneeded = function(event) { //dbversionが引数よりも小さい場合、アップグレード。ない場合は作成。
        var createdb = event.target.result;
        createdb.onerror = function(event) { //エラー処理
            alert("DBの作成に失敗しました。");
        };
        
        if(createdb.objectStoreNames.contains(tableName)) { //アップデートする際、同名のオブジェクトがあるとアップデートできないため、データを削除。データのマージに関しては、今後記事にします。
            createdb.deleteObjectStore(tableName);
        }
        
        var objectStore = createdb.createObjectStore(tableName, { keyPath: "r_cd", autoIncrement: true }); //オブジェクトストアの作成
        objectStore.createIndex("name", "name", { unique: false }); //インデックスの作成
        objectStore.createIndex("memo", "memo", { unique: false }); //インデックスの作成
        
        alert("DBを作成しましたので、ページを更新します。");
        location.reload(); //作成した後、ページを更新する必要があります。
    };

    request.onsuccess = function(event) { //アップデートが必要なく、接続できた場合の処理
        tasks.db = event.target.result;
        alert("DBに接続成功");
    };
    
    var transaction = tasks.db.transaction(tableName,"readwrite"); //処理用のトランザクションを作ります。
    var recipeStore = transaction.objectStore(tableName); //オブジェクトストアにアクセスします。
    var request = recipeStore.put({ //オブジェクトストアに追加のリクエストします。
        name: 'TEST1', memo: 'MEMOMEMO'
    });
    transaction.oncomplete = function() { //追加成功の処理
        alert('レコード保存成功');
    };
};

// リスト表示処理
document.addEventListener('show',function(event){
    var page = event.target;
    if(page.id == 'male') {
        var list = page.querySelector('#memoList')
        
        var db = tasks.db;
        var transaction = db.transaction("recipe","readonly");
        var objectStore = transaction.objectStore("recipe");
        var request = objectStore.openCursor();
        request.onsuccess = function(event) {
            var cursor = event.target.result;
            if(cursor) {
                alert('READ 1');
                ons.createElement('<ons-list-item>' + cursor.toString() + '</ons-list-item>', {append:list});
                cursor.continue();
            }
        };
    }
});


(function(){
    tasks.init();
})();
