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
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[@$!%*?&])[A-Za-zd@$!%*?&]{8,20}$/;

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @IsAlphanumeric(null, {
    message: 'Username must consist of alpha numeric chars. only',
  })
  @MinLength(4, { message: 'Username must be at least 4 symbols long' })
  username: string;

  @IsNotEmpty()
  @IsEmail(null, { message: 'Provided email is invalid' })
  email: string;

  @IsNotEmpty()
  @Matches(passwordRegEx, {
    message:
      'Password must be from 8 to 20 symbols long, contain at least one: uppercase letter, lowecase letter, number, special character',
  })
  password: string;

  @IsInt()
  @Min(13, { message: 'Users must be at least 13 y.o' })
  age: number;

  @IsString()
  @IsEnum(['Male', 'Female', 'Unspecified'])
  gender: string;
}