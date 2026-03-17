import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalitesListComponent } from './localites-list.component';

describe('LocalitesListComponent', () => {
  let component: LocalitesListComponent;
  let fixture: ComponentFixture<LocalitesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LocalitesListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LocalitesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
