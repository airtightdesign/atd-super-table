import './polyfills/node.remove';
import './polyfills/nodeList.forEach';
import './polyfills/object.assign';

import Column from './Column';
import LockTable from './LockTable';

import '../sass/atd-super-table.scss';

class ATDSuperTable {    
    constructor(el, options) {
        this.containerEl = el;
        this.responsiveEl = this.containerEl.querySelectorAll('.responsive')[0];
        this.dataTable = this.containerEl.querySelectorAll('table')[0];
        this.columns = [];
        this.lockTable = null;
        this.lockTableRear = null;
        this.lockedColumns = [];
        this.lastScrollTime = Date.now();
        this.lockButtons = null;
        this.settings = Object.assign({
            'stackedBreakpoint': 991,
            'maxLocked': true
        }, options);

        window.setTimeout(function() {
            this.loadColumns();

            this.createLockButtons();

            if(this.isTableLockable()) {
                this.lockedColumns = this.getAutoLocked('data-auto-lock');
                this.lockedRear = this.getAutoLocked('data-auto-lock-rear');
            }

            this.layoutTable();
        }.bind(this), 250);

        window.addEventListener('resize', this.layoutTable.bind(this));
        this.containerEl.addEventListener('click', this.toggleLocked.bind(this));;
    }

    loadColumns() {
        let dataHeads = this.dataTable.querySelectorAll('th');
        let columns = [];
        dataHeads.forEach((head, index) => {
            let column = new Column(columns.length, head);
            let rows = [];
            let dataRows = this.dataTable.querySelectorAll('tbody tr');
            dataRows.forEach((row) => {
                rows.push(row.querySelectorAll('td')[index]);
            });
            column.setRows(rows);
            columns.push(column);
        });
        this.columns = columns;
    }

    getColumnByID(id) {
        let foundColumn = null;
        this.columns.forEach((column) => {
            if(column.id === id) {
                foundColumn = column;
            }
        });
        return foundColumn;
    }

    isTableLockable() {
        return this.containerEl.hasAttribute('data-lockable');
    }

    isTableHeightSet() {
        return this.containerEl.hasAttribute('data-height');
    }

    updateTableScrollPosition(e) {
        this.fixedHeader.style.transform = `translate3D(-${this.responsiveEl.scrollLeft}px, 0, 0)`;

        if((Date.now() - this.lastScrollTime) < 20 ) {
            return;
        }

        this.lastScrollTime = Date.now();

        if(this.responsiveEl.scrollTop !== e.target.scrollTop) {
            this.responsiveEl.scrollTop = e.target.scrollTop;
        }
            

        if(this.lockTable.table && this.lockTable.table.scrollTop !== e.target.scrollTop) {
            this.lockTable.table.scrollTop = e.target.scrollTop;
        }

        if(this.lockTableRear.table && this.lockTableRear.table.scrollTop !== e.target.scrollTop) {
            this.lockTableRear.table.scrollTop = e.target.scrollTop;
        }
    }

    createFixedHead() {
        if(this.fixedHeader) {
            this.fixedHeader.remove();
            this.fixedHeader = null;
        }

        this.responsiveEl.removeEventListener('scroll', this.updateTableScrollPosition);
        this.fixedHeader = document.createElement('TABLE');
        let headerRow = document.createElement('TR');
        this.fixedHeader.appendChild(document.createElement('THEAD'));
        this.fixedHeader.querySelector('thead').appendChild(headerRow);
        this.fixedHeader.className = this.dataTable.className;
        this.fixedHeader.classList.add('fixed-header',);
        this.containerEl.appendChild(this.fixedHeader);
        this.dataTable.querySelectorAll('th').forEach(function(node) {
            let cell = document.createElement('TH');
            cell.innerHTML = node.innerHTML;
            cell.style.width = `${node.offsetWidth}px`;
            headerRow.appendChild(cell);
        }.bind(this));

        this.responsiveEl.addEventListener('scroll', this.updateTableScrollPosition.bind(this));
        this.fixedHeader.style.transform = `translate3D(-${this.responsiveEl.scrollLeft}px, 0, 0)`;
    }

    setTableMaxHeight() {
        let maxHeight = parseInt(this.containerEl.getAttribute('data-height'), 10);
        
        if(isNaN && isNaN(maxHeight)) {
            return;
        }
        this.responsiveEl.style.maxHeight = `${maxHeight}px`;
        this.responsiveEl.classList.add('set-height');
    }

