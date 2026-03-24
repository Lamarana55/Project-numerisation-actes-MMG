import { Component } from '@angular/core';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  providers: [provideCharts(withDefaultRegisterables())],
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
