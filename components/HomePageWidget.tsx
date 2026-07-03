"use client";

import { LobbyPage } from "./lobby/LobbyPage";
import PreLoginHomePage from "./PreLoginHomePage";
import { Session } from "next-auth";

const HomePageWidget = ({
	session,
}: {
	session: Session | null;
}) => {
	return session === null ? <PreLoginHomePage /> : <LobbyPage />
}
export default HomePageWidget