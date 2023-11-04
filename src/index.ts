import { createMachine, createActor, assign } from "xstate";

const feedbackMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QDMyQEYEMDGBrAdAA4BOA9gLaEAuAxKhjgVKaRANoAMAuoqIabACWVQaQB2vEAA9EARgDsAZnwBONSoAcANg6KArFtmLZAGhABPRIuP4OG64o6yVBvYoAsAX09n6ELHhEZJS0fgEEWOzckvxCIuKSMggKyuqaOvqGxmaWCABMenn48u7qeRylevKyWorevmj+jPjIpMTkNOGcPEggscKiEr1Jee7u+Poqilp5GjUqpVo5iOVFo+ruGmpGedP1IGHNre00sACu6OTC3TECAwnDiGN6qhru+hxaKvJaOrrL+VkHAmDmMMwq1hK+0OgSoAAtMGJcLAaNgADYCMA3Xr9eJDUBJX5FDQlFwVBTyT5LCwrBT4PT2YwuAwaPKjLTQxrhfDozEQGjEOBUTDEKjYvh3PGJRBE-Akyrk+SU34Aub4UrqWq7FSyPJKbw+EBiVhwSQw3C3OKDaUIAC01Ny9tsHBdRjeeim+g9nIYgRIFGolvu+OkTzyAKmtg1LncXwq7kKPqagWO5CDUseCGsGle7y0sfBse+ALyQLlDnKugUpTZSe58MRyPT1szejbctJ+cUrI4UwdtJzdmsenebJJHr0deavNgkGbDwJiCVwMUKg4VR1HFGQPkEeBQ8UpYTWkKKhmBs8QA */
  id: "feedback",
  context: {
    feedback: "",
    error: null,
  },
  initial: "prompt",
  states: {
    prompt: {
      on: {
        "feedback.good": {
          target: "thanks",
        },
        "feedback.bad": {
          target: "form",
        },
      },
    },
    form: {
      on: {
        "feedback.update": {
          actions: assign({
            feedback: ({ event }) => event.value,
          }),
        },
        back: {
          target: "prompt",
        },
        submit: [
          {
            guard: ({ context }) => context.feedback.length > 0,
            target: "thanks",
          },
          {
            actions: assign({
              error: "feedback too short",
            }),
          },
        ],
      },
    },
    thanks: {
      on: {
        close: {
          target: "closed",
          actions: [
            () => console.log("logging closed"),
            () => console.log("logging some feedback"),
            ({ context, event }) => console.log("the event was: ", event.type),
          ],
        },
      },
    },
    closed: {
      on: {
        restart: {
          target: "prompt",
        },
      },
    },
  },
  on: {
    close: {
      target: ".closed",
    },
  },
});

const feedbackActor = createActor(feedbackMachine);

feedbackActor.subscribe((snapshot) => {
  console.log("\nvalue: ", snapshot.value);
  console.log(snapshot.context);
});

feedbackActor.start();

feedbackActor.send({
  type: "feedback.bad",
});
feedbackActor.send({
  type: "feedback.update",
  value: "3",
});

feedbackActor.send({
  type: "submit",
});

feedbackActor.send({
  type: "close",
});

feedbackActor.send({
  type: "restart",
});
