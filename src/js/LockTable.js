class LockTable {
    constructor(superTableEl, dataTable, isRear = false, columnData = []) {
        this.superTableEl = superTableEl;
        this.dataTable = dataTable;
        this.isRear = isRear;
        this.containerEl =  document.createElement('div');
        this.columnData = columnData;

        this.createLockTable();
    }

    destroy() {
        this.containerEl.remove();
        return null;
    }

    containsColumn (column) {
        if(this.columnData) {
            for(let i = 0, length = this.columnData.length; i < length; i++) {
                if(this.columnData[i].head === column) {
                    return column;
                }
            }
        }
        return false;
    }

    createLockTable() {
        this.destroy();

        if(!this.columnData.length) {
            return;
        }

        let thead = document.createElement('thead');
        thead.appendChild(document.createElement('tr'));
        let tbody = document.createElement('tbody');

        this.table = document.createElement('table');
        this.table.appendChild(thead);
        this.table.appendChild(tbody);
        this.table.className = this.dataTable.className;
        this.table.classList.add('lock-table');
        this.table.classList.remove('max-locked');
        if(this.isRear) {
            this.containerEl.classList.add('rear');
            this.table.setAttribute('id', 'lock-table-rear');
        }
        else {
            this.table.setAttribute('id', 'lock-table');
        }
        this.containerEl.classList.add('lock-table-container');
        
        let inner = document.createElement('div');
        inner.classList.add('lock-table-inner');

        inner.appendChild(this.table);
        this.containerEl.appendChild(inner);
        this.containerEl.setAttribute('aria-hidden', '');
        this.superTableEl.appendChild(this.containerEl);

        if(this.columnData.length) {
            this.columnData.forEach(function(column, index) {
                column.head.style.width = `${column.width}px`;
                this.table.querySelector('thead tr').appendChild(column.head);
            }.bind(this));
        }
    }

    addColumn(column) {
        if(this.containsColumn(column.head)) {
            return;
        }

        this.columnData.push(column);
        this.createLockTable();
    }

    removeColumn(columncolumnHead) {
        let column = this.containsColumn(columnHead);
        let index = this.columnData.indexOf(column);

        if(index >= 0) {
            this.columnData.splice(index, 1);
            this.createLockTable();
        }
    }
}

export { LockTable as default}