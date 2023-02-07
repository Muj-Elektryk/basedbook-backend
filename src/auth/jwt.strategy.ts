import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { JwtAuthDto } from './dto/jwt-auth.dto';

const { SECRET } = process.env;

const extractFromCookie = (req: any): string | null => {
  console.log(req.cookies);
  if (req && req.cookies) return req.cookies['jwt'];
  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: extractFromCookie,
      secretOrKey: SECRET,
    });
  }

  async validate(jwtAuthDto: JwtAuthDto): Promise<any> {
    /*
     * In this function we can do entire validation / authorization
     * returning value will be assigned to req.user
     */
    console.log('validation successful, jwtAuthDto: ', jwtAuthDto);
    return jwtAuthDto;
  }
}
