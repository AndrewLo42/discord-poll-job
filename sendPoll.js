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
  saturday.setDate(sunday.getDate() + 7); //changed from 6 to 7 to account for full week

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
        content: `🗓️ **Gaming Poll (${weekRange})**`,
        poll: {
          question: {
            text: "✨ When are we gathering ✨?"
          },
          answers: [
            { poll_media: { text: "Monday" } },
            { poll_media: { text: "Tuesday" } },
            { poll_media: { text: "Wednesday" } },
            { poll_media: { text: "Thursday" } },
            { poll_media: { text: "Friday" } },
            { poll_media: { text: "Saturday" } },
            { poll_media: { text: "Sunday" } }
          ],
          duration: 48,
          allow_multiselect: false
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
