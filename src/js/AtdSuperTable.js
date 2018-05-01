import './polyfills/node.remove';
import './polyfills/nodeList.forEach';
import './polyfills/object.assign';

import Column from './Column';
import LockTable from './LockTable';

class ATDSuperTable {    
    constructor(el, options) {
        this.containerEl = el;
        this.responsiveEl = this.containerEl.querySelectorAll('.responsive')[0];
        this.dataTable = this.containerEl.querySelectorAll('table')[0];
        this.columns = [];
        this.lockTable = null;
        this.lockTableRear = null;
        this.lockedColumns = [];
        // this.settings = Object.assign({
        //     'stackedBreakpoint': 991,
        //     'maxLocked': true
        // }, options);

        

        window.setTimeout(function() {
            this.loadColumns();

            if(this.isTableLockable()) {
                this.lockedColumns = this.getAutoLocked('data-auto-lock');
                this.lockedRear = this.getAutoLocked('data-auto-lock-rear');
            }

            this.layoutTable();
        }.bind(this), 100);

        // this.dataTable.querySelectorAll('th').forEach(function(node) {
        //     this.originalHeaders.push(node.innerText);
        // }.bind(this));
        
        
        // window.addEventListener('resize', this.layoutTable.bind(this));
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
        if(this.isTableHeightSet()) {
            this.createFixedHead();
            this.setTableMaxHeight();
        }

        // if(window.innerWidth <= this.settings.stackedBreakpoint) {
        //         this.containerEl.classList.add('stacked');
        //         this.setStackedHeadings();
        //         return;
        // }
        // else if(this.dataTable.offsetWidth <= this.containerEl.offsetWidth) {
        //     return;
        // } 
        // else {
        //         this.containerEl.classList.add('compact');
        // }
        
        if(this.isTableLockable()) {
            // this.placeLocks();

            // this.allLocked.sort(function(a, b) {
            //     if(a.index < b.index) {
            //         return -1;
            //     }
            //     return 1;
            // });

            let initialLocked = [];
            this.lockedColumns.forEach(function(id) {
                let column = this.getColumnByID(id);

                if(column) {
                    initialLocked.push(column.getColumnCopy());
                }
            }.bind(this));
        
            this.lockTable = new LockTable(this.containerEl, this.dataTable, false, initialLocked);

            initialLocked = [];
            this.lockedRear.forEach(function(id) {
                let column = this.getColumnByID(id);

                if(column) {
                    initialLocked.push(column.getColumnCopy());
                }
            }.bind(this));
        
            this.lockTableRear = new LockTable(this.containerEl, this.dataTable, true, initialLocked);
        
                // this.lockTable.calculateLockTableSize(this.allLocked);
                // this.toggleColumnVisibility(true, this.allLocked, this.lockTable);
            
            // this.autoLockedRear = this.getAutoLocked('data-auto-lock-rear');    
            // if(this.autoLockedRear.length) {
            //     this.lockTableRear = new LockTable(this.containerEl, this.dataTable, true);
            //     // this.lockTableRear.calculateLockTableSize(this.autoLockedRear);
            //     // this.toggleColumnVisibility(true, this.autoLockedRear, this.lockTableRear);
            // }

        //     this.calculateMaxLocked();

            // var lockButtons = this.containerEl.querySelectorAll('[data-lock-column]');
            // lockButtons.forEach(function(btn) {
            //     btn.addEventListener('click', this.toggleLocked.bind(this));
            // }.bind(this));
        }
    }

    // setStackedHeadings() {
    //     var columnHeads = this.dataTable.querySelectorAll('th');
    //     var rows = this.dataTable.querySelectorAll('tbody tr');
    //     rows.forEach(function(row) {
    //         var cells = row.querySelectorAll('td');
    //         cells.forEach(function(cell, i) {
    //                 if(columnHeads[i].innerText.length && !columnHeads[i].innerText.match(/^\s$/) && !columnHeads[i].innerText.match(/\xA0$/g)) {
    //                         cell.setAttribute('data-heading', columnHeads[i].innerText);
    //                 }
    //         });
    //     });
    // }

