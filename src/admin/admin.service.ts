import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginAdminDto } from './dto/login-admin.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Admin } from './entities/admin.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private AdminModel: Model<Admin>,
    private jwtService: JwtService,
  ) {}

  async add(createAdminDto: LoginAdminDto) {
    const { email, password } = createAdminDto;
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await this.AdminModel.create({
      email,
      password: hashPassword,
    });
    return user;
  }

  async login(loginAdminDto: LoginAdminDto) {
    const { email, password } = loginAdminDto;

    const user = await this.findByEmail(email);
    if (!user) throw new UnauthorizedException();

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException();

    const payload = { id: user._id };

    const token = await this.jwtService.signAsync(payload);
    user.password = '';
    return { user, ACCESS_TOKWN: token };
  }

  async findByEmail(email: string) {
    const user = await this.AdminModel.findOne({ email });
    return user;
  }
}
