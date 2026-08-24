"use client";

import { useEffect } from "react";

export default function VoterSync() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      let userId = localStorage.getItem("user_id");
      if (!userId) {
        userId = "voter_" + Math.random().toString(36).substring(2, 11);
        localStorage.setItem("user_id", userId);
        console.log("Voter identity initialized:", userId);
      }
      
      // Also ensure role is set to citizen by default if nothing exists
      if (!localStorage.getItem("user_role")) {
        localStorage.setItem("user_role", "citizen");
      }
    }
  }, []);

  return null;
}
