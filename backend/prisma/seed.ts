import { PrismaClient, UserRole, ReportSeverity } from '@prisma/client';
import { hashPassword } from '../src/services/authService';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hashPassword('ChangeMe123!');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@safety.local' },
    update: {},
    create: {
      email: 'admin@safety.local',
      username: 'admin',
      name: 'Platform Admin',
      passwordHash,
      role: UserRole.ADMIN,
      country: 'Kenya',
      ageRange: '25-34'
    }
  });

  const moderator = await prisma.user.upsert({
    where: { email: 'mod@safety.local' },
    update: {},
    create: {
      email: 'mod@safety.local',
      username: 'moderator',
      name: 'Community Moderator',
      passwordHash,
      role: UserRole.MODERATOR,
      country: 'Nigeria',
      ageRange: '18-24'
    }
  });

  const learner = await prisma.user.upsert({
    where: { email: 'learner@safety.local' },
    update: {},
    create: {
      email: 'learner@safety.local',
      username: 'learner',
      name: 'Young Learner',
      passwordHash,
      role: UserRole.USER,
      country: 'Ghana',
      ageRange: '18-24'
    }
  });

  const safetyCategory = await prisma.forumCategory.upsert({
    where: { id: 'safety-general' },
    update: {},
    create: {
      id: 'safety-general',
      name: 'Safe Digital Spaces',
      description: 'Share experiences and tips on staying safe online.',
      sortOrder: 1
    }
  });

  const literacyCategory = await prisma.resourceCategory.upsert({
    where: { id: 'digital-literacy' },
    update: {},
    create: {
      id: 'digital-literacy',
      name: 'Digital Literacy',
      description: 'Learn the basics of using digital tools safely.'
    }
  });

  await prisma.resource.upsert({
    where: { id: 'welcome-resource' },
    update: {},
    create: {
      id: 'welcome-resource',
      title: 'Welcome to Your Safe Digital Space',
      content:
        'This platform is built by and for African women and girls. Learn how to protect your privacy, report abuse, and support others online.',
      categoryId: literacyCategory.id,
      level: 'Beginner',
      tags: ['privacy', 'online safety', 'community'],
      authorId: admin.id,
      isFeatured: true,
      publishedAt: new Date()
    }
  });

  await prisma.forumThread.create({
    data: {
      title: 'How do you stay safe on social media?',
      body: 'Share your tips and tools that help you feel safe and empowered online.',
      authorId: learner.id,
      categoryId: safetyCategory.id,
      posts: {
        create: [
          {
            body: 'I always keep my accounts private and only accept people I know in real life.',
            authorId: learner.id
          },
          {
            body: 'As a moderator, I recommend blocking and reporting abusive accounts immediately.',
            authorId: moderator.id
          }
        ]
      }
    }
  });

  await prisma.report.create({
    data: {
      reporterId: learner.id,
      targetType: 'FORUM_POST',
      targetId: 'sample-post-id',
      description: 'Example report to show how moderation works.',
      severity: ReportSeverity.LOW
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
