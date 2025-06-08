interface INavLink {
  title: string;
  label: string;
  path: string;
}

const NAVLINK: INavLink[] = [
  {
    title: "Home",
    label: "Home",
    path: "/",
  },
  {
    title: "Features",
    label: "Features",
    path: "/#price",
  },
  {
    title: "Pricing",
    label: "Price",
    path: "/",
  },
];

export { NAVLINK };
