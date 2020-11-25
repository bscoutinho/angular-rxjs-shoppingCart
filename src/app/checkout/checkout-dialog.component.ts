import { Component } from '@angular/core';;
import { ShoppingCartService } from '../shopping-cart.service';

@Component({
  selector: 'checkout-dialog',
  templateUrl: './checkout-dialog.component.html'
})
export class CheckoutDialog {
  state = this.shoppingCartService.state$.pipe();
  messages: [] = [];
  currencyChanged: boolean = false;
  exchangeValue: number = 1;
  currency: string = 'GBP'

  constructor(
    private shoppingCartService: ShoppingCartService) { }
  
  ngOnInit() {
    this.getCurrenciesList()
  }

  getCurrenciesList() {

    this.shoppingCartService.getCurrenciesList().subscribe( res => {

      let objArray: any = Object.values(res);

      this.messages = objArray.map(item => {
        const list = []
        for (let i in item) {
          list.push(item[i])
        }
        return list
      }).flat()

    });

  }

  changeCurrency(ev) {   
    this.shoppingCartService.getExchangeValue(ev).subscribe( res => { 
      let resVal: any = Object.values(res)
      this.exchangeValue = resVal
    })
    this.currencyChanged = true
  }


  
}