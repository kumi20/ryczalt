import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { EventService } from '../../services/event-services.service';
import { Location } from '@angular/common';
import { DxButtonModule } from 'devextreme-angular/ui/button';

@Component({
  selector: 'app-no-found',
  templateUrl: './no-found.component.html',
  styleUrls: ['./no-found.component.scss'],
  imports: [DxButtonModule],
  standalone: true,
})
export class NoFoundComponent {
  private location = inject(Location);
  private activatedRoute = inject(ActivatedRoute);
  route = inject(Router);
  event = inject(EventService);

  history() {
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params['log']) {
        localStorage.clear();

          this.route.navigate(['']);

      } else {
        this.location.back();
      }
    });
  }
}
