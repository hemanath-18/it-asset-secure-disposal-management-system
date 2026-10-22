import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Asset from './models/Asset.js';
import WipingRecord from './models/WipingRecord.js';
import DisposalRecord from './models/DisposalRecord.js';
import RecyclingRecord from './models/RecyclingRecord.js';
import AuditLog from './models/AuditLog.js';

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/it_asset_disposal';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Asset.deleteMany({});
    await WipingRecord.deleteMany({});
    await DisposalRecord.deleteMany({});
    await RecyclingRecord.deleteMany({});
    await AuditLog.deleteMany({});

    console.log('Cleared existing database records.');

    // 1. Create Users
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@disposal.org',
      password: 'Admin@123',
      role: 'ADMIN',
      department: 'IT Security'
    });

    const itStaff = await User.create({
      name: 'Alex Johnson',
      email: 'itstaff@disposal.org',
      password: 'Staff@123',
      role: 'IT_STAFF',
      department: 'IT Infrastructure'
    });

    const manager = await User.create({
      name: 'Elena Rostova',
      email: 'manager@disposal.org',
      password: 'Manager@123',
      role: 'MANAGER',
      department: 'Compliance & Asset Governance'
    });

    console.log('Created Users: Admin, IT Staff, Manager');

    // 2. Create Assets
    const assetsData = [
      {
        assetId: 'AST-2026-0001',
        type: 'Laptop',
        category: 'Compute',
        brand: 'Dell',
        model: 'Latitude 7420',
        serialNumber: 'DL-7420-98214',
        purchaseDate: new Date('2022-03-15'),
        assignedEmployee: 'Robert Vance',
        department: 'Finance',
        location: 'HQ Floor 3',
        condition: 'Good',
        status: 'REGISTERED',
        description: 'Standard finance laptop with encrypted NVMe storage.',
        createdBy: admin._id
      },
      {
        assetId: 'AST-2026-0002',
        type: 'Desktop',
        category: 'Compute',
        brand: 'HP',
        model: 'EliteDesk 800 G6',
        serialNumber: 'HP-800G6-4412',
        purchaseDate: new Date('2021-06-10'),
        assignedEmployee: 'Jessica Alba',
        department: 'Human Resources',
        location: 'HQ Floor 2',
        condition: 'Good',
        status: 'IN_USE',
        description: 'HR workstation desktop computer.',
        createdBy: itStaff._id
      },
      {
        assetId: 'AST-2026-0003',
        type: 'Server',
        category: 'Compute',
        brand: 'PowerEdge',
        model: 'R740xd Rack Server',
        serialNumber: 'PE-R740-9901X',
        purchaseDate: new Date('2019-11-01'),
        assignedEmployee: 'System Admin',
        department: 'IT',
        location: 'Data Center Rack 4B',
        condition: 'Fair',
        status: 'PENDING_DISPOSAL',
        description: 'Legacy application database server decomissioned due to cloud migration.',
        createdBy: admin._id
      },
      {
        assetId: 'AST-2026-0004',
        type: 'Hard Disk',
        category: 'Storage',
        brand: 'Seagate',
        model: 'IronWolf Pro 10TB HDD',
        serialNumber: 'SG-10TB-8841',
        purchaseDate: new Date('2020-01-20'),
        assignedEmployee: 'Unassigned',
        department: 'IT',
        location: 'IT Secure Storage Safe B',
        condition: 'Fair',
        status: 'DATA_WIPING',
        description: 'Enterprise HDD pulled from storage array.',
        createdBy: itStaff._id
      },
      {
        assetId: 'AST-2026-0005',
        type: 'Laptop',
        category: 'Compute',
        brand: 'Lenovo',
        model: 'ThinkPad X1 Carbon Gen 8',
        serialNumber: 'LN-X1C8-5521A',
        purchaseDate: new Date('2020-05-12'),
        assignedEmployee: 'David Kim',
        department: 'Engineering',
        location: 'HQ Floor 4',
        condition: 'Poor',
        status: 'WIPING_COMPLETED',
        description: 'Engineering laptop scheduled for recycling following hardware failure.',
        createdBy: itStaff._id
      },
      {
        assetId: 'AST-2026-0006',
        type: 'SSD',
        category: 'Storage',
        brand: 'Samsung',
        model: '970 EVO Plus 2TB',
        serialNumber: 'SS-970EVO-1123',
        purchaseDate: new Date('2021-09-14'),
        assignedEmployee: 'Unassigned',
        department: 'IT',
        location: 'IT Disposal Cabinet A',
        condition: 'Good',
        status: 'WIPING_VERIFIED',
        description: 'Enterprise SSD passed cryptographic wipe verification.',
        createdBy: itStaff._id
      },
      {
        assetId: 'AST-2026-0007',
        type: 'Mobile',
        category: 'Mobile Device',
        brand: 'Apple',
        model: 'iPhone 11 128GB',
        serialNumber: 'AP-IP11-77890',
        purchaseDate: new Date('2020-02-18'),
        assignedEmployee: 'Claire Underwood',
        department: 'Executive',
        location: 'HQ Executive Suite',
        condition: 'Fair',
        status: 'DISPOSAL_APPROVED',
        description: 'Executive smartphone approved for certified electronics recycling.',
        createdBy: itStaff._id
      },
      {
        assetId: 'AST-2026-0008',
        type: 'Desktop',
        category: 'Compute',
        brand: 'Dell',
        model: 'OptiPlex 7070 Mini',
        serialNumber: 'DL-7070M-33421',
        purchaseDate: new Date('2019-08-11'),
        assignedEmployee: 'Unassigned',
        department: 'Operations',
        location: 'Logistics Warehouse',
        condition: 'Poor',
        status: 'RECYCLE',
        description: 'Mini PC assigned to E-Waste Recycler GreenTech Solutions.',
        createdBy: itStaff._id
      },
      {
        assetId: 'AST-2026-0009',
        type: 'Laptop',
        category: 'Compute',
        brand: 'Apple',
        model: 'MacBook Pro 16-inch (2019)',
        serialNumber: 'AP-MBP16-99881',
        purchaseDate: new Date('2020-04-10'),
        assignedEmployee: 'Intern Pool',
        department: 'Design',
        location: 'HQ Studio B',
        condition: 'Good',
        status: 'REUSE',
        description: 'Wiped and refurbished for internal intern allocation.',
        createdBy: itStaff._id
      },
      {
        assetId: 'AST-2026-0010',
        type: 'Hard Disk',
        category: 'Storage',
        brand: 'Western Digital',
        model: 'Ultrastar DC HC550 18TB',
        serialNumber: 'WD-HC550-9012',
        purchaseDate: new Date('2020-10-05'),
        assignedEmployee: 'Unassigned',
        department: 'IT',
        location: 'Shredding Storage Room',
        condition: 'Damaged',
        status: 'DESTROY',
        description: 'Damaged disk drive marked for physical degaussing and shredding.',
        createdBy: admin._id
      },
      {
        assetId: 'AST-2026-0011',
        type: 'Server',
        category: 'Compute',
        brand: 'Cisco',
        model: 'UCS B200 M5 Blade',
        serialNumber: 'CS-UCSB200-551',
        purchaseDate: new Date('2018-12-01'),
        assignedEmployee: 'Unassigned',
        department: 'IT',
        location: 'Completed Archive Vault',
        condition: 'Poor',
        status: 'DISPOSAL_COMPLETED',
        description: 'Legacy blade server fully recycled with certificate of destruction.',
        createdBy: admin._id
      },
      {
        assetId: 'AST-2026-0012',
        type: 'Network Equipment',
        category: 'Networking',
        brand: 'Cisco',
        model: 'Catalyst 9300 48-Port Switch',
        serialNumber: 'CS-C9300-44912',
        purchaseDate: new Date('2019-03-22'),
        assignedEmployee: 'Unassigned',
        department: 'IT Network',
        location: 'IT Archive Closet',
        condition: 'Damaged',
        status: 'WIPING_FAILED',
        description: 'Switch failed initial automated memory purge. Requires manual degaussing.',
        createdBy: itStaff._id
      }
    ];

    const createdAssets = await Asset.insertMany(assetsData);
    console.log(`Created ${createdAssets.length} Assets.`);

    const assetMap = new Map(createdAssets.map(a => [a.assetId, a]));

    // 3. Create Wiping Records
    const wipingRecordsData = [
      {
        asset: assetMap.get('AST-2026-0004')._id,
        wipingMethod: 'Overwrite',
        status: 'IN_PROGRESS',
        operator: itStaff._id,
        startedAt: new Date(Date.now() - 3600000 * 4),
        verificationStatus: 'PENDING',
        evidenceReference: 'WIPE-LOG-2026-0004.log',
        notes: 'DOD 5220.22-M 3-pass overwrite in progress.'
      },
      {
        asset: assetMap.get('AST-2026-0005')._id,
        wipingMethod: 'Secure Erase',
        status: 'COMPLETED',
        operator: itStaff._id,
        startedAt: new Date(Date.now() - 86400000 * 2),
        completedAt: new Date(Date.now() - 86400000 * 2 + 7200000),
        verificationStatus: 'PENDING',
        evidenceReference: 'NVME-CERT-2026-05.pdf',
        certificateUrl: 'https://storage.disposal.org/certs/NVME-CERT-2026-05.pdf',
        notes: 'ATA Secure Erase command sent successfully. Zero fill verified.'
      },
      {
        asset: assetMap.get('AST-2026-0006')._id,
        wipingMethod: 'Cryptographic Erase',
        status: 'VERIFIED',
        operator: itStaff._id,
        startedAt: new Date(Date.now() - 86400000 * 5),
        completedAt: new Date(Date.now() - 86400000 * 5 + 3600000),
        verificationStatus: 'VERIFIED',
        verifiedBy: manager._id,
        verifiedAt: new Date(Date.now() - 86400000 * 4),
        verificationNotes: 'Cryptographic key destruction verified via SED controller log.',
        evidenceReference: 'CRYPTO-VERIFY-8812.json',
        notes: 'Encryption keys destroyed and sanitization verified.'
      },
      {
        asset: assetMap.get('AST-2026-0007')._id,
        wipingMethod: 'Manufacturer Secure Erase',
        status: 'VERIFIED',
        operator: itStaff._id,
        startedAt: new Date(Date.now() - 86400000 * 7),
        completedAt: new Date(Date.now() - 86400000 * 7 + 1800000),
        verificationStatus: 'VERIFIED',
        verifiedBy: manager._id,
        verifiedAt: new Date(Date.now() - 86400000 * 6),
        verificationNotes: 'Factory reset and MDM removal confirmed.',
        evidenceReference: 'IOS-SAN-9901.pdf',
        notes: 'Apple configurator remote wipe and device activation lock removed.'
      },
      {
        asset: assetMap.get('AST-2026-0008')._id,
        wipingMethod: 'Secure Erase',
        status: 'VERIFIED',
        operator: itStaff._id,
        startedAt: new Date(Date.now() - 86400000 * 10),
        completedAt: new Date(Date.now() - 86400000 * 10 + 5400000),
        verificationStatus: 'VERIFIED',
        verifiedBy: manager._id,
        verifiedAt: new Date(Date.now() - 86400000 * 9),
        verificationNotes: 'Certified zero-overwrite log uploaded and validated.',
        evidenceReference: 'OPT-WIPE-7070.pdf'
      },
      {
        asset: assetMap.get('AST-2026-0009')._id,
        wipingMethod: 'Cryptographic Erase',
        status: 'VERIFIED',
        operator: itStaff._id,
        startedAt: new Date(Date.now() - 86400000 * 12),
        completedAt: new Date(Date.now() - 86400000 * 12 + 2000000),
        verificationStatus: 'VERIFIED',
        verifiedBy: manager._id,
        verifiedAt: new Date(Date.now() - 86400000 * 11),
        verificationNotes: 'FileVault key destroyed, fresh macOS Sequoia installed for internal reuse.',
        evidenceReference: 'MAC-REUSE-998.pdf'
      },
      {
        asset: assetMap.get('AST-2026-0010')._id,
        wipingMethod: 'Physical Destruction',
        status: 'VERIFIED',
        operator: itStaff._id,
        startedAt: new Date(Date.now() - 86400000 * 3),
        completedAt: new Date(Date.now() - 86400000 * 3 + 1000000),
        verificationStatus: 'VERIFIED',
        verifiedBy: manager._id,
        verifiedAt: new Date(Date.now() - 86400000 * 2),
        verificationNotes: 'Disk degaussed using NSA-approved magnetic degausser.',
        evidenceReference: 'DEGAUSS-CERT-18TB.pdf'
      },
      {
        asset: assetMap.get('AST-2026-0011')._id,
        wipingMethod: 'Overwrite',
        status: 'VERIFIED',
        operator: itStaff._id,
        startedAt: new Date(Date.now() - 86400000 * 20),
        completedAt: new Date(Date.now() - 86400000 * 20 + 10000000),
        verificationStatus: 'VERIFIED',
        verifiedBy: manager._id,
        verifiedAt: new Date(Date.now() - 86400000 * 19),
        verificationNotes: 'Full server array sanitized and certificate archived.',
        evidenceReference: 'UCS-PURGE-2018.pdf'
      },
      {
        asset: assetMap.get('AST-2026-0012')._id,
        wipingMethod: 'Secure Erase',
        status: 'FAILED',
        operator: itStaff._id,
        startedAt: new Date(Date.now() - 86400000 * 1),
        completedAt: new Date(Date.now() - 86400000 * 1 + 100000),
        verificationStatus: 'FAILED',
        verifiedBy: manager._id,
        verifiedAt: new Date(Date.now() - 86400000 * 1),
        verificationNotes: 'Memory chip write-protection error preventing complete firmware purge.',
        evidenceReference: 'FAIL-ERR-C9300.log',
        notes: 'Sanitization process halted at 42% due to flash controller error.'
      }
    ];

    await WipingRecord.insertMany(wipingRecordsData);
    console.log('Created Wiping Records.');

    // 4. Create Disposal Records
    const disposalRecordsData = [
      {
        asset: assetMap.get('AST-2026-0007')._id,
        disposalMethod: 'Recycle',
        approvalStatus: 'APPROVED',
        approvedBy: manager._id,
        approvalDate: new Date(Date.now() - 86400000 * 5),
        approvalNotes: 'Approved for R2-certified electronic recycling.',
        vendorRecycler: 'EcoTech Recycling Inc.',
        certificateNumber: 'CERT-RECY-2026-07'
      },
      {
        asset: assetMap.get('AST-2026-0008')._id,
        disposalMethod: 'Recycle',
        approvalStatus: 'APPROVED',
        approvedBy: manager._id,
        approvalDate: new Date(Date.now() - 86400000 * 8),
        approvalNotes: 'Approved for vendor collection.',
        vendorRecycler: 'GreenTech Solutions',
        certificateNumber: 'CERT-RECY-2026-08'
      },
      {
        asset: assetMap.get('AST-2026-0009')._id,
        disposalMethod: 'Reuse',
        approvalStatus: 'APPROVED',
        approvedBy: manager._id,
        approvalDate: new Date(Date.now() - 86400000 * 10),
        approvalNotes: 'Reassigned to Design department intern pool.',
        disposalDate: new Date(Date.now() - 86400000 * 9),
        finalStatus: 'COMPLETED'
      },
      {
        asset: assetMap.get('AST-2026-0010')._id,
        disposalMethod: 'Physical Destruction',
        approvalStatus: 'APPROVED',
        approvedBy: manager._id,
        approvalDate: new Date(Date.now() - 86400000 * 2),
        approvalNotes: 'Marked for physical shredding by Shred-It Enterprise.',
        vendorRecycler: 'Shred-It Enterprise Services',
        certificateNumber: 'SHRED-2026-10TB'
      },
      {
        asset: assetMap.get('AST-2026-0011')._id,
        disposalMethod: 'Recycle',
        approvalStatus: 'APPROVED',
        approvedBy: manager._id,
        approvalDate: new Date(Date.now() - 86400000 * 18),
        approvalNotes: 'Fully processed and recycled.',
        vendorRecycler: 'GreenTech Solutions',
        certificateNumber: 'CERT-RECY-2026-11',
        disposalDate: new Date(Date.now() - 86400000 * 15),
        finalStatus: 'COMPLETED'
      }
    ];

    const createdDisposals = await DisposalRecord.insertMany(disposalRecordsData);
    console.log('Created Disposal Records.');

    const disposalMap = new Map(createdDisposals.map(d => [d.asset.toString(), d]));

    // 5. Create Recycling Records
    const recyclingRecordsData = [
      {
        asset: assetMap.get('AST-2026-0008')._id,
        disposalRecord: disposalMap.get(assetMap.get('AST-2026-0008')._id.toString())._id,
        recyclerName: 'GreenTech Solutions',
        pickupDate: new Date(Date.now() - 86400000 * 6),
        recyclingStatus: 'RECYCLING_IN_PROGRESS',
        referenceNumber: 'REF-GT-8841',
        certificateNumber: 'CERT-RECY-2026-08',
        notes: 'Asset collected and batch undergoing material recovery processing.'
      },
      {
        asset: assetMap.get('AST-2026-0011')._id,
        disposalRecord: disposalMap.get(assetMap.get('AST-2026-0011')._id.toString())._id,
        recyclerName: 'GreenTech Solutions',
        pickupDate: new Date(Date.now() - 86400000 * 17),
        completionDate: new Date(Date.now() - 86400000 * 15),
        recyclingStatus: 'RECYCLING_COMPLETED',
        referenceNumber: 'REF-GT-1102',
        certificateNumber: 'CERT-RECY-2026-11',
        notes: 'Full destruction and precious metal extraction certificate received.'
      }
    ];

    await RecyclingRecord.insertMany(recyclingRecordsData);
    console.log('Created Recycling Records.');

    // 6. Create Audit Logs
    const auditLogsData = [
      {
        action: 'ASSET_REGISTERED',
        user: admin._id,
        userRole: 'ADMIN',
        asset: assetMap.get('AST-2026-0001')._id,
        description: 'Registered new Dell Latitude 7420 laptop.',
        newStatus: 'REGISTERED',
        timestamp: new Date(Date.now() - 86400000 * 30)
      },
      {
        action: 'STATUS_CHANGED',
        user: itStaff._id,
        userRole: 'IT_STAFF',
        asset: assetMap.get('AST-2026-0003')._id,
        description: 'Marked server AST-2026-0003 as PENDING_DISPOSAL.',
        previousStatus: 'IN_USE',
        newStatus: 'PENDING_DISPOSAL',
        timestamp: new Date(Date.now() - 86400000 * 14)
      },
      {
        action: 'WIPING_STARTED',
        user: itStaff._id,
        userRole: 'IT_STAFF',
        asset: assetMap.get('AST-2026-0006')._id,
        description: 'Initiated cryptographic erasure on Samsung SSD.',
        previousStatus: 'PENDING_DISPOSAL',
        newStatus: 'DATA_WIPING',
        timestamp: new Date(Date.now() - 86400000 * 5)
      },
      {
        action: 'WIPING_VERIFIED',
        user: manager._id,
        userRole: 'MANAGER',
        asset: assetMap.get('AST-2026-0006')._id,
        description: 'Verified cryptographic wiping log for AST-2026-0006.',
        previousStatus: 'WIPING_COMPLETED',
        newStatus: 'WIPING_VERIFIED',
        timestamp: new Date(Date.now() - 86400000 * 4)
      },
      {
        action: 'DISPOSAL_APPROVED',
        user: manager._id,
        userRole: 'MANAGER',
        asset: assetMap.get('AST-2026-0008')._id,
        description: 'Approved disposal via Recycle method for AST-2026-0008.',
        previousStatus: 'WIPING_VERIFIED',
        newStatus: 'DISPOSAL_APPROVED',
        timestamp: new Date(Date.now() - 86400000 * 8)
      },
      {
        action: 'RECYCLING_COMPLETED',
        user: manager._id,
        userRole: 'MANAGER',
        asset: assetMap.get('AST-2026-0011')._id,
        description: 'Recycling completed by GreenTech Solutions.',
        previousStatus: 'RECYCLING_IN_PROGRESS',
        newStatus: 'DISPOSAL_COMPLETED',
        timestamp: new Date(Date.now() - 86400000 * 15)
      }
    ];

    await AuditLog.insertMany(auditLogsData);
    console.log('Created Audit Logs.');

    console.log('\n--- SEEDING COMPLETED SUCCESSFULLY ---');
    console.log('Demo Credentials:');
    console.log('1. Admin:    admin@disposal.org    / Admin@123');
    console.log('2. IT Staff: itstaff@disposal.org  / Staff@123');
    console.log('3. Manager:  manager@disposal.org  / Manager@123');
    console.log('-------------------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
