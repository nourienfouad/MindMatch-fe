import { auth } from "../(auth)/auth";
import { getChatByUserId, getMessagesByChatId } from "@/lib/db/queries";
import { notFound } from "next/navigation";
import { convertToUIMessages } from "@/lib/utils";
import { ChatContent } from "./chat-content";

export default async function Page() {
  const session = await auth();

  const chat = await getChatByUserId({ id: session?.user?.id });

  if (!chat) {
    return notFound();
  }

  if (chat.visibility === "private") {
    if (!session || !session.user) {
      return notFound();
    }

    if (session.user.id !== chat.userId) {
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({ id: chat.id });
  const uiMessages = convertToUIMessages(messagesFromDb);

  return (
    <ChatContent
      uiMessages={uiMessages}
      isReadonly={session?.user?.id !== chat.userId}
    />
  );
}
