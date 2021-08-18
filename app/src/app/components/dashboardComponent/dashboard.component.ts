/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE SELECTOR TEMPLATE_URL AND CLASS NAME*/
import { Component, OnInit, ViewChild } from '@angular/core'
import { NBaseComponent } from '../../../../../app/baseClasses/nBase.component';
import {Router} from '@angular/router';
import {MatTableDataSource} from '@angular/material/table'
import { FormBuilder, Validators } from '@angular/forms';
import { MatSort } from '@angular/material/sort';

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
    // PeriodicElement = [
    //         {position: 1, name: 'Dashboard',description:'Lorem ipsum is simply dummy......', weight: 10.2021, symbol: 'Mahesh' },
    //         {position: 2, name: 'Costomers',description:'Lorem ipsum is simply dummy......', weight: 4.0026, symbol: 'Vijay' },
    //         {position: 3, name: 'Products',description:'Lorem ipsum is simply dummy......', weight: 6.941, symbol: 'Rakesh' },
    //         {position: 4, name: 'sales',description:'Lorem ipsum is simply dummy......', weight: 9.0122, symbol: 'Lokesh' },
    //         {position: 5, name: 'Reports',description:'Lorem ipsum is simply dummy......', weight: 10.811, symbol: 'Shekar'}
    // ];
    @ViewChild(MatSort, {'static':true}) sort:MatSort;
    userForm:any;
    userDetailsForm : any;
    showUserDetails = true;
    userDetails:any = [];
    datasource;
    constructor(private route:Router,private formbuilder:FormBuilder,) {
        super();
    }

    ngOnInit() {
        this.userForm = this.formbuilder.group({
            userid : '',
            username : '',
            userdescription : '',
            userdate : '',
            ownername : '',
        })
        // this.datasource = new MatTableDataSource(this.PeriodicElement);
        // this.datasource = new MatTableDataSource(this.userDetails) ;
        // this.datasource.sort = this.sort;
    }
     showUSerForm(){
        this.userDetailsForm = true;
        this.showUserDetails = false;
        console.log("hai mahesh")
    }
    onClick(){
        this.route.navigate(['/login'])
    }
   
    onSubmit() {
        console.log(this.userForm)
        this.userDetails.push({id:this.userForm.value.userid,name:this.userForm.value.username,description:this.userForm.value.userdescription,date:this.userForm.value.userdate,owner:this.userForm.value.ownername});
        this.datasource = new MatTableDataSource(this.userDetails) ;
        this.datasource.sort = this.sort;

        console.log("userDetails",this.datasource);
        this.userForm.reset();
        this.userDetailsForm = false;
        this.showUserDetails = true;
    }
    searchUSer() {
        this.route.navigate(['/login'])
    }
    selectRow(row){
        // this.route.navigate(['/contactdetails'])
        console.log(row)
    }
    deleteRow(row) {
        console.log(row)
    }
}
