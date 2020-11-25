import { Component, Input } from '@angular/core';

@Component({
  selector: 'hello',
  template: `<h2>BJSS {{name}}!</h2>`,
  styles: [`h1 { font-family: Lato; }`]
})
export class HelloComponent  {
  @Input() name: string;
}
