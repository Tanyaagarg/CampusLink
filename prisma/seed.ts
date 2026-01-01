
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // 1. Create Users
    const users = [
        {
            name: 'Rohan Sharma',
            email: 'rohan@thapar.edu',
            hostel: 'J Hostel',
            branch: 'COE',
            year: '3rd Year',
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan',
        },
        {
            name: 'Priya Patel',
            email: 'priya@thapar.edu',
            hostel: 'M Hostel',
            branch: 'ENC',
            year: '2nd Year',
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
        },
        {
            name: 'Amit Singh',
            email: 'amit@thapar.edu',
            hostel: 'H Hostel',
            branch: 'ME',
            year: '4th Year',
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit',
        },
        {
            name: 'Sneha Gupta',
            email: 'sneha@thapar.edu',
            hostel: 'G Hostel',
            branch: 'CSBS',
            year: '3rd Year',
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha',
        },
        {
            name: 'Dev Student',
            email: 'dev@campuslink.com', // Matches logic in API routes for fallback
            hostel: 'A Hostel',
            branch: 'COE',
            year: '4th Year',
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dev',
        },
    ];

    const dbUsers = [];

    for (const u of users) {
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: u,
        });
        dbUsers.push(user);
        console.log(`Created user with id: ${user.id}`);
    }

    // 2. Create Marketplace Listings
    await prisma.marketplaceListing.createMany({
        data: [
            {
                title: 'Engineering Mathematics by HK Dass',
                description: 'Barely used, good condition. Helpful for 1st year.',
                price: 450,
                condition: 'Good',
                category: 'Books',
                sellerId: dbUsers[0].id,
                images: ['https://m.media-amazon.com/images/I/71YyPlXvpQL._AC_UF1000,1000_QL80_.jpg'],
            },
            {
                title: 'Table Lamp',
                description: 'Rechargeable LED table lamp with 3 brightness modes.',
                price: 300,
                condition: 'Like New',
                category: 'Electronics',
                sellerId: dbUsers[1].id,
            },
            {
                title: 'Drafter for ED',
                description: 'Standard Omega drafter. essential for engineering drawing.',
                price: 250,
                condition: 'Used',
                category: 'Supplies',
                sellerId: dbUsers[2].id,
            },
            {
                title: 'Scientific Calculator fx-991ES',
                description: 'Original Casio calculator.',
                price: 800,
                condition: 'Good',
                category: 'Electronics',
                sellerId: dbUsers[3].id,
            },
        ],
    });

    // 3. Create Rides
    const rideDates = [
        new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
        new Date(new Date().setDate(new Date().getDate() + 2)),
    ];

    await prisma.ride.createMany({
        data: [
            {
                from: 'Thapar Campus',
                to: 'Chandigarh Sector 17',
                date: rideDates[0],
                time: '14:00',
                vehicle: 'Swift Dzire',
                type: 'Car',
                seats: 3,
                price: 150,
                hostId: dbUsers[0].id,
            },
            {
                from: 'Patiala Bus Stand',
                to: 'Thapar Campus',
                date: rideDates[0],
                time: '10:00',
                vehicle: 'Activa 6G',
                type: 'Scooter',
                seats: 1,
                price: 50,
                hostId: dbUsers[1].id,
            },
            {
                from: 'Thapar Campus',
                to: 'Rajpura Railway Station',
                date: rideDates[1],
                time: '18:00',
                vehicle: 'Hyundai i20',
                type: 'Car',
                seats: 2,
                price: 100,
                hostId: dbUsers[2].id,
            },
        ],
    });

    // 4. Create Tutor Profiles
    // Only create if not exists
    const existingTutor = await prisma.tutorProfile.findUnique({ where: { userId: dbUsers[3].id } });
    if (!existingTutor) {
        await prisma.tutorProfile.create({
            data: {
                subjects: ['Data Structures', 'Algorithms', 'C++'],
                bio: 'Codeforces Expert. I can explain DP very well.',
                hourlyRate: 300,
                userId: dbUsers[3].id, // Sneha
            },
        });
    }

    const existingTutor2 = await prisma.tutorProfile.findUnique({ where: { userId: dbUsers[0].id } });
    if (!existingTutor2) {
        await prisma.tutorProfile.create({
            data: {
                subjects: ['Engineering Mathematics', 'Calculus'],
                bio: 'Scored A+ in Math 1 and 2.',
                hourlyRate: 200,
                userId: dbUsers[0].id, // Rohan
            },
        });
    }


    // 5. Create Ventures
    await prisma.venture.createMany({
        data: [
            {
                name: 'Late Night Munchies',
                description: 'Delivering Maggi, Sandwiches and Cold Coffee to your hostel gate.',
                category: 'Food & Beverages',
                status: 'Open',
                timing: '10 PM - 2 AM',
                ownerId: dbUsers[2].id,
            },
            {
                name: 'Print Quick',
                description: 'Cheap printing service. Send PDF on WhatsApp, collect from J Hostel.',
                category: 'Service',
                status: 'Open',
                timing: 'Anytime',
                ownerId: dbUsers[1].id,
            },
            {
                name: 'Thapar Merch Store',
                description: 'Customized hoodies and t-shirts for societies.',
                category: 'Product',
                status: 'Closed',
                timing: 'Orders on Weekends',
                ownerId: dbUsers[0].id,
            },
        ],
    });

    // 6. Create Team Posts
    await prisma.teamPost.createMany({
        data: [
            {
                title: 'Hackathon Teammate Needed',
                description: 'Looking for a frontend developer for Smart India Hackathon. We have 3 members already.',
                type: 'Hackathon',
                lookingFor: 'Frontend Developer',
                tags: ['React', 'Figma', 'Tailwind'],
                authorId: dbUsers[0].id,
            },
            {
                title: 'Research Paper Collab',
                description: 'Working on a paper about ML in Healthcare. Need someone good with Python/PyTorch.',
                type: 'Research',
                lookingFor: 'ML Engineer',
                tags: ['Python', 'Machine Learning', 'Research'],
                authorId: dbUsers[3].id,
            },
            {
                title: 'Startup Idea - Campus Delivery',
                description: 'Building a delivery app for campus. Need a co-founder who knows business/ops.',
                type: 'Startup',
                lookingFor: 'Co-founder',
                tags: ['Business', 'Operations', 'Marketing'],
                authorId: dbUsers[2].id,
            },
        ],
    });

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
