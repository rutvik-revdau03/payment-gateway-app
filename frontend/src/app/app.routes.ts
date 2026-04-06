import { Routes } from '@angular/router';
import { ProductsComponent } from './components/products/products.component';
import { PaymentComponent } from './components/payment/payment.component';
import { SuccessComponent } from './components/success/success.component';
import { OrderHistoryComponent } from './components/order-history/order-history.component';
import { AboutComponent } from './pages/about/about.component';
import { ContactComponent } from './pages/contact/contact.component';
import { LoginComponent } from './pages/login/login.component';
import { LandingComponent } from './pages/landing/landing.component';
import { SignupComponent } from './pages/signup/signup.component';
import { AdminComponent } from './pages/admin/admin.component';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '',         component: LandingComponent  },  // Landing page
  { path: 'products', component: ProductsComponent },  // product selection
  { path: 'payment',  component: PaymentComponent  },  // Payment page
  { path: 'success',  component: SuccessComponent  },  // Success page
  { path: 'history',  component: OrderHistoryComponent }, // Order History
  { path: 'about',    component: AboutComponent    },
  { path: 'contact',  component: ContactComponent  },
  { path: 'login',    component: LoginComponent    },
  { path: 'signup',   component: SignupComponent   },
  { path: 'admin',    component: AdminComponent, canActivate: [adminGuard] },
  { path: '**',       redirectTo: ''               }   // Unknown routes → landing
];