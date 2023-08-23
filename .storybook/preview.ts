import type { Preview } from "@storybook/react";

import "../src/index.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      values: [],
    },
    themes: {
      clearable: false,
      list: [
        {
          name: "Light",
          class: [],
          color: "#ffffff",
          default: true,
        },
        {
          name: "Dark",
          // The class dark will be added to the body tag
          class: ["dark", "bg-gray-700"],
          color: "#000000",
        },
      ],
    },
  },
};

export default preview;
