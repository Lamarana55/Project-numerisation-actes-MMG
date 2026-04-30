import { Component, forwardRef, Input } from '@angular/core';
import {
  ControlValueAccessor, NG_VALUE_ACCESSOR,
  NG_VALIDATORS, Validator, AbstractControl, ValidationErrors
} from '@angular/forms';

export interface PhoneCountry {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  minLength: number;
  maxLength: number;
}

export const PHONE_COUNTRIES: PhoneCountry[] = [
  { code: 'GN', name: 'Guinée',           dialCode: '+224',  flag: '🇬🇳', minLength: 9,  maxLength: 9  },
  { code: 'CI', name: "Côte d'Ivoire",    dialCode: '+225',  flag: '🇨🇮', minLength: 10, maxLength: 10 },
  { code: 'SN', name: 'Sénégal',          dialCode: '+221',  flag: '🇸🇳', minLength: 9,  maxLength: 9  },
  { code: 'ML', name: 'Mali',             dialCode: '+223',  flag: '🇲🇱', minLength: 8,  maxLength: 8  },
  { code: 'BF', name: 'Burkina Faso',     dialCode: '+226',  flag: '🇧🇫', minLength: 8,  maxLength: 8  },
  { code: 'TG', name: 'Togo',             dialCode: '+228',  flag: '🇹🇬', minLength: 8,  maxLength: 8  },
  { code: 'BJ', name: 'Bénin',            dialCode: '+229',  flag: '🇧🇯', minLength: 8,  maxLength: 10 },
  { code: 'NE', name: 'Niger',            dialCode: '+227',  flag: '🇳🇪', minLength: 8,  maxLength: 8  },
  { code: 'MR', name: 'Mauritanie',       dialCode: '+222',  flag: '🇲🇷', minLength: 8,  maxLength: 8  },
  { code: 'NG', name: 'Nigeria',          dialCode: '+234',  flag: '🇳🇬', minLength: 10, maxLength: 10 },
  { code: 'GH', name: 'Ghana',            dialCode: '+233',  flag: '🇬🇭', minLength: 9,  maxLength: 9  },
  { code: 'GM', name: 'Gambie',           dialCode: '+220',  flag: '🇬🇲', minLength: 7,  maxLength: 7  },
  { code: 'SL', name: 'Sierra Leone',     dialCode: '+232',  flag: '🇸🇱', minLength: 8,  maxLength: 8  },
  { code: 'LR', name: 'Liberia',          dialCode: '+231',  flag: '🇱🇷', minLength: 7,  maxLength: 8  },
  { code: 'GW', name: 'Guinée-Bissau',    dialCode: '+245',  flag: '🇬🇼', minLength: 7,  maxLength: 7  },
  { code: 'CV', name: 'Cap-Vert',         dialCode: '+238',  flag: '🇨🇻', minLength: 7,  maxLength: 7  },
  { code: 'CM', name: 'Cameroun',         dialCode: '+237',  flag: '🇨🇲', minLength: 9,  maxLength: 9  },
  { code: 'TD', name: 'Tchad',            dialCode: '+235',  flag: '🇹🇩', minLength: 8,  maxLength: 8  },
  { code: 'GA', name: 'Gabon',            dialCode: '+241',  flag: '🇬🇦', minLength: 7,  maxLength: 8  },
  { code: 'CG', name: 'Congo',            dialCode: '+242',  flag: '🇨🇬', minLength: 9,  maxLength: 9  },
  { code: 'CD', name: 'Congo (RDC)',       dialCode: '+243',  flag: '🇨🇩', minLength: 9,  maxLength: 9  },
  { code: 'CF', name: 'Centrafrique',     dialCode: '+236',  flag: '🇨🇫', minLength: 8,  maxLength: 8  },
  { code: 'MA', name: 'Maroc',            dialCode: '+212',  flag: '🇲🇦', minLength: 9,  maxLength: 9  },
  { code: 'DZ', name: 'Algérie',          dialCode: '+213',  flag: '🇩🇿', minLength: 9,  maxLength: 9  },
  { code: 'TN', name: 'Tunisie',          dialCode: '+216',  flag: '🇹🇳', minLength: 8,  maxLength: 8  },
  { code: 'EG', name: 'Égypte',           dialCode: '+20',   flag: '🇪🇬', minLength: 10, maxLength: 10 },
  { code: 'LY', name: 'Libye',            dialCode: '+218',  flag: '🇱🇾', minLength: 9,  maxLength: 9  },
  { code: 'FR', name: 'France',           dialCode: '+33',   flag: '🇫🇷', minLength: 9,  maxLength: 9  },
  { code: 'BE', name: 'Belgique',         dialCode: '+32',   flag: '🇧🇪', minLength: 8,  maxLength: 9  },
  { code: 'CH', name: 'Suisse',           dialCode: '+41',   flag: '🇨🇭', minLength: 9,  maxLength: 9  },
  { code: 'GB', name: 'Royaume-Uni',      dialCode: '+44',   flag: '🇬🇧', minLength: 10, maxLength: 10 },
  { code: 'DE', name: 'Allemagne',        dialCode: '+49',   flag: '🇩🇪', minLength: 10, maxLength: 11 },
  { code: 'ES', name: 'Espagne',          dialCode: '+34',   flag: '🇪🇸', minLength: 9,  maxLength: 9  },
  { code: 'IT', name: 'Italie',           dialCode: '+39',   flag: '🇮🇹', minLength: 9,  maxLength: 10 },
  { code: 'PT', name: 'Portugal',         dialCode: '+351',  flag: '🇵🇹', minLength: 9,  maxLength: 9  },
  { code: 'US', name: 'États-Unis',       dialCode: '+1',    flag: '🇺🇸', minLength: 10, maxLength: 10 },
  { code: 'CA', name: 'Canada',           dialCode: '+1CA',  flag: '🇨🇦', minLength: 10, maxLength: 10 },
  { code: 'BR', name: 'Brésil',           dialCode: '+55',   flag: '🇧🇷', minLength: 10, maxLength: 11 },
  { code: 'CN', name: 'Chine',            dialCode: '+86',   flag: '🇨🇳', minLength: 11, maxLength: 11 },
  { code: 'LB', name: 'Liban',            dialCode: '+961',  flag: '🇱🇧', minLength: 7,  maxLength: 8  },
  { code: 'SA', name: 'Arabie Saoudite',  dialCode: '+966',  flag: '🇸🇦', minLength: 9,  maxLength: 9  },
  { code: 'TR', name: 'Turquie',          dialCode: '+90',   flag: '🇹🇷', minLength: 10, maxLength: 10 },
];

