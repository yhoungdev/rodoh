import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/src";
import { Separator } from "@repo/ui/src";

interface ICardProps {
  children?: React.ReactNode;
  title?: string;
}

function DefaultCard({ title, children }: ICardProps) {
  return (
    <Card className={"bg-background border-none text-white"}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default DefaultCard;
