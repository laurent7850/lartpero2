import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!@#', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lartpero.eu' },
    update: {},
    create: {
      email: 'admin@lartpero.eu',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'L\'ArtPéro',
      role: 'ADMIN',
      emailVerifiedAt: new Date(),
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create products
  const products = [
    // Subscriptions
    {
      name: 'Standard',
      slug: 'standard',
      description: '2 events/mois, 1 verre offert à chaque event, accès aux animations',
      category: 'SUBSCRIPTION' as const,
      priceCents: 8500,
      durationMonths: 1,
      eventsIncluded: 2,
      metadata: ({ features: ['1 verre offert/event', 'accès animations'], pricePerMonth: 85 }),
    },
    {
      name: 'Premium',
      slug: 'premium',
      description: '6 events sur 3 mois, 1 verre offert, 1 guest/trimestre, priorité d\'inscription',
      category: 'SUBSCRIPTION' as const,
      priceCents: 24000,
      durationMonths: 3,
      eventsIncluded: 6,
      metadata: ({ features: ['1 verre offert/event', '1 guest gratuit/trimestre', 'priorité d\'inscription', 'accès animations'], pricePerMonth: 80 }),
    },
    {
      name: 'Elite',
      slug: 'elite',
      description: '12 events sur 6 mois, 1 verre offert, 2 guests/trimestre, priorité d\'inscription, events exclusifs',
      category: 'SUBSCRIPTION' as const,
      priceCents: 45000,
      durationMonths: 6,
      eventsIncluded: 12,
      metadata: ({ features: ['1 verre offert/event', '2 guests gratuits/trimestre', 'priorité d\'inscription', 'accès animations', 'events exclusifs Elite et Prestige'], pricePerMonth: 75 }),
    },
    {
      name: 'Prestige',
      slug: 'prestige',
      description: '24 events sur 12 mois, 1 verre offert, 1 guest/mois, priorité d\'inscription, events exclusifs',
      category: 'SUBSCRIPTION' as const,
      priceCents: 84000,
      durationMonths: 12,
      eventsIncluded: 24,
      metadata: ({ features: ['1 verre offert/event', '1 guest gratuit/mois', 'priorité d\'inscription', 'accès animations', 'events exclusifs Elite et Prestige'], pricePerMonth: 70 }),
    },
    // Entries
    {
      name: 'Entrée Découverte',
      slug: 'entree-decouverte',
      description: '1 soirée, 1 verre offert, accès animation',
      category: 'ENTRY' as const,
      priceCents: 4900,
      eventsIncluded: 1,
      metadata: ({ features: ['1 soirée', '1 verre offert', 'accès animation'] }),
    },
    // Gift Cards
    {
      name: 'Art\'Péro Gift',
      slug: 'artpero-gift',
      description: '1 soirée, 1 verre offert, accès animation, valable 3 mois',
      category: 'GIFT_CARD' as const,
      priceCents: 4900,
      eventsIncluded: 1,
      metadata: ({ validity_months: 3, features: ['1 soirée', '1 verre offert', 'accès animation'] }),
    },
    {
      name: 'Art\'Péro Expérience',
      slug: 'artpero-experience',
      description: '3 soirées, 1 verre offert par soirée, accès animation, valable 3 mois',
      category: 'GIFT_CARD' as const,
      priceCents: 13000,
      eventsIncluded: 3,
      metadata: ({ validity_months: 3, features: ['3 soirées', '1 verre offert/soirée', 'accès animation'] }),
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }
  console.log('✅ Products created:', products.length);

  // Create testimonials
  const testimonials = [
    {
      authorName: 'Marie D.',
      content: 'Une expérience unique qui allie découverte artistique et networking de qualité. Je recommande vivement !',
      isFeatured: true,
      status: 'PUBLISHED' as const,
    },
    {
      authorName: 'Jean-Pierre M.',
      content: 'Les événements L\'ArtPéro sont toujours soigneusement organisés. Un vrai plaisir à chaque fois.',
      isFeatured: true,
      status: 'PUBLISHED' as const,
    },
    {
      authorName: 'Sophie L.',
      content: 'J\'ai découvert des artistes incroyables grâce à L\'ArtPéro. La communauté est vraiment bienveillante.',
      isFeatured: false,
      status: 'PUBLISHED' as const,
    },
  ];

  for (const testimonial of testimonials) {
    await prisma.testimonial.create({
      data: testimonial,
    });
  }
  console.log('✅ Testimonials created:', testimonials.length);

  // Create team member
  await prisma.teamMember.upsert({
    where: { id: 'default-team' },
    update: {},
    create: {
      id: 'default-team',
      name: 'Équipe L\'ArtPéro',
      role: 'Fondateurs',
      bioMd: 'Passionnés d\'art et de rencontres, nous avons créé L\'ArtPéro pour offrir des expériences uniques mêlant culture et convivialité.',
      visible: true,
      orderIndex: 1,
    },
  });
  console.log('✅ Team member created');

  console.log('✨ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
