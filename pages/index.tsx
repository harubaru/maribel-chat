import Head from "next/head";
import React from "react";
import { ChannelTop } from "../components/ChannelTop";
import { ChatBar } from "../components/ChatBar";
import { MessageList } from "../components/MessageList";

export default function Home() {
  const inputContainer = React.useRef<HTMLDivElement>(null);
  const mainConatiner = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const ubnsub = MessageList.use.subscribe(() => {
      setTimeout(() => {
        if (mainConatiner.current && inputContainer.current) {
          mainConatiner.current.style.marginBottom = `${
            inputContainer.current.offsetHeight + 24
          }px`;
        }

        window.scrollTo({
          behavior: "smooth",
          top: document.body.scrollHeight,
        });
      }, 100);
    });

    return () => {
      ubnsub();
    };
  }, [
    inputContainer.current?.offsetHeight,
    mainConatiner.current?.offsetHeight,
  ]);

  return (
    <>
      <Head>
        <title>Maribel Chat</title>
        <meta name="description" content="Don't be so carefree" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col gap-1 w-full" ref={mainConatiner}>
        <ChannelTop />
        <MessageList />
      </main>
      <div
        className="fixed bottom-0 w-screen bg-background"
        ref={inputContainer}
      >
        <ChatBar />
      </div>
    </>
  );
}
