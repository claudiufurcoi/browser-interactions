
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as d3 from 'd3';
import { InteractionService } from '../services/interaction.service';

@Component({
	selector: 'app-stats',
	templateUrl: './stats.component.html',
	styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {
	data: any[];

	timesetinteractions: any[] = [];

	displayedColumns: string[] = ['statistics', 'values'];

	private svgbar;
	private svgseq;
	private margin = 50;
	private width = 400;
	private height = 400;
	private heightseq = 200;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private cdr: ChangeDetectorRef
	) {

	}

	ngOnInit(): void {
		this.createSvgBar();
		this.createSvgSeq();

		let records = JSON.parse(this.route.snapshot.paramMap.get('recordings'));
		if (records) {
			this.data = records;

			//data manipulation
			this.interactionsDataManipulation();

			//charts
			this.drawBarsEventType();
			this.drawSequenceSeries();

			//refresh
			this.cdr.detectChanges();
		}

	}

	private interactionsDataManipulation(): void {

		let timeinteraction = 
			this.data
				.sort((a, b) => { return Number(a.time) - Number(b.time) })
				.reduce((previous, current) => {
					if (!previous.length) 
						return [{ "time": current.time, "delay": 0 }];
					let diff = Number(current.time) - Number(previous[previous.length - 1].time);
					previous.push({ "time": current.time, "delay": diff });
					return previous;
				}, []);

		var minTime = d3.min(timeinteraction.slice(1), function (d) { return d["delay"]; });
		var maxTime = d3.max(timeinteraction, function (d) { return d["delay"]; });
		var meanTime = d3.mean(timeinteraction.slice(1), function (d) { return d["delay"]; });
		var sumEvents = d3.sum(timeinteraction, function (d) { return d["delay"]; });

		this.timesetinteractions = [];
		this.timesetinteractions.push({ "key": "Min time delay between interactions (MS) ", "value": minTime });
		this.timesetinteractions.push({ "key": "Max time delay between interactions (MS) ", "value": maxTime });
		this.timesetinteractions.push({ "key": "Mean time delay between interactions (MS) ", "value": Math.round(meanTime) });
		this.timesetinteractions.push({ "key": "Total time of the  interaction (MS) ", "value": sumEvents });

		let seqArray: any[] = this.data
			.filter(interact => interact.event.type !== 'focus')
			.reduce((r, o) => {
				if (!r.length) 
					return [[o]];
				
				let last = r[r.length - 1];
				if (o.event.type !== last[last.length - 1].event.type) 
					return [...r, [o]];
				
					r[r.length - 1].push(o);
				return r;
			}, []);
		
		var longestSeq = d3.max(seqArray, function (d) { return d.length; });

		var seqEventLongest = seqArray.filter(i => i.length === longestSeq)[0][0].event.type;

		this.timesetinteractions.push({ "key": 'Longest sequence of ' + seqEventLongest, "value": longestSeq });
	}

	back() {
		this.router.navigate(['/']);
	}

	private createSvgBar(): void {
		this.svgbar = d3.select("figure#bar")
			.append("svg")
			.attr("width", this.width + (this.margin * 2))
			.attr("height", this.height + (this.margin * 2))
			.append("g")
			.attr("transform", "translate(" + this.margin + "," + this.margin + ")");
	}

	private createSvgSeq(): void {
		this.svgseq = d3.select("figure#seq")
		  .append("svg")
		  .attr("width", this.width + (this.margin * 2))
		  .attr("height", this.heightseq + (this.margin * 2))
		  .append("g")
		  .attr("transform", "translate(" + this.margin + "," + this.margin + ")");
	}

	private drawBarsEventType(): void {
		let dataMap = Array.from(d3.rollup(this.data, v => v.length, d => d.event.type));

		// Create the X-axis band scale
		const x = d3.scaleBand().range([0, this.width]).domain(dataMap.map(d => d[0])).padding(0.1);

		// Draw the X-axis on the DOM
		this.svgbar.append("g")
			.attr("transform", "translate(0," + (this.height) + ")")
			.call(d3.axisBottom(x))
			.selectAll("text")
			.attr("transform", "translate(-10,0)rotate(-45)")
			.style("text-anchor", "end");

		// Create the Y-axis band scale
		const y = d3.scaleLinear()
			.domain([0, d3.max(dataMap.map(d => d[1]))])
			.range([this.height, 0]);

		// Draw the Y-axis on the DOM
		this.svgbar.append("g")
			.call(d3.axisLeft(y));

		// Create and fill the bars
		this.svgbar.selectAll("bars")
			.data(dataMap)
			.enter()
			.append("rect")
			.attr("x", d => x(d[0]))
			.attr("y", d => y(d[1]))
			.attr("width", x.bandwidth())
			.attr("height", (d) => this.height - y(d[1]))
			.attr("fill", "#d04a35");
	}

	private drawSequenceSeries(): void {
		let dataset = this.data;
		dataset.forEach(function (d) { d.time = new Date(d.time); });

		var colorOf = d3.scaleOrdinal(d3.schemeCategory10).domain(dataset.map(function (d) { return d.event.type; }));
		var timeFormat = d3.timeFormat("%Y-%m-%dT%H:%M:%S.%L");

		var y = d3.scaleBand()
			.rangeRound([this.heightseq, 0]).domain(dataset.map(function (d) { return d.event.type; }));
		var x = d3.scaleTime().domain(d3.extent(dataset, function (d) { return d.time; })).rangeRound([0, this.width]);
		var xAxis = d3.axisBottom(x).ticks(4).tickFormat(timeFormat);;
		
		this.svgseq.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + (this.heightseq) + ")")
			.call(xAxis)
			.selectAll("text")
			.attr("transform", "translate(-10,0)rotate(-45)")
			.style("text-anchor", "end");;
		// Create the Y-axis band scale

		// Draw the Y-axis on the DOM
		this.svgseq.append("g")
			.attr("class", "y axis")
			.call(d3.axisLeft(y));

		this.svgseq.selectAll("seq").data(dataset)
			.enter().append("rect")
			.attr("x", function (d) { return x(d.time); })
			.attr("width", 1)
			.attr("y", function (d) { return y(d.event.type); })
			.attr("height", y.bandwidth())
			.style("fill", function (d) { return colorOf(d.event.type); });




	}
}
