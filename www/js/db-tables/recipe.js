// テーブル：レシピ
var RecipeCls = (function () {
    // コンストラクタ
    function RecipeCls(id, name, knowledge, effect, imgPath) {
        // 親クラスのコンストラクタ呼び出し
        BaseTableCls.call(this, "recipe", id);

        // カラム
        this.col_name = name;
        this.col_knowledge = knowledge;
        this.col_effect = effect;
        this.col_imgPath = imgPath;
    }

    // configure prototype
    RecipeCls.prototype = new BaseTableCls();
    RecipeCls.prototype.constructor = RecipeCls;

    return RecipeCls; // return constructor
})();