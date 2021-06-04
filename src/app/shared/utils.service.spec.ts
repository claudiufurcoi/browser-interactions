import { TestBed, inject } from '@angular/core/testing';
import { UtilsService } from '../shared';


describe('UtilsService', () => {
    let service: UtilsService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [UtilsService]
        });
    });

    beforeEach(() => {
        service = TestBed.get(UtilsService);
    });

    it('should be created', inject([UtilsService], (service: UtilsService) => {
        expect(service).toBeTruthy();
    }));

    it('should be alphanumerically equal', inject([UtilsService], (service: UtilsService) => {
        let a = "121";
        let b = "121";
        expect(service.compare(a,b, false)).toEqual(-1);
    }));

    it('should be alphanumerically greater', inject([UtilsService], (service: UtilsService) => {
        let a = "aa";
        let b = "ab";
        expect(service.compare(a,b, false)).toEqual(1);
    }));


    it('should be numerically greater', inject([UtilsService], (service: UtilsService) => {
        let a = 2;
        let b = 1;
        expect(service.compare(a,b, true)).toEqual(1);
    }));

    
});
