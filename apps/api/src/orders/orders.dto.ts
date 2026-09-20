import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsIn,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { normalizePhone, toEnglishDigits } from '@majara/utils';

function trimString(value: unknown) {
  return typeof value === 'string' ? value.trim() : value;
}

function englishDigits(value: unknown) {
  return typeof value === 'string' ? toEnglishDigits(value).replace(/\s/g, '') : value;
}

function asPhone(value: unknown) {
  if (typeof value !== 'string') return value;
  try {
    return normalizePhone(value);
  } catch {
    return toEnglishDigits(value).replace(/[^\d]/g, '');
  }
}

export class CheckoutDto {
  @IsIn(['POST', 'COURIER_TEHRAN'], { message: 'روش ارسال نامعتبر است' })
  deliveryMethod!: 'POST' | 'COURIER_TEHRAN';

  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(2, { message: 'نام را وارد کنید' })
  @MaxLength(80)
  firstName!: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(2, { message: 'نام خانوادگی را وارد کنید' })
  @MaxLength(80)
  lastName!: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(2, { message: 'استان را انتخاب کنید' })
  @MaxLength(80)
  province!: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(2, { message: 'شهر را انتخاب کنید' })
  @MaxLength(80)
  city!: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @MinLength(5, { message: 'آدرس خیابان را وارد کنید' })
  @MaxLength(400)
  street!: string;

  @Transform(({ value }) => englishDigits(value))
  @Matches(/^\d{10}$/, { message: 'کدپستی باید ۱۰ رقم انگلیسی و بدون فاصله باشد' })
  postalCode!: string;

  @Transform(({ value }) => asPhone(value))
  @Matches(/^09\d{9}$/, { message: 'شماره موبایل نامعتبر است' })
  phone!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
