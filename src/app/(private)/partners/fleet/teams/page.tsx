/** @format */
;
import TeamClient from "@/components/list/TeamClient";
import { getTeamMembersAction } from "@/actions/private/team/actions";

export default async function TeamPage() {
    const result = await getTeamMembersAction();
    const initialTeam = result.success ? (result.data || []) : [];

    return <TeamClient initialTeam={initialTeam} />;
}
