/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE SELECTOR TEMPLATE_URL AND CLASS NAME*/
import { Component, OnInit } from '@angular/core'
import { NBaseComponent } from '../../../../../app/baseClasses/nBase.component';
import {MatTableDataSource} from '@angular/material/table'


/*
Client Service import Example:
import { servicename } from 'app/sd-services/servicename';
*/

/*
Legacy Service import Example :
import { HeroService } from '../../services/hero/hero.service';
*/

@Component({
    selector: 'bh-customer',
    templateUrl: './customer.template.html'
})

export class customerComponent extends NBaseComponent implements OnInit {
    PeriodicElement = [
            {position: 1, name: 'Task Name',description:'Lorem ipsum is simply dummy......', weight: 1.0079, symbol: 'mahesh' },
            {position: 2, name: 'Task Name',description:'Lorem ipsum is simply dummy......', weight: 4.0026, symbol: 'mahesh' },
            {position: 3, name: 'Task Name',description:'Lorem ipsum is simply dummy......', weight: 6.941, symbol: 'mahesh' },
            {position: 4, name: 'Task Name',description:'Lorem ipsum is simply dummy......', weight: 9.0122, symbol: 'mahesh' },
            {position: 5, name: 'Task Name',description:'Lorem ipsum is simply dummy......', weight: 10.811, symbol: 'mahesh' }
    ];
    datasource;
    constructor() {
        super();
    }

    ngOnInit() {
        this.datasource = new MatTableDataSource(this.PeriodicElement);

    }
}
