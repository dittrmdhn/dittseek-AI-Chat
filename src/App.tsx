import { useState } from "react";
import { Route, Routes } from "react-router";
import { ChatSidebar } from "~/components/ChatSidebar";
import { SidebarProvider } from "~/components/ui/sidebar";
import ChatPage from "./pages/ChatPage";

export default function App() {
	const [sidebarOpen, setSidebarOpen] = useState(true);

	return (
		<SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
			<div className="flex h-screen bg-background w-full">
				<div
					className={`relative ${
						sidebarOpen ? "w-64" : "w-16"
					} bg-gray-800 transition-all duration-300`}
				>
					<ChatSidebar
						compact={!sidebarOpen}
						onToggle={() => setSidebarOpen(!sidebarOpen)}
					/>
				</div>
				<Routes>
					<Route path="/thread/:threadId" element={<ChatPage />} />
				</Routes>
			</div>
		</SidebarProvider>
	);
}
