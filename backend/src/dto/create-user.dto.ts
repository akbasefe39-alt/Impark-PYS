import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  profilePicture?: string;

  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz.' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(3, { message: 'Şifre en az 3 karakter olmalıdır.' })
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  unvan?: string;

  @IsNumber()
  @IsOptional()
  toplamIzinHakki?: number;

  @IsString()
  @IsOptional()
  iseGirisTarihi?: string;

  @IsNumber()
  @IsOptional()
  normalCalismaSaati?: number;

  @IsNumber()
  @IsOptional()
  saatlikUcret?: number;

  @IsNumber()
  @IsOptional()
  gunlukUcret?: number;

  @IsBoolean()
  @IsOptional()
  canViewDashboard?: boolean;

  @IsBoolean()
  @IsOptional()
  canManagePersonnel?: boolean;

  @IsBoolean()
  @IsOptional()
  canManageFinance?: boolean;

  @IsBoolean()
  @IsOptional()
  canApproveLeaves?: boolean;

  @IsBoolean()
  @IsOptional()
  canManageInventory?: boolean;

  @IsBoolean()
  @IsOptional()
  canViewLogs?: boolean;

  @IsString()
  @IsOptional()
  tcKimlikNo?: string;

  @IsString()
  @IsOptional()
  telefon?: string;

  @IsString()
  @IsOptional()
  dogumTarihi?: string;

  @IsString()
  @IsOptional()
  kanGrubu?: string;

  @IsString()
  @IsOptional()
  medeniHal?: string;

  @IsString()
  @IsOptional()
  cinsiyet?: string;

  @IsString()
  @IsOptional()
  acilDurumKisisi?: string;

  @IsString()
  @IsOptional()
  acilDurumTelefonu?: string;

  @IsString()
  @IsOptional()
  mezuniyet?: string;

  @IsString()
  @IsOptional()
  adres?: string;

  @IsString()
  @IsOptional()
  sgkNo?: string;

  @IsString()
  @IsOptional()
  vergiNo?: string;

  @IsString()
  @IsOptional()
  iban?: string;

  @IsString()
  @IsOptional()
  ehliyetSinifi?: string;

  @IsString()
  @IsOptional()
  askerlikDurumu?: string;

  @IsString()
  @IsOptional()
  sozlesmeTipi?: string;

  @IsString()
  @IsOptional()
  uyruk?: string;

  @IsString()
  @IsOptional()
  istenAyrilisTarihi?: string;

  @IsOptional()
  departmanId?: number;
}
