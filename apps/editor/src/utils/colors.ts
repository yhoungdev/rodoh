import { ICanvasPropsStyle } from "@/types";

const backgroundColors: ICanvasPropsStyle[] = [
  {
    id: "grad-1",
    name: "Rose to Orange",
    color: "#f43f5e",
    gradient: "from-rose-500 to-orange-500 bg-gradient-to-br",
    type: "gradient",
  },
  {
    id: "grad-2",
    name: "Blue to Cyan",
    color: "#3b82f6",
    gradient: "from-blue-500 to-cyan-500 bg-gradient-to-br",
    type: "gradient",
  },
  {
    id: "grad-3",
    name: "Violet to Purple",
    color: "#8b5cf6",
    gradient: "from-violet-500 to-purple-500 bg-gradient-to-br",
    type: "gradient",
  },
  {
    id: "grad-4",
    name: "Emerald to Teal",
    color: "#10b981",
    gradient: "from-emerald-500 to-teal-500 bg-gradient-to-br",
    type: "gradient",
  },
  {
    id: "grad-5",
    name: "Pink to Rose",
    color: "#ec4899",
    gradient: "from-pink-500 to-rose-500 bg-gradient-to-br",
    type: "gradient",
  },
  {
    id: "grad-6",
    name: "Amber to Yellow",
    color: "#f59e0b",
    gradient: "from-amber-500 to-yellow-500 bg-gradient-to-br",
    type: "gradient",
  },
  {
    id: "grad-7",
    name: "Amber to Pink",
    color: "",
    gradient: " from-amber-500 to-pink-500",
    type: "gradient",
  },
  {
    id: "grad-8",
    name: "Amber to Pink",
    color: "",
    gradient: "from-fuchsia-500 to-cyan-500",
  },
  {
    id: "grad-9",
    name: "Amber to Pink",
    color: "",
    gradient: "from-rose-300 to-indigo-600",
  },
  {
    id: "grad-10",
    name: "Amber to Pink",
    color: "",
    gradient: " from-rose-400 to-rose-900",
  },
];

const solidColors: ICanvasPropsStyle[] = [
  { id: "solid-1", name: "Slate", color: "bg-slate-900", type: "solid" },
  { id: "solid-2", name: "White", color: "bg-white", type: "solid" },
  { id: "solid-3", name: "Zinc", color: "bg-zinc-800", type: "solid" },
  { id: "solid-4", name: "Blue", color: "bg-blue-600", type: "solid" },
  { id: "solid-5", name: "Green", color: "bg-green-600", type: "solid" },
  { id: "solid-6", name: "Red", color: "bg-red-600", type: "solid" },
];

const backgroundUrls: ICanvasPropsStyle[] = [
  {
    id: "bg-1",
    name: "Background 1",
    url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1950&q=80",
    type: "image",
  },
];
export { backgroundColors, solidColors, backgroundUrls };
