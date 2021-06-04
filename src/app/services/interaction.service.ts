import {BehaviorSubject} from 'rxjs';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

const electron = (<any>window).require('electron');

@Injectable({
	providedIn: 'root'
})
export class InteractionService {
	data = new BehaviorSubject<any[]>([]);

	constructor(private httpClient: HttpClient) {
		electron.ipcRenderer.on('loadFile', (event) => {
			this.loadFileContent().then(value => {
				this.data.next(value);
			});
		});
	}

	loadJson() {
		electron.ipcRenderer.send('loadJson');
	}

	loadFileContent( ): Promise<any[]> {
		//it can easily be loaded from cloud storage
		return this.httpClient.get('./assets/task.recording.json').toPromise().then((data: Array<any>) => {
			return data['records'];
		});
	}
}
