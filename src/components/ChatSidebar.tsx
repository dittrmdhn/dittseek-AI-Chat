import { Moon, Plus, Sun, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useLayoutEffect, useState, FC } from "react";
import { Button } from "~/components/ui/button";
import {
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	Sidebar as SidebarPrimitive,
} from "~/components/ui/sidebar";
import { useTheme } from "./ThemeProvider";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { db } from "~/lib/dexie";
import { useLiveQuery } from "dexie-react-hooks";
import { Link, useLocation } from "react-router";

interface ChatSidebarProps {
	compact?: boolean;
	onToggle?: () => void;
}

export const ChatSidebar: FC<ChatSidebarProps> = ({
	compact = false,
	onToggle,
}) => {
	const [activeThread, setActiveThread] = useState("");
	const [dialogIsOpen, setDialogIsOpen] = useState(false);
	const [textInput, setTextInput] = useState("");
	const { setTheme, theme } = useTheme();
	const location = useLocation();
	const threads = useLiveQuery(() => db.getAllThreads(), []);

	const handleToggleTheme = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	const handleCreateThread = async () => {
		await db.createThread(textInput);
		setDialogIsOpen(false);
		setTextInput("");
	};

	useLayoutEffect(() => {
		const activeThreadId = location.pathname.split("/")[2];
		setActiveThread(activeThreadId);
	}, [location.pathname]);

	return (
		<>
			<Dialog open={dialogIsOpen} onOpenChange={setDialogIsOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create new thread</DialogTitle>
					</DialogHeader>

					<div className="space-y-1">
						<Label htmlFor="thread-tittle">Thread title</Label>
						<Input
							id="thread-tittle"
							value={textInput}
							onChange={(e) => setTextInput(e.target.value)}
							placeholder="Your thread title"
						/>
					</div>
					<DialogFooter>
						<Button variant="secondary" onClick={() => setDialogIsOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleCreateThread}>Create Thread</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Sidebar Wrapper */}
			<div className="relative">
				{/* Toggle Sidebar Button */}
				<Button
					onClick={onToggle}
					className="absolute -right-4 top-4 z-50 bg-gray-800 text-white hover:bg-gray-700 p-2 rounded-full shadow-md"
				>
					{compact ? <ChevronsRight /> : <ChevronsLeft />}
				</Button>

				<SidebarPrimitive>
					<SidebarHeader>
						<div className="flex justify-between items-center p-4">
							<p
								className={`baumans-regular tracking-widest text-white ${
									compact ? "hidden" : ""
								}`}
							>
								dittseek
							</p>
						</div>

						<Button
							onClick={() => setDialogIsOpen(true)}
							className={`w-2/3 justify-start bg-blue-600 text-white ${
								compact ? "hidden" : ""
							}`}
							variant="ghost"
						>
							<Plus className="mr-2 h-4 w-4" />
							New Chat
						</Button>
					</SidebarHeader>
					<SidebarContent>
						<SidebarGroup>
							<SidebarGroupContent>
								<SidebarGroupLabel
									className={compact ? "hidden" : "text-gray-500"}
								>
									Recent Chats
								</SidebarGroupLabel>
								<SidebarMenu>
									{threads?.map((thread) => (
										<SidebarMenuItem key={thread.id}>
											<Link to={`/thread/${thread.id}`}>
												<SidebarMenuButton
													isActive={thread.id === activeThread}
													className={`${
														thread.id === activeThread
															? " text-black dark:bg-white dark:text-black"
															: "text-white hover:text-gray-400"
													}`}
												>
													{compact ? "💬" : thread.title}
												</SidebarMenuButton>
											</Link>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					</SidebarContent>
					<SidebarFooter>
						<Button
							onClick={handleToggleTheme}
							variant="ghost"
							className="w-full justify-start text-white hover:bg-gray-700 hover:text-white"
						>
							<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-white" />
							<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-white" />
							{!compact && "Toggle Theme"}
						</Button>
					</SidebarFooter>
				</SidebarPrimitive>
			</div>
		</>
	);
};
