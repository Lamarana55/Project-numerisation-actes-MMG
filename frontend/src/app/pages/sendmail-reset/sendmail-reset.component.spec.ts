import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendmailResetComponent } from './sendmail-reset.component';

describe('SendmailResetComponent', () => {
  let component: SendmailResetComponent;
  let fixture: ComponentFixture<SendmailResetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SendmailResetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SendmailResetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
