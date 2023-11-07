import { createMachine, createActor, assign, fromPromise } from "xstate";

const feedbackMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QDMyQEYEMDGBrAxNgDYD2sYA2gAwC6ioADmQJYAuzJAdvSAJ6IBaABwB2AHQBWADQgAHogCMVAEwSxAZgCcVCSM1LlAFiVCAvqZmoMOXGIYAnEgFsGrfFYhY8YqCRIRqOiQQJlg2Dm5g+QQFEXUxTUTNIQA2KnUJFIV1BRl+BHUcsSohQvUqBU1MiXVDc0s0Txs7Rxc3Dy9bLADaHlDwrh5o2Pik5LSMrJy8xFVlMRFDJOUqJd0FFPV6kA7m5BJ7J3wILjAxWFZMVjPd733DwL6WdkGoxSpVsWVY5RSJQ10WVUMwQAmyagk21utnuR06j2C-RekVA0SMhg0Ek06hSyiEG00SxSIJW8yMSUMQkS2WUOKhjU6YlhYkg4U4UHcDOaAFcGBArpReojnhEhohyuJDFoREJvis0poUsS+Ih8fNEoYZfiShJdGYLDsuXcDk4WRA2RzYNz0E42AjGCLXqjEEsqGJcYYVrKFAChKVpCqEFjxN9SpoZf9VOH6dZjYczRb8FabXaFEEHWFkWKECkRCH1L9PcoRMpCSoQYSFMURClSpUFL8FLEY0046bk7bWOx2cdTmJmJwAG4kXA3I0wk3na2d7tQBAD4fYK4RQL2kKOlFycW4sQ+0tUEQNqgKpUgpRFJaav0mXX6hqx2ysAAWmE4uFghFI5DXSNFbwQNbzKIRJSrKVDYsq+QCHEYiUgWl4rFUTZ1Aa0JiMQZCQPg9hwJc9isD+G7ZkqQGLFUqyxCIx6QaqVZLEkmy0voxZbNsnD+HAPDQk8mZ-s6oJUmIfr4khxY+tomgggIyi0sUHzyT8OiaL8LaMg4ziuDxAybtEAjGEJ16iYerqSYGDYQjKB5NuUWLfCh96thOhxaVm-4SPMUrht68rgSkpn5BI4ELAopRCMYWQAiIql7JOrKzi5fFbjEHywdK3nHr5-m0eqhJajeerRW2U4pl2A5QAlTpJUobqeTKcoZYqWUILlsG5deOoFah45MpOHZsNcEAVTp7w1Wl9Unk1TZ4gkbXakIup5oVj4vm+8DCrxlXRLqajAYqoGITiJIhcUpQZFKMmiFikJdQ+6FfpAQ3ZnmbpaDoegGMYB4Vm6JSFHZ1Slri5jmEAA */
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
        back: {
          target: "prompt",
        },
      },
      initial: "editing",
      states: {
        editing: {
          on: {
            "feedback.update": {
              actions: assign({
                feedback: ({ event }) => event.value,
              }),
            },
            submit: [
              {
                guard: "feedbackValid",
                target: "submitting",
              },
              {
                actions: assign({
                  error: "feedback too short",
                }),
              },
            ],
          },
        },
        submitting: {
          invoke: {
            src: "submitFeedback",
            onDone: {
              target: "submitted",
            },
          },
        },
        submitted: {
          type: "final",
        },
      },
      onDone: "thanks",
    },

    thanks: {
      id: "thanks",
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
      actions: ["logClosed"],
    },
  },
}).provide({
  guards: {
    feedbackValid: ({ context }) => context.feedback.length > 0,
  },
  actors: {
    submitFeedback: fromPromise(async () => {
      await new Promise((res) => {
        setTimeout(() => res(200), 1000);
      });
    }),
  },
  actions: {
    logClosed: () => console.log("Logging closed"),
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
  value: "This is some feedback",
});

feedbackActor.send({
  type: "submit",
});

feedbackActor.send({
  type: "close",
});
