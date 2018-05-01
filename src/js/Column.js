class Column {
    constructor(id, head = null, rows = []) {
        this.id = id;
        this.head = head;
        this.rows = rows;
        this.width = this.head ? this.head.offsetWidth : 0;
    }

    destroyColumn() {
        if(this.head) {
            this.head.remove();
            this.head = null;
        }

        this.rows.forEach((row, index) => {
            if(row) {
                row.remove();
            }
        });
        this.rows = [];

        return null;
    }

    copyTo(table, index) {

    }

    moveTo(table, index) {
        table.querySelector('tr').appendChild(this.head);
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
            width: this.width
        }
    }
}

export { Column as default} 