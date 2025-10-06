import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('🧹 Đang xoá dữ liệu cũ...');

  await prisma.shuttle_assignments.deleteMany();
  await prisma.shuttle_requests.deleteMany();
  await prisma.payments.deleteMany();
  await prisma.tickets.deleteMany();

  await prisma.trips.deleteMany();
  await prisma.company_route_stops.deleteMany();
  await prisma.company_routes.deleteMany();
  await prisma.vehicles.deleteMany();
  await prisma.seat_layout_templates.deleteMany();
  await prisma.vehicle_types.deleteMany();

  await prisma.session.deleteMany();
  await prisma.customer_profiles.deleteMany();
  await prisma.customers.deleteMany();

  await prisma.role_module_permissions.deleteMany();
  await prisma.permissions.deleteMany();
  await prisma.modules.deleteMany();
  await prisma.roles.deleteMany();

  await prisma.transport_companies.deleteMany();
  await prisma.users.deleteMany();
  await prisma.routes.deleteMany();
  await prisma.locations.deleteMany();

  console.log('✅ Đã xoá sạch dữ liệu.');
}

async function seedRolesAndModules() {
  const roles = await prisma.roles.createMany({
    data: [
      { name: 'admin', description: 'Quản trị viên hệ thống' },
      { name: 'owner', description: 'Chủ nhà xe' },
      { name: 'driver', description: 'Tài xế' },
    ],
  });

  const modules = await prisma.modules.createMany({
    data: [
      { name: 'User Management', code: 'USERS', description: 'Quản lý người dùng' },
      { name: 'Company', code: 'TRANSPORT', description: 'Công ty vận tải' },
      { name: 'Permission', code: 'PERM', description: 'Quyền truy cập' },
      { name: 'Trips', code: 'TRIPS', description: 'Quản lý chuyến đi' },
      { name: 'Vehicles', code: 'VEHICLES', description: 'Quản lý phương tiện' },
    ],
  });

  console.log('✅ Đã tạo roles và modules.');
}

async function seedPermissionsAndRoleMappings() {
  const roles = await prisma.roles.findMany();
  const modules = await prisma.modules.findMany();

  for (const mod of modules) {
    const basePermissions = [
      { name: `${mod.code.toLowerCase()}_create`, bit_value: 1, description: 'Tạo', module_id: mod.module_id },
      { name: `${mod.code.toLowerCase()}_read`, bit_value: 2, description: 'Xem', module_id: mod.module_id },
      { name: `${mod.code.toLowerCase()}_update`, bit_value: 4, description: 'Sửa', module_id: mod.module_id },
      { name: `${mod.code.toLowerCase()}_delete`, bit_value: 8, description: 'Xoá', module_id: mod.module_id },
    ];
    await prisma.permissions.createMany({ data: basePermissions });
  }

  const adminRole = roles.find(r => r.name === 'admin');
  const ownerRole = roles.find(r => r.name === 'owner');
  const driverRole = roles.find(r => r.name === 'driver');

  for (const mod of modules) {
    // Gán full CRUD cho admin
    await prisma.role_module_permissions.create({
      data: {
        role_id: adminRole!.role_id,
        module_id: mod.module_id,
        permissions_bitmask: 15,
      },
    });
  }

  // Owner chỉ có quyền full ở 3 module
  for (const code of ['TRANSPORT', 'TRIPS', 'VEHICLES']) {
    const mod = modules.find(m => m.code === code);
    if (mod)
      await prisma.role_module_permissions.create({
        data: {
          role_id: ownerRole!.role_id,
          module_id: mod.module_id,
          permissions_bitmask: 15,
        },
      });
  }

  // Driver chỉ được xem chuyến đi
  const tripMod = modules.find(m => m.code === 'TRIPS');
  if (tripMod)
    await prisma.role_module_permissions.create({
      data: {
        role_id: driverRole!.role_id,
        module_id: tripMod.module_id,
        permissions_bitmask: 2,
      },
    });

  console.log('✅ Đã tạo permissions và gán quyền cho các roles.');
}

async function seedCompanyAndUsers() {
  const company = await prisma.transport_companies.create({
    data: {
      name: 'LeafTech Transport',
      tax_code: 'MST123456789',
      address: '123 Nguyễn Huệ, Q1, TP.HCM',
      contact_person: 'Nguyễn Văn A',
    },
  });

  const [adminRole, ownerRole, driverRole] = await Promise.all([
    prisma.roles.findFirst({ where: { name: 'admin' } }),
    prisma.roles.findFirst({ where: { name: 'owner' } }),
    prisma.roles.findFirst({ where: { name: 'driver' } }),
  ]);

  await prisma.users.createMany({
    data: [
      {
        email: 'admin@leaf.vn',
        password_hash: await bcrypt.hash('admin123', 10),
        role_id: adminRole!.role_id,
        phone: '0909999999',
      },
      {
        email: 'owner@leaf.vn',
        password_hash: await bcrypt.hash('owner123', 10),
        role_id: ownerRole!.role_id,
        phone: '0908888888',
        company_id: company.id,
      },
      {
        email: 'driver@leaf.vn',
        password_hash: await bcrypt.hash('driver123', 10),
        role_id: driverRole!.role_id,
        phone: '0907777777',
        company_id: company.id,
      },
    ],
  });

  console.log('✅ Đã tạo công ty và users.');
}

async function main() {
  console.log('🚀 Bắt đầu seed dữ liệu...');

  await clearDatabase();
  await seedRolesAndModules();
  await seedPermissionsAndRoleMappings();
  await seedCompanyAndUsers();

  console.log('🎉 Seeding hoàn tất!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding thất bại:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
