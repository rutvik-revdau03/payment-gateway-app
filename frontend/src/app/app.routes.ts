import { Routes } from '@angular/router';
import { ProductsComponent } from './components/products/products.component';
import { PaymentComponent } from './components/payment/payment.component';
import { SuccessComponent } from './components/success/success.component';

export const routes: Routes = [
  { path: '',         component: ProductsComponent },  // Home → product selection
  { path: 'payment',  component: PaymentComponent  },  // Payment page
  { path: 'success',  component: SuccessComponent  },  // Success page
  { path: '**',       redirectTo: ''               }   // Unknown routes → home
];