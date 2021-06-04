import {ChangeDetectorRef, Component, Inject, LOCALE_ID, OnInit, ViewChild} from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import {InteractionService} from '../services/interaction.service';
import {DatePipe} from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { UtilsService } from '../shared';

const USER_SCHEMA = {
	'event': 'text',
	'setup': 'text',
	'time': 'date',
	'edit': 'edit',
	'delete': 'delete'
}

const mockRecordings = [
	{
		"event": {
			"type": "navigate"
		},
		"setup": {
			"attributes": {
				"title": "New Tab"
			},
			"description": "",
			"name": "",
			"type": null,
			"url": "chrome://newtab/"
		},
		"time": 1612271431271
	},
	{
		"event": {
			"type": "focus"
		},
		"setup": {
			"attributes": {
				"title": "New Tab"
			},
			"description": "",
			"name": "",
			"type": null,
			"url": "chrome://newtab/"
		},
		"time": 1612271438035
	},
	{
		"event": {
			"type": "navigate"
		},
		"setup": {
			"attributes": {
				"title": "New Tab"
			},
			"description": "",
			"name": "",
			"type": null,
			"url": "chrome://newtab/"
		},
		"time": 1612271489789
	},
	{
		"event": {
			"type": "input"
		},
		"setup": {
			"attributes": {
				"title": "New Tab"
			},
			"description": "",
			"name": "",
			"type": null,
			"url": "chrome://newtab/"
		},
		"time": 1612271498250
	}
]

@Component({
	selector: 'app-browser',
	templateUrl: './browser.component.html',
	styleUrls: ['./browser.component.css']
})
export class BrowserComponent implements OnInit {
	matDataSource = new MatTableDataSource([]);
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild(MatPaginator) paginator: MatPaginator;

	displayedColumns: string[] = ['event', 'setup', 'time', 'edit', 'delete'];
	dataSchema = USER_SCHEMA;

	length: number;
	pageSize:number = 20;
	pageSizeOptions: number[] = [10, 25, 100];

	constructor(private interactionService: InteractionService,
				private router: Router,
				@Inject(LOCALE_ID) public locale: string,
				private utilsService: UtilsService,
				private cdr: ChangeDetectorRef) {
	}

	ngOnInit() {
		this.interactionService.data.subscribe((response) => {
			
			if(response) {
				this.matDataSource.data = response;
				// this.matDataSource.paginator = this.paginator;
				this.matDataSource.sort = this.sort;
				this.length = this.matDataSource.data.length;
				this.cdr.detectChanges();
			}
		});
	}

	ngAfterViewInit() {
        this.matDataSource.paginator = this.paginator;
    }

	onClick(element) {
		element.isEdit = !element.isEdit;
		this.cdr.detectChanges();

		console.log(this.matDataSource.data);
	}

	delete(index) {
		this.matDataSource.data.splice(index, 1);
		this.matDataSource.data = [...this.matDataSource.data];

		this.cdr.detectChanges();
	}

	showLabel(col) {
		return col !== 'edit' && col !== 'delete';
	}

	statistics() {
		this.utilsService.getTypeCount(this.matDataSource.data);
		this.utilsService.getMaxTimeInterval(this.matDataSource.data);
		this.utilsService.getMinTimeInterval(this.matDataSource.data);
		this.utilsService.getTotalTimeInteraction(this.matDataSource.data);

		this.router.navigate(['/statistics', {recordings: JSON.stringify(this.matDataSource.data)}]);
	}

	saveAs() {
		let data = JSON.stringify(this.matDataSource.data);
        let typefile =  "application/json";
        let a = document.createElement('a');
        a.href = URL.createObjectURL(new File([data], '', {type: typefile}));
		let datePipe = new DatePipe(this.locale);
        a.download = 'task.recordings.' + datePipe.transform(new Date(), 'yyyy-MM-dd-HH-mm') + '.' + 'json';
        a.click();
    }

	sortData(sort: Sort) {
		let sorted = [];
        const data = this.matDataSource.data.slice();
        if (!sort.active || sort.direction === '') {
            sorted = data;
            return;
        }

        sorted = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'event':
                    return this.utilsService.compare(a['event'].type, b['event'].type, isAsc);
                case 'setup':
                    return this.utilsService.compare(a['setup'].html, b['setup'].html, isAsc);
                default:
                    return 0;
            }
        });

        this.matDataSource.data = sorted;
        this.matDataSource.paginator = this.paginator;
    }
}