    layoutTable() {        
        this.containerEl.classList.remove('stacked', 'compact');
        this.restoreColumnOrder();

        if(this.isTableHeightSet()) {
            this.setTableMaxHeight();
        }

        if(this.lockTable) {
            this.lockTable.destroy();
            this.lockTable = null;
        }

        if(this.lockTableRear) {
            this.lockTableRear.destroy();
            this.lockTableRear = null;
        }

        if(window.innerWidth <= this.settings.stackedBreakpoint) {
                this.containerEl.classList.add('stacked');
                this.setStackedHeadings();
                return;
        }
        else if(this.dataTable.offsetWidth <= this.containerEl.offsetWidth) {
            return;
        } 
        else {
                this.containerEl.classList.add('compact');
        }
        
        if(this.isTableLockable()) {
            let initialLocked = [];
            this.lockedColumns.forEach(function(id) {
                let column = this.getColumnByID(id);

                if(column) {
                    initialLocked.push(column.getColumnCopy());
                    this.moveColumn(id);
                }
            }.bind(this));
            
            this.lockTable = new LockTable(this.containerEl, this.dataTable, false, initialLocked);
            if(this.lockTable.table) {
                this.lockTable.table.addEventListener('scroll', this.updateTableScrollPosition.bind(this));
            }
            
            initialLocked = [];
            this.lockedRear.forEach(function(id) {
                let column = this.getColumnByID(id);

                if(column) {
                    initialLocked.push(column.getColumnCopy());
                }
            }.bind(this));
        
            this.lockTableRear = new LockTable(this.containerEl, this.dataTable, true, initialLocked);
            if(this.lockTableRear.table) {
                this.lockTableRear.table.addEventListener('scroll', this.updateTableScrollPosition.bind(this));
                let scrollBarOffset = this.responsiveEl.offsetWidth - this.responsiveEl.clientWidth;
                this.lockTableRear.containerEl.style.transform =  `translate3D(-${scrollBarOffset}px, 0px, 0px)`;
            }
           
            this.calculateMaxLocked();
        }

        if(this.isTableHeightSet()) {
            this.createFixedHead();
        }
    }

    setStackedHeadings() {
        var columnHeads = this.dataTable.querySelectorAll('th');
        var rows = this.dataTable.querySelectorAll('tbody tr');
        rows.forEach(function(row) {
            var cells = row.querySelectorAll('td');
            cells.forEach(function(cell, i) {
                    if(columnHeads[i].innerText.length && !columnHeads[i].innerText.match(/^\s$/) && !columnHeads[i].innerText.match(/\xA0$/g)) {
                            cell.setAttribute('data-heading', columnHeads[i].innerText);
                    }
            });
        });
    }

    toggleLocked(e) {
        if(!this.isTableLockable()) {
            return;
        }

        if(e.target.matches('[data-lock-column]')) {
            let columnID = parseInt(e.target.getAttribute('data-lock-column'), 10);

            let index = this.lockedColumns.indexOf(columnID);
            if(index >= 0) {
                this.lockedColumns.splice(index, 1);
            }
            else {
                this.lockedColumns.push(columnID);
            }
            
            this.layoutTable();
        }
    }

    moveColumn(columnID, isFront = true) {
        let column = this.getColumnByID(columnID);
        let headRow = this.dataTable.querySelector('thead tr');
        let dataRows = this.dataTable.querySelectorAll('tbody tr');
        
        if(isFront) {
            headRow.insertBefore(column.head, headRow.firstChild);
        }
        else {
            headRow.appendChild(column.head, null);
        }

        column.rows.forEach(function(row, index) {
            if(isFront) {
                dataRows[index].insertBefore(row, dataRows[index].firstChild);
            }
            else {
                dataRows[index].appendChild(row, null);
            }
        }.bind(this));
    }

    restoreColumnOrder() {
        this.columns.forEach(function(column) {
            this.moveColumn(column.id, false);
        }.bind(this));
    }

    getAutoLocked(autoLockAttr) {
        var lockedList = [];
        this.columns.forEach((column) => {
            if(column.head.hasAttribute(autoLockAttr)) {
                lockedList.push(column.id);
            }
        });
        return lockedList;
    }

    createLockButtons() {
        if(!this.isTableLockable()) {
            return;
        }

        this.columns.forEach(function(column) {
            var lock = document.createElement('a');
            lock.setAttribute('data-lock-column', column.id);
            column.head.appendChild(lock);
        }.bind(this));
    }

    calculateMaxLocked() {
        if(this.settings.maxLocked === false || this.lockTable == undefined || !this.isTableLockable()) {
                return;
        }
        
        var containerWidth = this.containerEl.offsetWidth;
        var lockContainerWidth = this.lockTable.containerEl.offsetWidth;

        if(lockContainerWidth > containerWidth / 2) {
                this.dataTable.classList.add('max-locked');
        }
        else {
            this.dataTable.classList.remove('max-locked');
        }
    }
}
let superTables = document.querySelectorAll('[data-super-table]');
superTables.forEach(function(superTable) {
    let table = new ATDSuperTable(superTable);
});

export { ATDSuperTable as default}