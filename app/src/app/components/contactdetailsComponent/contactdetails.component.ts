/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE SELECTOR TEMPLATE_URL AND CLASS NAME*/
import { Component, OnInit } from '@angular/core'
import { NBaseComponent } from '../../../../../app/baseClasses/nBase.component';
import {Router} from '@angular/router';

// import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
/*
Client Service import Example:
import { servicename } from 'app/sd-services/servicename';
*/

/*
Legacy Service import Example :
import { HeroService } from '../../services/hero/hero.service';
*/

@Component({
    selector: 'bh-contactdetails',
    templateUrl: './contactdetails.template.html'
})

export class contactdetailsComponent extends NBaseComponent implements OnInit {

    constructor(private router:Router) {
        super();
    }

    ngOnInit() {

    }
//    openDialog() {
//     const dialogRef = this.dialog.open(referdialogComponent, {
//         width:'500px'
//     });

//     dialogRef.afterClosed().subscribe(result => {
//       console.log('The dialog was closed');
//     });
//   }

    backtoDash(){
        this.router.navigate(['/dashboard'])
    }
}
