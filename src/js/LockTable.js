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

    containsColumn (columnID) {
        if(this.columnData) {
            for(let i = 0, length = this.columnData.length; i < length; i++) {
                if(this.columnData[i].id === columnID) {
                    return this.columnData[i];
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

        let containerWidth = 0;

        if(this.columnData.length) {
            this.columnData.forEach(function(column, index) {
                this.table.querySelector('tbody').style.transform = `translateY(${column.headHeight}px)`;
                column.head.style.width = `${column.width}px`;
                containerWidth += column.width;
                this.table.querySelector('thead tr').appendChild(column.head);
            }.bind(this));

            let tableBody = this.table.querySelector('tbody');
            let rowCount = this.columnData[0].rows.length;
            for(let i = 0; i < rowCount; i++) {
                let row = document.createElement('tr');

                this.columnData.forEach((column) => {
                    column.rows[i].style.width = `${column.width}px`;
                    column.rows[i].style.height = `${column.rowsHeights[i]}px`;
                    row.appendChild(column.rows[i]);
                });

                tableBody.appendChild(row);
            }
        }

        let adjWidth = (this.table.offsetWidth - this.table.clientWidth)/2;
        this.table.style.width = `${this.table.offsetWidth + adjWidth}px`;

        this.containerEl.style.width = `${containerWidth}px`;
    }
}

export { LockTable as default}