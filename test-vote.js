async function testVote() {
    try {
        const res = await fetch('http://localhost:3000/api/issues');
        if (!res.ok) throw new Error("Issues fetch failed");
        const issues = await res.json();
        if (issues.length === 0) {
            console.log("No issues found");
            return;
        }
        const id = issues[0].id;
        console.log(`Testing on issue: ${id}`);
        console.log(`Initial votes Count:`, issues[0].votes?.length || 0);

        const userId = 'test_user_' + Math.floor(Math.random() * 100000);
        console.log(`Voting as: ${userId}`);
        
        const voteRes = await fetch('http://localhost:3000/api/issues/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ issueId: id, userId, value: 1 })
        });
        
        console.log(`Vote status: ${voteRes.status}`);
        const voteData = await voteRes.json();
        console.log(`Vote data:`, voteData);

        const refreshRes = await fetch(`http://localhost:3000/api/issues/${id}`);
        const refreshed = await refreshRes.json();
        console.log(`Refreshed votes count:`, refreshed.votes?.length || 0);
        const total = refreshed.votes.reduce((acc, v) => acc + v.value, 0);
        console.log(`Total sum: ${total}`);
    } catch (e) {
        console.error("Test failed:", e.message);
    }
}

testVote();
