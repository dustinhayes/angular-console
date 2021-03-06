import {
  CREATE_WORKSPACE,
  FeatureWorkspaceRouteState,
  IMPORT_WORKSPACE,
  WORKSPACES
} from '@angular-console/feature-workspaces';
import { ContextualActionBarService, FADE_IN } from '@angular-console/ui';
import { transition, trigger } from '@angular/animations';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Settings } from '@angular-console/utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'angular-console-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('routerTransition', [
      transition('void => *', []),
      transition(`* => *`, FADE_IN)
    ])
  ]
})
export class AppComponent implements OnInit {
  @ViewChild(RouterOutlet) routerOutlet: RouterOutlet;
  routerTransition: Observable<string>;
  settingsLoaded: boolean;

  ngOnInit() {
    this.routerTransition = this.routerOutlet.activateEvents.pipe(
      map(() => this.routerOutlet.activatedRouteData.state)
    );
  }

  constructor(
    router: Router,
    public settings: Settings,
    contextualActionBarService: ContextualActionBarService
  ) {
    settings.fetch().subscribe(() => {
      this.settingsLoaded = true;
      router.initialNavigation();
    });

    router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        const navigationEnd = event as NavigationEnd;
        if (navigationEnd.url.startsWith('/workspace/')) {
          contextualActionBarService.contextualTabs$.next(null);
        } else {
          switch (
            this.routerOutlet.activatedRouteData
              .state as FeatureWorkspaceRouteState
          ) {
            case CREATE_WORKSPACE:
              contextualActionBarService.breadcrumbs$.next([
                { title: 'Create A New Workspace' }
              ]);
              break;
            case IMPORT_WORKSPACE:
              contextualActionBarService.breadcrumbs$.next([
                { title: 'Import An Existing Workspace' }
              ]);
              break;
            case WORKSPACES:
              contextualActionBarService.breadcrumbs$.next([
                { title: 'Recently Opened Workspaces' }
              ]);
              break;
          }

          contextualActionBarService.contextualTabs$.next({
            tabs: [
              {
                icon: 'view_list',
                name: 'Recent',
                routerLink: '/workspaces'
              },
              {
                icon: 'create_new_folder',
                name: 'Create',
                routerLink: '/create-workspace'
              },
              {
                icon: 'folder_open',
                name: 'Import',
                routerLink: '/import-workspace'
              }
            ]
          });
        }
      });
  }
}
