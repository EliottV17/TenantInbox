import { MessageDetail } from "@/components/message-detail";

export default async function MessagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MessageDetail id={id} />;
}
