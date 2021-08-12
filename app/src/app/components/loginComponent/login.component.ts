/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE SELECTOR TEMPLATE_URL AND CLASS NAME*/
import { Component, OnInit } from '@angular/core'
import { NBaseComponent } from '../../../../../app/baseClasses/nBase.component';
import { FormBuilder, Validators } from '@angular/forms';
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
    selector: 'bh-login',
    templateUrl: './login.template.html'
})

export class loginComponent extends NBaseComponent implements OnInit {
    userform;
    constructor(private formbuilder:FormBuilder,private router:Router) {
        super();
    }

    ngOnInit() {
        this.userform = this.formbuilder.group({
            username : ['', [Validators.required,Validators.pattern("^[a-zA-Z ]*$")]],
            password : ['', [Validators.required,Validators.maxLength(6)]]

        })
    }
    onClick(){
        if(this.userform.invalid){
            console.log("Error :",'Enter Valid Details')
        }else {
        console.log(this.userform.value)
        this.router.navigate(['/dashboard'])
        }
    }
}
