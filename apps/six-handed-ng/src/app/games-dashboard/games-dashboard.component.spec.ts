import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GamesDashboardComponent } from './games-dashboard.component';

describe('GamesDashboardComponent', () => {
  let component: GamesDashboardComponent;
  let fixture: ComponentFixture<GamesDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GamesDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GamesDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
