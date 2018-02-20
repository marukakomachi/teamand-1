// テーブル：レシピー悩みリレーション
var RelationRecTroCls = (function () {
    // コンストラクタ
    function RelationRecTroCls(id, recipe_id, trouble_id) {
        // 親クラスのコンストラクタ呼び出し
        BaseTableCls.call(this, "relation_rec_tro", id);

        // カラム
        this.col_recipe_id = recipe_id;
        this.col_trouble_id = trouble_id;
    }

    // configure prototype
    RelationRecTroCls.prototype = new BaseTableCls();
    RelationRecTroCls.prototype.constructor = RelationRecTroCls;

    return RelationRecTroCls; // return constructor
})();