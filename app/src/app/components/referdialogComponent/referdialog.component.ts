/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE SELECTOR TEMPLATE_URL AND CLASS NAME*/
import { Component, OnInit } from '@angular/core'
import { NBaseComponent } from '../../../../../app/baseClasses/nBase.component';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table'

/*
Client Service import Example:
import { servicename } from 'app/sd-services/servicename';
*/

/*
Legacy Service import Example :
import { HeroService } from '../../services/hero/hero.service';
*/

@Component({
    selector: 'bh-referdialog',
    templateUrl: './referdialog.template.html'
})

export class referdialogComponent extends NBaseComponent implements OnInit {
    userForm:any;
    userDetails:any = [];
    datasource;


    constructor(private formbuilder:FormBuilder,) {
        super();
    }

    ngOnInit() {
        this.userForm = this.formbuilder.group({
            username : '',
            usersurname : '',

        })
    }
    onSubmit() {
        console.log(this.userForm)
        this.userDetails.push({name:this.userForm.value.username,surname:this.userForm.value.usersurname});
        this.datasource = new MatTableDataSource(this.userDetails) ;
        console.log("userDetails",this.datasource);
        this.userForm.reset();
        // this.userForm = this.formbuilder.group({
        //     username : '',
        //     usersurname : '',

        // })
    }
    onRowClick(id:Event) {
        console.log((id.target as HTMLInputElement).value)
    }
    // editSelected(row) {
    //     console.log(row)
    // }
}
