/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE SELECTOR TEMPLATE_URL AND CLASS NAME*/
import { Component, OnInit } from '@angular/core'
import { NBaseComponent } from '../../../../../app/baseClasses/nBase.component';
import {Router} from '@angular/router';
import {MatTableDataSource} from '@angular/material/table'
// import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

/*
Client Service import Example:
import { servicename } from 'app/sd-services/servicename';
*/

/*
Legacy Service import Example :
import { HeroService } from '../../services/hero/hero.service';
*/

@Component({
    selector: 'bh-dashboard',
    templateUrl: './dashboard.template.html'
})

export class dashboardComponent extends NBaseComponent implements OnInit {
    PeriodicElement = [
            {position: 1, name: 'Task Name',description:'Lorem ipsum is simply dummy......', weight: 1.0079, symbol: 'mahesh' },
            {position: 2, name: 'Task Name',description:'Lorem ipsum is simply dummy......', weight: 4.0026, symbol: 'mahesh' },
            {position: 3, name: 'Task Name',description:'Lorem ipsum is simply dummy......', weight: 6.941, symbol: 'mahesh' },
            {position: 4, name: 'Task Name',description:'Lorem ipsum is simply dummy......', weight: 9.0122, symbol: 'mahesh' },
            {position: 5, name: 'Task Name',description:'Lorem ipsum is simply dummy......', weight: 10.811, symbol: 'mahesh' }
    ];
    datasource;
    constructor(private route:Router) {
        super();
    }

    ngOnInit() {
        this.datasource = new MatTableDataSource(this.PeriodicElement);
    }
    onClick(){
        this.route.navigate(['/login'])
    }
}
