import { createMachine, createActor, assign, fromPromise } from "xstate";

const feedbackMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QDMyQEYEMDGBrAxNgDYD2sYA2gAwC6ioADmQJYAuzJAdvSAJ6IBaABwB2AHQBWADQgAHogCMVAEwSxAZgCcVCSM1LlAFiVCAvqZmoMOXGIYAnEgFsGrfFYhY8YqCRIRqOiQQJlg2Dm5g+QQFEXUxTUTNIQA2KnUJFIV1BRl+BHUcsSohQvUqBU1MiXVDc0s0Txs7Rxc3Dy9bLADaHlDwrh5o2Pik5LSMrJy8xFVlMRFDJOUqJd0FFPV6kA7m5BJ7J3xOwL6WdkGo2cNDDQlNdRTlIQ3NJZSZhBX5oyTDIUS2WUj22u28+0OYkg4U4UHcjU6YgArgwIJhWJResF+hdIqBoso4gsUi8JDUdM9Kp9CeI9DlDCUyoYRKCEXsDk4oRAYXDYEj0E42KdsecIkNEIZMgkJKoXlpNMo0rpPk9ihsRBIdHpVkJUqzrOCOVyefg+QKhQogoxRZd8YgUoZ4pklAoJJKRFlVJ8GWpRBIFEJDJtFlQqA99U1DZCzYLWOxYfgIFwwGJmJwAG4kXApsG2CGcmNseNQBBpzPYdERQLC61hXHigrPMTMhTPdIUl6ab2aFJiZQPBQM0qFFsRxGsAAWmE4uFghFI5BrIRteLkiA981E70dQhWDw+fEERP+6l+hj3-sHY+axDIkHw9jgrEw9lYS5xYquCBSqq3VVWsQiFQP6fC8zZjJswL6ISWzbJw-hwDwuZnHWn52ggwiaGIuqdv6hKDtoXaHhhsS3GMmgiIG+jMj+17eA4ziuChAyrtEAjGNhuqVHhIgEWGnytmouhCFQvHZDoCpXhYOxslGTjMfWX4BsSpLkjKna5MRAiqM2pRGCIhKhsklEpHReZGtCxYKWha7fr2HqqeU6mVJp+Q0gsA5DkyLLSbmYj5mIhZxmmUDWbatk-iprpqZS+jeq2faeYyI4+Q0Bq2JO06zmFrGIGSvqLD2O57o81LKclbqns8GpVGZYi3uQEA5Q2IhARo2i6PoKjGKJnzaMUw7KIO1T9k85jmEAA */
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
                guard: ({ context }) => context.feedback.length > 0,
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
            src: fromPromise(async () => {
              await new Promise((res) => {
                setTimeout(() => res(200), 1000);
              });
            }),
            onDone: {
              target: "#thanks",
            },
          },
        },
      },
    },
    thanks: {
      id: "thanks",
      on: {
        close: {
          target: "closed",
          actions: [() => console.log("logging closed")],
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
