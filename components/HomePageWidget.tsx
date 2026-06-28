"use client";

import PreLoginHomePage from "./PreLoginHomePage";
import { LobbyPage } from "./LobbyPage";
import { Session } from "next-auth";
import { useEffect } from "react";
import { useGamesStore } from "@/store/gamesStore";

const HomePageWidget = ({
	session,
}: {
	session: Session | null;
}) => {
	return session === null ? <PreLoginHomePage /> : <LobbyPage />
}
export default HomePageWidget