@Component({
  selector: 'app-phone-input',
  templateUrl: './phone-input.component.html',
  styleUrls: ['./phone-input.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true,
    },
  ],
})
export class PhoneInputComponent implements ControlValueAccessor, Validator {
  @Input() label = 'Numéro de téléphone';
  @Input() placeholder = '000 000 000';

  countries = PHONE_COUNTRIES;
  selectedDialCode = '+224';
  localNumber = '';
  isDisabled = false;
  touched = false;

  private onChange = (_: any) => {};
  private onTouched = () => {};
  private onValidatorChange = () => {};

  get currentCountry(): PhoneCountry | undefined {
    return this.countries.find(c => c.dialCode === this.selectedDialCode);
  }

  get formatError(): string | null {
    if (!this.localNumber.trim()) return null;
    const country = this.currentCountry;
    if (!country) return null;
    const digits = this.localNumber.replace(/\D/g, '');
    if (digits.length < country.minLength || digits.length > country.maxLength) {
      const expected = country.minLength === country.maxLength
        ? `${country.minLength} chiffres`
        : `${country.minLength} à ${country.maxLength} chiffres`;
      return `Format invalide pour ${country.name} : ${expected} requis`;
    }
    return null;
  }

  get hint(): string | null {
    const country = this.currentCountry;
    if (!country || !this.localNumber.trim()) return null;
    const digits = this.localNumber.replace(/\D/g, '');
    const expected = country.minLength === country.maxLength
      ? country.minLength
      : `${country.minLength}-${country.maxLength}`;
    return `${digits.length}/${expected}`;
  }

  validate(_control: AbstractControl): ValidationErrors | null {
    return this.formatError ? { phoneFormat: { message: this.formatError } } : null;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  onDialCodeChange(dialCode: string): void {
    this.selectedDialCode = dialCode;
    this.onValidatorChange();
    this.emit();
  }

  onNumberInput(value: string): void {
    this.localNumber = value;
    this.touched = true;
    this.onValidatorChange();
    this.emit();
    this.onTouched();
  }

  private emit(): void {
    if (!this.localNumber.trim()) {
      this.onChange('');
      return;
    }
    const dc = this.selectedDialCode.replace(/[^+\d]/g, '');
    this.onChange(`${dc} ${this.localNumber.trim()}`);
  }

  writeValue(value: string): void {
    if (!value) {
      this.localNumber = '';
      this.selectedDialCode = '+224';
      return;
    }
    const sorted = [...this.countries].sort(
      (a, b) => b.dialCode.replace(/\D/g, '').length - a.dialCode.replace(/\D/g, '').length
    );
    for (const country of sorted) {
      const dc = country.dialCode.replace(/[^+\d]/g, '');
      if (value.startsWith(dc + ' ') || value.startsWith(dc)) {
        this.selectedDialCode = country.dialCode;
        this.localNumber = value.slice(dc.length).trim();
        return;
      }
    }
    this.localNumber = value;
  }

  registerOnChange(fn: any): void  { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.isDisabled = d; }
}
