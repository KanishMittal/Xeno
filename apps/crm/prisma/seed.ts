import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();
const cities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata", "Jaipur"];
const categories = ["tops", "bottoms", "footwear", "accessories", "dresses"];
const firstNames = ["Aarav", "Aditi", "Akshay", "Ananya", "Arjun", "Diya", "Ishaan", "Kavya", "Meera", "Neha", "Nikhil", "Priya", "Rahul", "Riya", "Rohan", "Saanvi", "Sneha", "Tanvi", "Varun", "Vihaan"];
const lastNames = ["Agarwal", "Bose", "Chopra", "Desai", "Gupta", "Iyer", "Jain", "Kapoor", "Mehta", "Nair", "Patel", "Rao", "Shah", "Sharma", "Singh", "Verma"];

async function main() {
  await prisma.campaignMessage.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.segment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();

  const customers = Array.from({ length: 500 }, (_, index) => {
    const first = faker.helpers.arrayElement(firstNames);
    const last = faker.helpers.arrayElement(lastNames);
    return {
      id: randomUUID(),
      name: `${first} ${last}`,
      phone: `+91${String(7000000000 + index).padStart(10, "0")}`,
      email: `${first}.${last}.${index}@example.com`.toLowerCase(),
      city: faker.helpers.arrayElement(cities),
      gender: faker.helpers.arrayElement(["male", "female"]),
      ageGroup: faker.helpers.arrayElement(["18-24", "25-34", "35-44", "45+"]),
    };
  });
  await prisma.customer.createMany({ data: customers });

  const orders = customers.flatMap((customer) =>
    Array.from({ length: faker.number.int({ min: 1, max: 8 }) }, () => ({
      id: randomUUID(),
      customerId: customer.id,
      amount: faker.number.int({ min: 499, max: 8999 }),
      category: faker.helpers.arrayElement(categories),
      createdAt: faker.date.recent({ days: 548 }),
    })),
  );
  for (let i = 0; i < orders.length; i += 500) await prisma.order.createMany({ data: orders.slice(i, i + 500) });

  for (const customer of customers) {
    const customerOrders = orders.filter((order) => order.customerId === customer.id);
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        totalSpend: customerOrders.reduce((sum, order) => sum + order.amount, 0),
        orderCount: customerOrders.length,
        lastOrderAt: new Date(Math.max(...customerOrders.map((order) => order.createdAt.getTime()))),
      },
    });
  }
  console.log(`Seeded ${customers.length} customers and ${orders.length} orders.`);
}

main().finally(() => prisma.$disconnect());
