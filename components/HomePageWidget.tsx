"use client";

import { useSession } from "next-auth/react";
import PreLoginHomePage from "./PreLoginHomePage";
import { LobbyPage } from "./LobbyPage";
import { Session } from "next-auth";

const HomePageWidget = ({
	session,
}: {
	session: Session | null;
}) => {
	return session === null ? <PreLoginHomePage /> : <LobbyPage />
}
export default HomePageWidget