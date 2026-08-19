export type Branding = {
  organizationName: string;
  productName: string;
  fullName: string;
  storageNamespace: string;
  assets: {
    loginBackground: string;
    logo?: string;
  };
  colors: {
    brand: {
      primary: string;
      primaryHover: string;
      onPrimary: string;
      palette: [string, string, string, string, string, string, string, string, string, string];
    };
    surface: {
      page: string;
      header: string;
      sidebar: string;
      panel: string;
      interactive: string;
      interactiveHover: string;
    };
    border: {
      default: string;
      strong: string;
    };
    text: {
      primary: string;
      muted: string;
      subtle: string;
    };
    feedback: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
  };
};

export const branding: Branding = {
  organizationName: "UTFPR",
  productName: "Virtual",
  fullName: "UTFPR Virtual",
  storageNamespace: "campus-virtual",
  assets: {
    loginBackground: "/branding/login-background.jpeg",
    logo: undefined,
  },
  colors: {
    brand: {
      primary: "#fdc003",
      primaryHover: "#ffd16c",
      onPrimary: "#5c4700",
      palette: [
        "#fff9db",
        "#fff3bf",
        "#ffec99",
        "#ffe066",
        "#ffd16c",
        "#fdc003",
        "#e5ad00",
        "#cc9a00",
        "#b38600",
        "#997300",
      ],
    },
    surface: {
      page: "#515151",
      header: "#373737",
      sidebar: "#383838",
      panel: "#252525",
      interactive: "#2e2e2e",
      interactiveHover: "#292929",
    },
    border: {
      default: "#626262",
      strong: "#b8bdc4",
    },
    text: {
      primary: "#f3f3f3",
      muted: "#a6a7ab",
      subtle: "#969da5",
    },
    feedback: {
      success: "#40c057",
      warning: "#ffd43b",
      error: "#ff8787",
      info: "#3c9dff",
    },
  },
};

export const getStorageKey = (key: string, brand: Branding = branding) =>
  `${brand.storageNamespace}:${key}`;
