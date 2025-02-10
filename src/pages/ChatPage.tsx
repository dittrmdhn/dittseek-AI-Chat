import { useLayoutEffect, useRef, useState } from "react";
import { ChatMessage } from "~/components/ChatMessage";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import ollama from "ollama";
import { ThoughtMessage } from "~/components/ThoughtMessage";
import { db } from "~/lib/dexie";
import { useParams } from "react-router";
import { useLiveQuery } from "dexie-react-hooks";

const ChatPage = () => {
	const [messageInput, setMessageInput] = useState("");
	const [streamedMessage, setStreamedMessage] = useState("");
	const [streamedThought, setStreamedThought] = useState("");

	const scrollToBottomRef = useRef<HTMLDivElement>(null);

	const params = useParams();

	const messages = useLiveQuery(
		() => db.getMessagesForThread(params.threadId as string),
		[params.threadId]
	);

	const handleSubmit = async () => {
		// create message user
		await db.createMessage({
			content: messageInput,
			role: "user",
			thought: "",
			thread_id: params.threadId as string,
		});

		const stream = await ollama.chat({
			model: "deepseek-r1:1.5b",
			messages: [
				{
					role: "user",
					content: messageInput.trim(),
				},
			],
			stream: true,
		});

		setMessageInput("");

		let fullContent = "";
		let fullThought = "";

		let outputMode: "think" | "response" = "think";

		for await (const part of stream) {
			const messageContent = part.message.content;

			if (outputMode === "think") {
				if (
					!(
						messageContent.includes("<think>") ||
						messageContent.includes("</think>")
					)
				) {
					fullThought += messageContent;
				}

				setStreamedThought(fullThought);

				if (messageContent.includes("</think>")) {
					outputMode = "response";
				}
			} else {
				fullContent += messageContent;
				setStreamedMessage(fullContent);
			}
		}

		await db.createMessage({
			content: fullContent,
			role: "assistant",
			thought: fullThought,
			thread_id: params.threadId as string,
		});

		setStreamedMessage("");
		setStreamedThought("");
	};

	const handleToScrollToBottom = () => {
		scrollToBottomRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useLayoutEffect(() => {
		handleToScrollToBottom();
	}, [streamedMessage, streamedThought, messages]);

	const truncateText = (text: string, maxLength: number) => {
		return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
	};

	return (
		<div className="flex flex-col flex-1 dark:bg-gray-900">
			<header className="flex items-center py-12 mx-auto h-16 border-b">
				<h1 className="text-xl font-bold ml-4 ">
					{truncateText(messages?.[0]?.content || "", 30)}
				</h1>{" "}
			</header>
			<main className="flex-1 overflow-auto p-4 w-full">
				<div className="mx-auto space-y-4 pb-20 max-w-screen-md">
					{messages?.map((message, index) => (
						<ChatMessage
							key={index}
							role={message.role}
							content={message.content}
							thought={message.thought}
						/>
					))}

					{!!streamedThought && <ThoughtMessage thought={streamedThought} />}

					{!!streamedMessage && (
						<ChatMessage role="assistant" content={streamedMessage} />
					)}

					<div ref={scrollToBottomRef} />
				</div>
			</main>
			<footer className="border-t p-4">
				<div className="max-w-3xl mx-auto flex gap-2">
					<Textarea
						className="flex-1"
						placeholder="Type your message here..."
						rows={5}
						value={messageInput}
						onChange={(e) => setMessageInput(e.target.value)}
					/>
					<Button onClick={handleSubmit} type="button">
						Send
					</Button>
				</div>
			</footer>
		</div>
	);
};

export default ChatPage;