    // toggleLocked(e) {
    //     if(!this.isTableLockable()) {
    //         return;
    //     }

    //     var columnHead = e.target.parentElement;
    //     var headerRow = columnHead.parentElement;
    //     var isLocked = this.lockTable.containsColumn(columnHead);

       
    //     this.clearLockTables();
        
    //     if(isLocked) {
    //     //     this.manuallyLocked = removeFromLocked(this.manuallyLocked);
    //     //     this.autoLocked = removeFromLocked(this.autoLocked);
            
    //     //     function removeFromLocked(lockedList) {
    //     //         var locked = [];
    //     //         for(var i = 0, length = lockedList.length; i < length; i++) { 
    //     //             if(columnHead.innerText !== lockedList[i].el.innerText) {
    //     //                 locked.push(lockedList[i]);
    //     //             }
    //     //         }
    //     //         return locked;  
    //     //     }
    //     }
    //     else {      
    //             this.manuallyLocked.push({
    //                 index: Array.prototype.indexOf.call(headerRow.children, columnHead),
    //                 el: columnHead
    //             });
    //     }
        
    //     this.layoutTable();
    // }

    getAutoLocked(autoLockAttr) {
        var lockedList = [];
        this.columns.forEach((column) => {
            if(column.head.hasAttribute(autoLockAttr)) {
                lockedList.push(column.id);
            }
        });
        return lockedList;
    }

    // placeLocks() {
    //     var columnHeads = this.dataTable.querySelectorAll('th');
    //     columnHeads.forEach(function(th) {
    //         this.placeLock(th);
    //     }.bind(this));
    // }
    
    // placeLock(th) {
    //     var lock = document.createElement('A');
    //     lock.setAttribute('data-lock-column', '');
    //     th.appendChild(lock);
    // }

    // restoreTable() {
    //     if(!this.isTableLockable()) {
    //         return;
    //     }

    //     this.restoreOrignialOrder();
        
    //     this.dataTable.querySelectorAll('th').forEach(function(node) {
    //         var anchor = node.querySelector('[data-lock-column]');
    //         if(anchor) {
    //             anchor.remove();
    //         }
            
    //     });
        
    //     if(this.lockTable) {   
    //         this.lockTable = this.lockTable.destroy(); 
    //     }
        
    //     if(this.lockTableRear) {
    //         this.lockTableRear = this.lockTableRear.destroy(); 
    //     }

    //     this.containerEl.classList.remove('compact', 'stacked');
    // }
    
    // restoreOrignialOrder() {
    //     var currentOrder = this.dataTable.querySelectorAll('th');
    //     for(var i = 0, length = this.originalHeaders.length; i < length; i++) {
    //         currentOrder = this.dataTable.querySelectorAll('th');
    //         // currentOrder.forEach(function(node, index) {
    //         //     if(this.originalHeaders[i] === node.innerText) {
    //         //             this.lockTable.moveColumn(this.dataTable, index, i);
    //         //     }
    //         // }.bind(this)); 
    //     }
    // }

    // calculateMaxLocked() {
    //     if(this.settings.maxLocked === false || this.lockTable == undefined || !this.isTableLockable()) {
    //             return;
    //     }
        
    //     var containerWidth = this.containerEl.offsetWidth;
    //     var lockContainerWidth = this.lockTable.container.offsetWidth;

    //     if(lockContainerWidth > containerWidth / 2) {
    //             this.dataTable.classList.add('max-locked');
    //     }
    //     else {
    //         this.dataTable.classList.remove('max-locked');
    //     }
    // }
    
    // toggleColumnVisibility(visible, lockedList, lockTable) {
    //     if(this.lockTable) {
    //             for(var i = 0, length = lockedList.length; i < length; i++) {
    //             this.lockTable.table.querySelectorAll('th')[i].style.visibility = 'visible';
    //             }
    //     }
    // }
}

let superTables = document.querySelectorAll('[data-super-table]');
superTables.forEach(function(superTable) {
    let table = new ATDSuperTable(superTable);
});

export { ATDSuperTable as default}