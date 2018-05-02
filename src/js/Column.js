class Column {
    constructor(id, head = null, rows = []) {
        this.id = id;
        this.head = head;
        this.rows = rows;
        this.width = this.head ? this.head.offsetWidth : 0;
        this.headHeight = this.head ? this.head.offsetHeight : 0;
        this.rowsHeights = [];
    }

    setHead(head) {
        if(head) {
            this.head = head;
        }
    }

    getHead() {
        return this.head || null;
    }

    setRows(rows) {
        if(rows) {
            this.rows = rows;

            this.rows.forEach(function(row) {
                this.rowsHeights.push(row.offsetHeight);
            }.bind(this));
        }
    }

    getRows() {
        return this.rows.length ? this.rows : null;
    }

    getColumnCopy() {
        let clonedRows = [];
        this.rows.forEach((row) => {
            clonedRows.push(row.cloneNode(true));
        });

        return {
            id: this.id,
            head: this.head.cloneNode(true),
            rows: clonedRows,
            width: this.width,
            headHeight: this.headHeight,
            rowsHeights: this.rowsHeights
        }
    }
}

export { Column as default} 