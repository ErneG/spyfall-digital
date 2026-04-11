export const prisma = new Proxy(
  {},
  {
    get() {
      throw new Error("Storybook should not access Prisma directly.");
    },
  },
);
