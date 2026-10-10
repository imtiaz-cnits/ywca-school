/**
 * YWCA School - Legacy SQL Data Importer & Migrator
 * 
 * Reads `codenext_ywca_sms_soft.sql` and imports all real data:
 * - Users (Admin & Staff)
 * - Academic Classes, Sections, Shifts, Sessions
 * - Students & Guardian Details
 * - Student Enrollments & Roll History
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

function cleanVal(v) {
  if (!v) return null;
  let val = v.trim();
  if (val.toUpperCase() === 'NULL') return null;
  if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
    val = val.slice(1, -1);
  }
  val = val.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  return val.trim();
}

function tokenizeRow(rowStr) {
  const values = [];
  let current = '';
  let inQuote = false;
  let quoteChar = '';

  for (let i = 0; i < rowStr.length; i++) {
    const char = rowStr[i];
    if ((char === "'" || char === '"') && (i === 0 || rowStr[i - 1] !== '\\')) {
      if (!inQuote) {
        inQuote = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuote = false;
      } else {
        current += char;
      }
    } else if (char === ',' && !inQuote) {
      values.push(cleanVal(current));
      current = '';
    } else {
      current += char;
    }
  }
  values.push(cleanVal(current));
  return values;
}

function parseSqlValues(content, tableName) {
  const regex = new RegExp("INSERT INTO \\`" + tableName + "\\`[\\s\\S]*?VALUES\\s*([\\s\\S]*?);", "gi");
  const matches = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    const rawValues = match[1].trim();
    let currentRow = '';
    let inQuote = false;
    let quoteChar = '';
    let parenDepth = 0;

    for (let i = 0; i < rawValues.length; i++) {
      const char = rawValues[i];
      if ((char === "'" || char === '"') && (i === 0 || rawValues[i - 1] !== '\\')) {
        if (!inQuote) {
          inQuote = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuote = false;
        }
      }

      if (!inQuote) {
        if (char === '(') {
          parenDepth++;
          if (parenDepth === 1) {
            currentRow = '';
            continue;
          }
        } else if (char === ')') {
          parenDepth--;
          if (parenDepth === 0) {
            matches.push(tokenizeRow(currentRow));
            currentRow = '';
            continue;
          }
        }
      }

      if (parenDepth > 0) {
        currentRow += char;
      }
    }
  }
  return matches;
}

function parseSafeDate(d, defaultDate = null) {
  if (!d || d === '0000-00-00' || d === 'N/A') return defaultDate;
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? defaultDate : parsed;
}

async function main() {
  console.log('🚀 Starting Legacy SQL Data Migration into New Schema...');

  // Search for the SQL file
  const possiblePaths = [
    path.join(process.cwd(), 'codenext_ywca_sms_soft.sql'),
    path.join(__dirname, '..', 'codenext_ywca_sms_soft.sql'),
    path.join(__dirname, '..', '..', 'codenext_ywca_sms_soft.sql'),
    path.join(__dirname, 'codenext_ywca_sms_soft.sql'),
  ];

  let sqlPath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      sqlPath = p;
      break;
    }
  }

  if (!sqlPath) {
    console.error('❌ Could not find codenext_ywca_sms_soft.sql file.');
    process.exit(1);
  }

  console.log(`📖 Reading SQL Dump: ${sqlPath}`);
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');

  // 1. Migrate Users
  console.log('\n--- 1. Migrating Users ---');
  const userRows = parseSqlValues(sqlContent, 'users');
  for (const row of userRows) {
    const [id, img, firstName, lastName, email, mobile, pass, otp, status, role] = row;
    if (!email) continue;

    const fullName = `${firstName || ''} ${lastName || ''}`.trim() || 'Admin User';
    const userRole = role === 'admin' ? 'ADMIN' : 'STAFF';

    let finalPass = pass;
    if (!pass || !pass.startsWith('$2')) {
      finalPass = await bcrypt.hash('123456', 10);
    }

    await prisma.user.upsert({
      where: { email },
      update: {
        name: fullName,
        phone: mobile,
        role: userRole,
      },
      create: {
        name: fullName,
        email,
        phone: mobile,
        password: finalPass,
        role: userRole,
        status: status === 'approved' ? 'ACTIVE' : 'INACTIVE',
      },
    });
    console.log(`✅ User: ${email} (${fullName})`);
  }

  // Ensure default super admin exists
  const superPass = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@ywcaschool.edu.bd' },
    update: { password: superPass },
    create: {
      name: 'Super Administrator',
      email: 'admin@ywcaschool.edu.bd',
      phone: '01712345678',
      password: superPass,
      role: 'SUPER_ADMIN',
    },
  });

  // 2. Migrate Classes
  console.log('\n--- 2. Migrating Classes ---');
  const classRows = parseSqlValues(sqlContent, 'classes');
  const classMap = new Map(); // oldId -> newId

  for (const row of classRows) {
    const [id, className] = row;
    if (!className) continue;

    let cls = await prisma.class.findFirst({ where: { name: className } });
    if (!cls) {
      cls = await prisma.class.create({
        data: {
          name: className,
          numericValue: parseInt(id, 10) - 1,
          order: parseInt(id, 10),
        },
      });
    }
    classMap.set(parseInt(id, 10), cls.id);
    console.log(`✅ Class [${cls.id}]: ${className}`);
  }

  // 3. Migrate Sections
  console.log('\n--- 3. Migrating Sections ---');
  const sectionRows = parseSqlValues(sqlContent, 'sections');
  const sectionMap = new Map(); // oldId -> newId

  for (const row of sectionRows) {
    const [id, sectionName] = row;
    if (!sectionName) continue;

    let sec = await prisma.section.findFirst({ where: { name: sectionName } });
    if (!sec) {
      sec = await prisma.section.create({
        data: {
          name: sectionName,
          capacity: 40,
        },
      });
    }
    sectionMap.set(parseInt(id, 10), sec.id);
    console.log(`✅ Section [${sec.id}]: ${sectionName}`);
  }

  // 4. Migrate Shifts
  console.log('\n--- 4. Migrating Shifts ---');
  const shiftRows = parseSqlValues(sqlContent, 'shifts');
  const shiftMap = new Map();

  for (const row of shiftRows) {
    const [id, shiftName] = row;
    if (!shiftName) continue;

    let shf = await prisma.shift.findFirst({ where: { name: shiftName } });
    if (!shf) {
      shf = await prisma.shift.create({
        data: {
          name: shiftName,
          startTime: shiftName.toLowerCase().includes('morning') ? '08:00 AM' : '12:30 PM',
          endTime: shiftName.toLowerCase().includes('morning') ? '12:00 PM' : '04:30 PM',
        },
      });
    }
    shiftMap.set(parseInt(id, 10), shf.id);
    console.log(`✅ Shift [${shf.id}]: ${shiftName}`);
  }

  // 5. Migrate Sessions
  console.log('\n--- 5. Migrating Sessions ---');
  const sessionRows = parseSqlValues(sqlContent, 'sessions');
  const sessionMap = new Map();

  for (const row of sessionRows) {
    const [id, sessionName] = row;
    if (!sessionName) continue;

    let ses = await prisma.session.findFirst({ where: { name: sessionName } });
    if (!ses) {
      ses = await prisma.session.create({
        data: {
          name: sessionName,
          isCurrent: true,
        },
      });
    }
    sessionMap.set(parseInt(id, 10), ses.id);
    console.log(`✅ Session [${ses.id}]: ${sessionName}`);
  }

  // Ensure current 2025 and 2026 sessions exist
  const ses2025 = await prisma.session.upsert({
    where: { name: '2025' },
    update: {},
    create: { name: '2025', isCurrent: true },
  });
  sessionMap.set(2025, ses2025.id);

  // 6. Migrate Students & Guardians
  console.log('\n--- 6. Migrating Students & Guardians ---');
  const studentRows = parseSqlValues(sqlContent, 'students');
  let studentCount = 0;
  const studentIdMap = new Map(); // oldStudentTableId -> newStudent.id

  for (const row of studentRows) {
    const [
      id,
      student_id,
      admission_no,
      admission_date,
      student_name,
      bangla_name,
      father_name,
      father_nid,
      father_mobile,
      mother_name,
      mother_nid,
      mother_mobile,
      guardian_name,
      guardian_mobile,
      dob,
      gender,
      blood_group,
      religion,
      email,
      student_bc,
      present_address,
      permanent_address,
      img_url,
      sms_status,
      status,
    ] = row;

    if (!student_name) continue;

    const studentCode = student_id ? String(student_id).trim() : `STU-${id}`;
    const cleanGender = (gender || 'Male').toLowerCase().includes('female') ? 'FEMALE' : 'MALE';
    const cleanDob = parseSafeDate(dob);
    const cleanAdmDate = parseSafeDate(admission_date, new Date());

    const student = await prisma.student.upsert({
      where: { studentCode },
      update: {
        nameEn: student_name,
        nameBn: bangla_name && bangla_name !== 'N/A' ? bangla_name : null,
        dob: cleanDob,
        gender: cleanGender,
        religion: religion || 'Islam',
        bloodGroup: blood_group && blood_group !== 'N/A' ? blood_group : null,
        photo: img_url && img_url !== 'N/A' ? img_url : null,
        biometricId: student_id ? String(student_id) : null,
        status: status === 'unactive' ? 'unactive' : 'active',
      },
      create: {
        studentCode,
        admissionNo: admission_no && admission_no !== 'N/A' ? admission_no : `ADM-${studentCode}`,
        admissionDate: cleanAdmDate,
        nameEn: student_name,
        nameBn: bangla_name && bangla_name !== 'N/A' ? bangla_name : null,
        dob: cleanDob,
        gender: cleanGender,
        religion: religion || 'Islam',
        bloodGroup: blood_group && blood_group !== 'N/A' ? blood_group : null,
        birthCertificateNo: student_bc && student_bc !== 'N/A' ? student_bc : null,
        photo: img_url && img_url !== 'N/A' ? img_url : null,
        biometricId: student_id ? String(student_id) : null,
        status: status === 'unactive' ? 'unactive' : 'active',
      },
    });

    studentIdMap.set(parseInt(id, 10), student.id);

    // Upsert Guardian
    await prisma.guardian.upsert({
      where: { studentId: student.id },
      update: {
        fatherName: father_name && father_name !== 'N/A' ? father_name : null,
        fatherPhone: father_mobile && father_mobile !== 'N/A' ? father_mobile : null,
        motherName: mother_name && mother_name !== 'N/A' ? mother_name : null,
        motherPhone: mother_mobile && mother_mobile !== 'N/A' ? mother_mobile : null,
        guardianName: guardian_name && guardian_name !== 'N/A' ? guardian_name : father_name,
        guardianPhone: guardian_mobile && guardian_mobile !== 'N/A' ? guardian_mobile : father_mobile,
        presentAddress: present_address && present_address !== 'N/A' ? present_address : null,
        permanentAddress: permanent_address && permanent_address !== 'N/A' ? permanent_address : null,
      },
      create: {
        studentId: student.id,
        fatherName: father_name && father_name !== 'N/A' ? father_name : null,
        fatherPhone: father_mobile && father_mobile !== 'N/A' ? father_mobile : null,
        motherName: mother_name && mother_name !== 'N/A' ? mother_name : null,
        motherPhone: mother_mobile && mother_mobile !== 'N/A' ? mother_mobile : null,
        guardianName: guardian_name && guardian_name !== 'N/A' ? guardian_name : father_name,
        guardianPhone: guardian_mobile && guardian_mobile !== 'N/A' ? guardian_mobile : father_mobile,
        presentAddress: present_address && present_address !== 'N/A' ? present_address : null,
        permanentAddress: permanent_address && permanent_address !== 'N/A' ? permanent_address : null,
      },
    });

    studentCount++;
  }
  console.log(`✅ Successfully migrated ${studentCount} Students and Guardians.`);

  // 7. Migrate Student Registrations / Enrollments
  console.log('\n--- 7. Migrating Student Registrations ---');
  const regRows = parseSqlValues(sqlContent, 'student_registrations');
  let regCount = 0;

  const defaultSession = (await prisma.session.findFirst())?.id || 1;
  const defaultClass = (await prisma.class.findFirst())?.id || 1;
  const defaultShift = (await prisma.shift.findFirst())?.id || 1;

  for (const row of regRows) {
    const [id, roll_no, reg_date, oldStudentId, shift_id, section_id, class_id, session_id] = row;

    const studentId = studentIdMap.get(parseInt(oldStudentId, 10));
    if (!studentId) continue;

    const resolvedClassId = classMap.get(parseInt(class_id, 10)) || defaultClass;
    const resolvedSectionId = sectionMap.get(parseInt(section_id, 10)) || null;
    const resolvedShiftId = shiftMap.get(parseInt(shift_id, 10)) || defaultShift;
    const resolvedSessionId = sessionMap.get(parseInt(session_id, 10)) || defaultSession;

    const cleanRoll = roll_no && roll_no !== 'N/A' ? String(roll_no).trim() : null;
    const cleanRegDate = parseSafeDate(reg_date, new Date());

    // Check existing enrollment
    const existing = await prisma.studentEnrollment.findFirst({
      where: {
        studentId,
        sessionId: resolvedSessionId,
        classId: resolvedClassId,
      },
    });

    if (!existing) {
      await prisma.studentEnrollment.create({
        data: {
          studentId,
          sessionId: resolvedSessionId,
          classId: resolvedClassId,
          sectionId: resolvedSectionId,
          shiftId: resolvedShiftId,
          roll: cleanRoll,
          enrollmentDate: cleanRegDate,
        },
      });
      regCount++;
    }
  }
  console.log(`✅ Successfully migrated ${regCount} Student Enrollment records.`);

  // 8. Configure Default Biometric Device
  console.log('\n--- 8. Configuring Biometric Device ---');
  const dev = await prisma.biometricDevice.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Main Gate K40 Device',
      ipAddress: '192.168.1.201',
      port: 4370,
      secretKey: 'ywca_zkteco_k40_bridge_sync_token_secret_9988',
      status: 'active',
    },
  });
  console.log(`✅ Biometric Device configured: ${dev.name} (${dev.ipAddress}:${dev.port})`);

  console.log('\n🎉 ALL LEGACY DATA MIGRATION COMPLETED SUCCESSFULLY!');
}

main()
  .catch((err) => {
    console.error('❌ Migration Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
