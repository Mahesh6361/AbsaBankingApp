/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE SELECTOR TEMPLATE_URL AND CLASS NAME*/
import { Component, OnInit } from '@angular/core'
import { NBaseComponent } from '../../../../../app/baseClasses/nBase.component';
import {Router} from '@angular/router';

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

    constructor(private route:Router) {
        super();
    }

    ngOnInit() {

    }
    onClick(){
        this.route.navigate(['/login'])
    }
}
