import { publicProcedure, router } from "../../trpc";

export const mangaRouter = router({
  list: publicProcedure.query(() => {
    return [
      {
        id: 0,
        title: "Hello World",
      },
      {
        id: 1,
        title: "Testing",
      },
      {
        id: 2,
        title: "Wooh",
      },
      {
        id: 3,
        title: "Lel",
      },
    ];
  }),
});
