import { PickType } from '@nestjs/swagger';
import { CreateCouponDto } from 'src/coupon/dto/create-coupon.dto';

export class ApplyCouponDto extends PickType(CreateCouponDto, ['code']) {}
