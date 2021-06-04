import {Component} from '@angular/core';
import {InteractionService} from './services/interaction.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	title = 'avast-assesment';

	constructor(private interactionService: InteractionService) {
	}

	ngOnInit(): void {
		this.interactionService.loadJson();
	}
}
