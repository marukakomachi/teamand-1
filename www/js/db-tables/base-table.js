function BaseTableCls(tableName, id) {
    this.table_name = tableName;

    // ID (オートインクリメント用)
    this.col_id = id;

    // カラムリストを返す
    this.getColumns = function() {
        var columns = [];

        // 自身の中で"col_"から始まるのだけ抽出する
        for (var p in this) {
            if (p.toLowerCase().indexOf("col_") == 0) {
                columns.push(p);
            }
        }

        return columns;
    }

    // IDを除いたカラムリストを返す
    this.getColumnsIgnoreId = function() {
        var columns = [];

        // 自身の中で"col_"から始まるのだけ抽出する
        // ただしIDは除く
        for (var p in this) {
            if (p.toLowerCase().indexOf("col_") == 0 && p.toLowerCase() != "col_id") {
                columns.push(p);
            }
        }

        return columns;
    }

    // 値リストを返す
    this.getValues = function() {
        var values = [];

        // 自身の中で"col_"から始まるのだけ抽出する
        for (var p in this) {
            if (p.toLowerCase().indexOf("col_") == 0) {
                values.push(this[p]);
            }
        }

        return values;
    }

    // IDを除いた値リストを返す
    this.getValuesIgnoreId = function() {
        var values = [];

        // 自身の中で"col_"から始まるのだけ抽出する
        // ただしIDは除く
        for (var p in this) {
            if (p.toLowerCase().indexOf("col_") == 0 && p.toLowerCase() != "col_id") {
                values.push(this[p]);
            }
        }

        return values;
    }
}