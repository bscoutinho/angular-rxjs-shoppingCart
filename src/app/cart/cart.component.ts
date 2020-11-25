import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CheckoutDialog } from '../checkout/checkout-dialog.component';
@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {
  @Input() state: any;

  constructor(private dialog: MatDialog) { }

  checkout(): void {
    let dialogRef = this.dialog.open(CheckoutDialog, {

      height: '400px',
      width: '600px',
    });
  }
}