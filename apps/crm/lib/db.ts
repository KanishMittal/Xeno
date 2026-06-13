import { Prisma, PrismaClient, type Customer } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export interface FilterRule {
  minSpend?: number;
  maxSpend?: number;
  minOrders?: number;
  inactiveDays?: number;
  activeDays?: number;
  cities?: string[];
  categories?: string[];
  ageGroups?: string[];
  gender?: string;
}

export function customerWhere(rule: FilterRule): Prisma.CustomerWhereInput {
  const now = Date.now();
  return {
    totalSpend: rule.minSpend !== undefined || rule.maxSpend !== undefined ? { gte: rule.minSpend, lte: rule.maxSpend } : undefined,
    orderCount: rule.minOrders !== undefined ? { gte: rule.minOrders } : undefined,
    lastOrderAt: rule.inactiveDays !== undefined || rule.activeDays !== undefined ? {
      lt: rule.inactiveDays !== undefined ? new Date(now - rule.inactiveDays * 86_400_000) : undefined,
      gte: rule.activeDays !== undefined ? new Date(now - rule.activeDays * 86_400_000) : undefined,
    } : undefined,
    city: rule.cities?.length ? { in: rule.cities } : undefined,
    ageGroup: rule.ageGroups?.length ? { in: rule.ageGroups } : undefined,
    gender: rule.gender && rule.gender !== "any" ? rule.gender : undefined,
    orders: rule.categories?.length ? { some: { category: { in: rule.categories } } } : undefined,
  };
}

export function filterCustomers(rule: FilterRule): Promise<Customer[]> {
  return prisma.customer.findMany({ where: customerWhere(rule), orderBy: { totalSpend: "desc" } });
}

export async function campaignAnalytics(id: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      segment: true,
      messages: { take: 20, orderBy: { updatedAt: "desc" }, include: { customer: true } },
    },
  });
  if (!campaign) return null;
  const [breakdown, cities] = await Promise.all([
    prisma.campaignMessage.groupBy({ by: ["status"], where: { campaignId: id }, _count: true }),
    prisma.campaignMessage.groupBy({ by: ["customerId"], where: { campaignId: id }, _count: true }),
  ]);
  const cityIds = cities.map((item) => item.customerId);
  const customers = await prisma.customer.findMany({ where: { id: { in: cityIds } }, select: { id: true, city: true } });
  const cityMap = new Map(customers.map((customer) => [customer.id, customer.city]));
  const counts = cities.reduce<Record<string, number>>((result, item) => {
    const city = cityMap.get(item.customerId) ?? "Unknown";
    result[city] = (result[city] ?? 0) + item._count;
    return result;
  }, {});
  return { ...campaign, breakdown, topCities: Object.entries(counts).map(([city, count]) => ({ city, count })).sort((a, b) => b.count - a.count).slice(0, 5) };
}
