type PropsType = "gradient" | "solid" | "image";

interface ICanvasPropsStyle {
    id: string;
    name: string;
    color?: string;
    gradient?: string;
    url?: string;
    type: PropsType;
}

export type { ICanvasPropsStyle, PropsType };
