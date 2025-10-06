import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class AppService implements OnModuleInit {
  onModuleInit() {
    console.log('System Timezone (TZ):', process.env.TZ);
    console.log('Intl Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
  }
}
