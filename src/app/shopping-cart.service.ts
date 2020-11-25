import { Injectable, Inject } from '@angular/core';
import { v4 as uuid } from 'uuid';
import { Observable, of, merge, Subject, BehaviorSubject } from 'rxjs';
import { scan, startWith, map, tap, combineLatest, switchMap, skipWhile, shareReplay, debounceTime, publish, refCount, share } from 'rxjs/operators';
import { DATA_ITEMS } from '../data';
import { HttpClient } from '@angular/common/http';

export interface Totals {
  subTot: number;
  tax: number;
  grandTot: number;
}

export interface CartItem {
  price: number;
  name: string;
  details: string;
  uuid?: any;
  remove?: boolean;
}

export interface StateTree {
  store: CartItem[];
  cart: CartItem[];
  tot: Totals,
  checkout: boolean;
};

@Injectable()
export class ShoppingCartService {
  /**
   * Main Observables
   * 
   */
  private stateTree$ = new BehaviorSubject<StateTree>(null);
  private checkoutTrigger$ = new BehaviorSubject<boolean>(false);
  private cartAdd$ = new Subject<CartItem>();
  private cartRemove$ = new Subject<CartItem>();

  /**
   * Main application cart Observable
   * This could start with items from local storage or even an API call
   * We use scan peak at the items within the cart and add and remove
   */
  private get cart$(): Observable<CartItem[]> {
    return merge(this.cartAdd$, this.cartRemove$).pipe(
      startWith([]),
      scan((acc: CartItem[], item: CartItem) => {
        if (item) {
          if (item.remove) {
            return [...acc.filter(i => i.uuid !== item.uuid)];
          }
          return [...acc, item];
        }
      })
    );
  }

  /**
   * Calcs all Totals from being piped through the cart Observable
   * When an item gets added or removed it will automatically calc
   */
  private get total$(): Observable<Totals> {
    return this.cart$.pipe(
      map(items => {
        let total = 0;
        for (const i of items) {
          total += i.price;
        }
        return total;
      }),
      map(cost => ({
        subTot: cost,
        tax: .034 * cost,
        grandTot: .034 * cost + cost
      })
      )
    );
  }

  /**
   * Main Shopping Cart StateTree
   * Combines all dependencies and maps then to the StateTree Object 
   */
  state$: Observable<StateTree> = this.stateTree$.pipe(
    switchMap(() => this.getItems().pipe(
      combineLatest([this.cart$, this.total$, this.checkoutTrigger$]),
      debounceTime(0),
    )),
    map(([store, cart, tot, checkout]: any) => ({ store, cart, tot, checkout })),
    tap(state => {
      if (state.checkout) {
        console.log('checkout', state);
      }
    }),
    shareReplay(1)
  );

  constructor(
    private httpClient: HttpClient,
  ) { }

  // Mock data service call
  private getItems() {
    return of(DATA_ITEMS);
  }

  addCartItem(item: CartItem) {
    this.cartAdd$.next({ ...item, uuid: uuid() });
  }

  removeCartItem(item: CartItem) {
    this.cartRemove$.next({ ...item, remove: true });
  }

  //Fill select option field with API currency options
  getCurrenciesList() {
    const url = 'https://free.currconv.com/api/v7/currencies?apiKey=53f4bc913bc477a11a77'
    return this.httpClient.get(url);
  }

  //Call API to exchange values
  getExchangeValue(currency) {
    const url = `https://free.currconv.com/api/v7/convert?q=GBP_${currency}&compact=ultra&apiKey=53f4bc913bc477a11a77`
    return this.httpClient.get(url);
  }
}