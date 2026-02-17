import fetch from "node-fetch";

// Format dates in Pacific Time
const pacificFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Los_Angeles",
  month: "short",
  day: "numeric"
});

function getWeekRange() {
  const now = new Date();

  const pacificNow = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  );

  const dayOfWeek = pacificNow.getDay(); // 0 = Sunday
  const sunday = new Date(pacificNow);
  sunday.setDate(pacificNow.getDate() - dayOfWeek);

  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);

  return `${pacificFormatter.format(sunday)} – ${pacificFormatter.format(saturday)}`;
}

async function sendPoll() {
  const token = process.env.DISCORD_TOKEN;
  const channelId = process.env.CHANNEL_ID;

  if (!token || !channelId) {
    throw new Error("Missing DISCORD_TOKEN or CHANNEL_ID");
  }

  const weekRange = getWeekRange();

  const response = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: `📅 **Hangout Poll (${weekRange})**`,
        poll: {
          question: { text: "Which day should we hang out?" },
          answers: [
            { text: "Monday" },
            { text: "Tuesday" },
            { text: "Wednesday" },
            { text: "Thursday" },
            { text: "Friday" },
            { text: "Saturday" },
            { text: "Sunday" }
          ],
          duration: 24,
          allowMultiselect: false
        }
      })
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to send poll: ${text}`);
  }

  console.log("Poll sent successfully ✅");
}

sendPoll().catch(err => {
  console.error(err);
  process.exit(1);
});
