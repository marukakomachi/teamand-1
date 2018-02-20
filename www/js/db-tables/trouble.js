// テーブル：悩み
var TroubleCls = (function () {
    // コンストラクタ
    function TroubleCls(id, name, knowledge, effect, imgPath) {
        // 親クラスのコンストラクタ呼び出し
        BaseTableCls.call(this, "trouble", id);

        // カラム
        this.col_name = name;
        this.col_knowledge = knowledge;
        this.col_effect = effect;
        this.col_imgPath = imgPath;
    }

    // configure prototype
    TroubleCls.prototype = new BaseTableCls();
    TroubleCls.prototype.constructor = TroubleCls;

    return TroubleCls; // return constructor
})();