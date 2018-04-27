import './polyfills/node.remove';
import './polyfills/nodeList.forEach';
import './polyfills/object.assign';

class ATDSuperTable {    
    constructor(el, options) {
        this.containerEl = el;
        this.responsiveEl = this.containerEl.querySelectorAll('.responsive')[0];
        this.dataTable = this.containerEl.querySelectorAll('table')[0];
        this.lockTable = null;
        this.lockTableRear = null;
        this.autoLockedRear = [];
        this.manuallyLocked = [];
        this.allLocked = [];
        this.originalHeaders = [];        
        this.settings = Object.assign({
            'stackedBreakpoint': 991,
            'maxLocked': true
        }, options);

        if(this.isTableLockable()) {
            this.autoLocked = this.getAutoLocked('data-auto-lock');
        }

        this.dataTable.querySelectorAll('th').forEach(function(node) {
            this.originalHeaders.push(node.innerText);
        }.bind(this));
        
        this.layoutTable();
        window.addEventListener('resize', this.layoutTable.bind(this));
    }

    isTableLockable() {
        return this.containerEl.hasAttribute('data-lockable');
    }

    isTableHeightSet() {
        return this.containerEl.hasAttribute('data-height');
    }

    updateTableScrollPosition(e) {
        let frame = e.target;
        this.fixedHeader.style.transform = `translateY(${e.target.scrollTop}px)`;
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
        this.responsiveEl.appendChild(this.fixedHeader);

        this.dataTable.querySelectorAll('th').forEach(function(node) {
            let cell = document.createElement('TH');
            cell.innerHTML = node.innerHTML;
            cell.style.width = `${node.offsetWidth}px`;
            headerRow.appendChild(cell);
        }.bind(this));

        this.responsiveEl.addEventListener('scroll', this.updateTableScrollPosition.bind(this));
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
        this.clearLockTables();
        this.containerEl.classList.remove('compact', 'stacked');

        if(this.isTableHeightSet()) {
            window.setTimeout(() => {
                this.createFixedHead();
                this.setTableMaxHeight();
            }, 100);
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
            this.placeLocks();
                
            this.allLocked = this.autoLocked.concat(this.manuallyLocked);
            this.allLocked.sort(function(a, b) {
                if(a.index < b.index) {
                    return -1;
                }
                return 1;
            });

            if(this.allLocked.length) {
                this.lockTable = this.createLockTable();
                this.calculateLockTableSize(this.lockTable, this.allLocked);
                this.toggleColumnVisibility(true, this.allLocked, this.lockTable);
            }
            
            this.autoLockedRear = this.getAutoLocked('data-auto-lock-rear');    
            if(this.autoLockedRear.length) {
                this.lockTableRear = this.createLockTable(true);
                this.calculateLockTableSize(this.lockTableRear, this.autoLockedRear);
                this.toggleColumnVisibility(true, this.autoLockedRear, this.lockTableRear);
            }

            this.calculateMaxLocked();

            var lockButtons = this.containerEl.querySelectorAll('[data-lock-column]');
            lockButtons.forEach(function(btn) {
                btn.addEventListener('click', this.toggleLocked.bind(this));
            }.bind(this));
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

        var columnHead = e.target.parentElement;
        var headerRow = columnHead.parentElement;
        var isLocked = this.lockTable ? this.lockTable.table.contains(columnHead) : false;
        
        this.clearLockTables();
        
        if(isLocked) {
            this.manuallyLocked = removeFromLocked(this.manuallyLocked);
            this.autoLocked = removeFromLocked(this.autoLocked);
            
            function removeFromLocked(lockedList) {
                var locked = [];
                for(var i = 0, length = lockedList.length; i < length; i++) { 
                    if(columnHead.innerText !== lockedList[i].el.innerText) {
                        locked.push(lockedList[i]);
                    }
                }
                return locked;  
            }
        }
        else {      
                this.manuallyLocked.push({
                    index: Array.prototype.indexOf.call(headerRow.children, columnHead),
                    el: columnHead
                });
        }
        
        this.layoutTable();
    }

    getAutoLocked(autoLockAttr) {
        var lockedList = [];
        var columnHeads =  this.dataTable.querySelectorAll('th');
        for(var i = 0, length = columnHeads.length; i < length; i++) {
            if(columnHeads[i].hasAttribute(autoLockAttr)) {
                lockedList.push({
                    index: i,
                    el: columnHeads[i]
                });
            }
        }
        
        return lockedList;
    }

    placeLocks() {
        if(!this.isTableLockable()) {
            return;
        }

        var columnHeads = this.dataTable.querySelectorAll('th');
        columnHeads.forEach(function(th) {
            this.placeLock(th);
        }.bind(this));
    }
    
    placeLock(th) {
        var lock = document.createElement('A');
        lock.setAttribute('data-lock-column', '');
        lock.setAttribute('href', 'javascript:void(0)');
        th.appendChild(lock);
    }

    clearLockTables() {
        if(!this.isTableLockable()) {
            return;
        }

        this.restoreOrignialOrder();
        
        this.dataTable.querySelectorAll('th').forEach(function(node) {
            var anchor = node.querySelector('[data-lock-column]');
            if(anchor) {
                anchor.remove();
            }
            
        });
        
        if(this.lockTable) {    
                this.containerEl.removeChild(this.lockTable.container);
                this.lockTable = null;
        }
        
        if(this.lockTableRear) {
            this.containerEl.removeChild(this.lockTableRear.container);
            this.lockTableRear = null;
        }
    }
    
    restoreOrignialOrder() {
        var currentOrder = this.dataTable.querySelectorAll('th');
        for(var i = 0, length = this.originalHeaders.length; i < length; i++) {
            currentOrder = this.dataTable.querySelectorAll('th');
            currentOrder.forEach(function(node, index) {
                if(this.originalHeaders[i] === node.innerText) {
                        this.moveColumn(this.dataTable, index, i);
                }
            }.bind(this)); 
        }
    }
    
    moveColumn(table, index, position, isRear) {
        if(isRear) {
            return;
        }
        var tableRows = table.querySelectorAll('tbody tr');
        var tableHeadRow = table.querySelector('thead tr');
        
        tableHeadRow.insertBefore(
            tableHeadRow.children[index], 
            tableHeadRow.childNodes[position]
        );
        
        for(var i = 0, length = tableRows.length; i < length; i++) {
            tableRows[i].insertBefore(
                tableRows[i].children[index], 
                tableRows[i].childNodes[position]
            );
        }
    }

    calculateLockTableSize(lockTable, lockedList) {
        if(!this.isTableLockable()) {
            return;
        }
        
        var width = 0;
        var columnHeads = this.lockTable.table.querySelectorAll('th');
        var rows = this.lockTable.table.querySelectorAll('tbody tr');
        
        for(var i = 0, length = lockedList.length; i < length; i++) {
            width += columnHeads[lockedList[i].index].offsetWidth;
            columnHeads[lockedList[i].index].style.visibility = 'visible';
            columnHeads[lockedList[i].index].style.pointerEvents = 'auto';
                
            for(var rows_i = 0, rows_length = rows.length; rows_i < rows_length; rows_i++) {
                rows[rows_i].children[lockedList[i].index].style.visibility = 'visible';
                rows[rows_i].children[lockedList[i].index].style.pointerEvents = 'auto';
            }
            
            this.moveColumn(this.lockTable.table, lockedList[i].index, i, this.lockTable.isRear);
            this.moveColumn(this.dataTable, lockedList[i].index, i, this.lockTable.isRear);
        }
        this.lockTable.container.style.width = width + 'px';
    }

    calculateMaxLocked() {
        if(this.settings.maxLocked === false || this.lockTable == undefined || !this.isTableLockable()) {
                return;
        }
        
        var containerWidth = this.containerEl.offsetWidth;
        var lockContainerWidth = this.lockTable.container.offsetWidth;

        if(lockContainerWidth > containerWidth / 2) {
                this.dataTable.classList.add('max-locked');
        }
        else {
            this.dataTable.classList.remove('max-locked');
        }
    }
    
    toggleColumnVisibility(visible, lockedList, lockTable) {
        if(this.lockTable) {
                for(var i = 0, length = lockedList.length; i < length; i++) {
                this.lockTable.table.querySelectorAll('th')[i].style.visibility = 'visible';
                }
        }
    }
    
    createLockTable(isRear) {
        if(!this.isTableLockable()) {
            return;
        }

        //create lock table
        var lockTable = {
            table: this.dataTable.cloneNode(true),
            container:  document.createElement('div'),
            isRear: isRear
        }
                
        lockTable.table.classList.add('lock-table');
        lockTable.table.classList.remove('max-locked');
        if(isRear) {
            lockTable.container.classList.add('rear');
                lockTable.table.setAttribute('id', 'lock-table-rear');
        }
        else {
            lockTable.table.setAttribute('id', 'lock-table');
        }
        lockTable.container.classList.add('lock-table-container');
        
        var inner = document.createElement('div');
        inner.classList.add('lock-table-inner');

        inner.appendChild(lockTable.table);
        lockTable.container.appendChild(inner);
        lockTable.container.setAttribute('aria-hidden', '');
        this.containerEl.appendChild(lockTable.container);

        return lockTable;
    }
}

let superTables = document.querySelectorAll('[data-super-table]');
superTables.forEach(function(superTable) {
    let table = new ATDSuperTable(superTable);
});

export { ATDSuperTable as default}