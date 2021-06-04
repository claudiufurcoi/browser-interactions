import { Injectable } from "@angular/core";
import { forkJoin, from, fromEvent, of, zip } from "rxjs";
import { count, groupBy, map, mergeMap, scan, reduce, tap, distinct, min, max, filter, pairwise } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class UtilsService {

    constructor() {
    }

    compare(a: number | string, b: number | string, isAsc: boolean) {
        if (a === undefined && b === undefined)
            return 0;
        if (b === undefined)
            return -1;
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }



    //RxJS 
    getTypeCount(data) {
        from(data)
        .pipe(
            groupBy(p => p['event']['type']),
            mergeMap(
                group => group.pipe(
                  reduce(count => count + 1, 0),
                  map(v => ({ Status: group.key, Count: v }))
                )
              )
        )
        .subscribe(p => console.log(p));
    }

    //ForkJoin ensures every observable has finished working
    getMinTimeIntervalParallel(data) {
        let multiple = this.chunkArray(data, Math.ceil(data.length/4));
        forkJoin([
            from(multiple[0]),
            from(multiple[1]),
            from(multiple[2]),
            from(multiple[3])
        ]).subscribe(([response1, response2, response3, response4]) => {
            //do something with the responses
        });


    }

    getMinTimeInterval(data) {
        from(data)
        .pipe(
            map(p => p['time']),
            pairwise(),
            map(([e1, e2]) => e2 - e1),
            min( (a, b) => a < b ? -1 : 1)
        )
        .subscribe(p => console.log('Min computed:' + p));
    }

    getMaxTimeInterval(data) {
        from(data)
        .pipe(
            map(p => p['time']),
            pairwise(),
            map(([e1, e2]) => e2 - e1),
            max( (a, b) => a < b ? -1 : 1)
        )
        .subscribe(p => console.log(p));
    }

    getTotalTimeInteraction(data) {
        from(data)
        .pipe(
            map(p => p['time']),
            pairwise(),
            map(([e1, e2]) => e2 - e1),
            reduce((acc, v) => acc + v, 0)
        )
        .subscribe(p => console.log(p));
    }

    chunkArray(array, size) {
        let result = []
        let arrayCopy = [...array]
        while (arrayCopy.length > 0) {
          result.push(arrayCopy.splice(0, size))
        }

        return result
      }
}
