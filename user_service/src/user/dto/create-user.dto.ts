import {
  IsAlphanumeric,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Min,
  MinLength,
} from 'class-validator';

const passwordRegEx =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @IsAlphanumeric()
  @MinLength(4, { message: 'username must be at least 4 symbols long' })
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Matches(passwordRegEx, {
    message:
      'password must be from 8 to 20 symbols long, contain at least one: uppercase letter, lowecase letter, number, special character',
  })
  password: string;

  @IsInt()
  @Min(13, { message: 'users must be at least 13 y.o' })
  age: number;

  @IsString()
  @IsEnum(['Male', 'Female', 'Unspecified'], {
    message:
      "gender must be one of the following values: 'Male', 'Female', 'Unspecified'",
  })
  gender: string;
}
