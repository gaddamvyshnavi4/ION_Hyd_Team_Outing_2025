const express = require("express");
const path = require('path');      
const app = express();
let data = 1;
let players = [];
let status = 'Not Shuffled';
let shuffledTeams = [];
let buzzerStartTime = null;
let buzzerResults = [];

// ✅ MUST come before any routes
app.use(express.json());                         // parses application/json
app.use(express.urlencoded({ extended: true })); // parses form posts (optional in dev)


// ✅ New API: add player
app.post("/api/addPlayer", (req, res) => {
  const { name, gender } = req.body;

  if (!name || !gender) {
    return res
      .status(400)
      .json({ error: "Name and gender are required" });
  }

  const exists = players.find(
    (p) => p.name === name && p.gender === gender
  );

  if (exists) {
    return res.json({ status: "existed", player: exists });
  }

  const newPlayer = { name, gender };
  players.push(newPlayer);

  res.json({ status: "created", player: newPlayer });
});


// ✅ New API: get players
app.get("/api/players", (req, res) => {
  res.json({ players });
});

// ✅ New API: delete player
app.delete("/api/deletePlayer", (req, res) => {
  const { name, gender } = req.body;

  if (!name || !gender) {
    return res
      .status(400)
      .json({ error: "Name and gender are required" });
  }

  const playerIndex = players.findIndex(
    (p) => p.name === name && p.gender === gender
  );

  if (playerIndex === -1) {
    return res
      .status(404)
      .json({ error: "Player not found" });
  }

  const deletedPlayer = players.splice(playerIndex, 1)[0];
  res.json({ status: "deleted", player: deletedPlayer });
});




// refresh API
app.get("/api/refresh", (req, res) => {
    res.json({ players, status, shuffledTeams }); // content-type: application/json
});

app.post("/api/shuffle", async (req, res) => {
    const { numberOfTeams, teamNames } = req.body;
    
    if (!numberOfTeams || !teamNames) {
        return res.status(400).json({ error: "Number of teams and team names are required" });
    }
    
    status = 'Shuffle Started';
    
    // Improved balanced shuffling logic
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    function computeTeamSizes(total, numTeams) {
        const base = Math.floor(total / numTeams);
        let rem = total % numTeams;
        const sizes = Array(numTeams).fill(base);
        const idx = [...Array(numTeams).keys()];
        shuffle(idx);
        for (let i = 0; i < rem; i++) sizes[idx[i]]++;
        return sizes;
    }
    
    function allocateByQuota(teamSizes, genderCount, totalPeople) {
        const quotas = teamSizes.map(s => (s * genderCount) / totalPeople);
        const assigned = quotas.map(q => Math.floor(q));
        const assignedSum = assigned.reduce((a, b) => a + b, 0);
        let leftover = genderCount - assignedSum;
        
        const remainders = quotas
            .map((q, i) => ({ i, rem: q - Math.floor(q) }))
            .sort(() => Math.random() - 0.5)
            .sort((a, b) => b.rem - a.rem);
        
        for (let k = 0; k < leftover; k++) {
            assigned[remainders[k].i] += 1;
        }
        
        let overflow = 0;
        for (let i = 0; i < assigned.length; i++) {
            if (assigned[i] > teamSizes[i]) {
                overflow += assigned[i] - teamSizes[i];
                assigned[i] = teamSizes[i];
            }
        }
        
        if (overflow > 0) {
            for (let i = 0; i < assigned.length && overflow > 0; i++) {
                const spare = teamSizes[i] - assigned[i];
                if (spare > 0) {
                    const give = Math.min(spare, overflow);
                    assigned[i] += give;
                    overflow -= give;
                }
            }
        }
        
        return assigned;
    }
    
    const males = players.filter(p => p.gender === 'M').slice();
    const females = players.filter(p => p.gender === 'F').slice();
    
    shuffle(males);
    shuffle(females);
    
    const total = players.length;
    const teamSizes = computeTeamSizes(total, numberOfTeams);
    
    const maleAssigned = allocateByQuota(teamSizes, males.length, total);
    const femaleAssigned = teamSizes.map((s, i) => s - maleAssigned[i]);
    
    shuffledTeams = teamNames.map((name, i) => ({ name, members: [] }));
    
    let mIdx = 0, fIdx = 0;
    for (let i = 0; i < numberOfTeams; i++) {
        for (let k = 0; k < maleAssigned[i]; k++) {
            if (mIdx < males.length) {
                shuffledTeams[i].members.push(males[mIdx++]);
            }
        }
        for (let k = 0; k < femaleAssigned[i]; k++) {
            if (fIdx < females.length) {
                shuffledTeams[i].members.push(females[fIdx++]);
            }
        }
    }
    
    await sleep(33000); // sleep 33 seconds (11 images × 3 seconds)
    status = 'Shuffle Completed';
    res.json({ players, status, shuffledTeams });
});

app.get("/api/restShuffle", async (req, res) => {
    status = 'Not Shuffled';
    shuffledTeams = [];
    res.json({ players, status, shuffledTeams }); // content-type: application/json
});


app.get("/api/lock", async (req, res) => {
    status = 'Shuffle Started';
    res.json({ players, status, shuffledTeams }); // content-type: application/json
});

// Buzzer APIs
app.post("/api/buzzer/reset", (req, res) => {
    buzzerStartTime = Date.now();
    buzzerResults = [];
    res.json({ status: 'Buzzer Reset', startTime: buzzerStartTime });
});

app.post("/api/buzzer/press", (req, res) => {
    const { teamName } = req.body;
    
    if (!teamName) {
        return res.status(400).json({ error: "Team name is required" });
    }
    
    if (!buzzerStartTime) {
        return res.status(400).json({ error: "Buzzer not started. Admin must reset first." });
    }
    
    const currentTime = Date.now();
    const elapsedTime = currentTime - buzzerStartTime;
    
    // Check if team already pressed
    const existingResult = buzzerResults.find(r => r.teamName === teamName);
    if (existingResult) {
        return res.json({ status: 'already_pressed', result: existingResult });
    }
    
    const result = {
        teamName,
        time: elapsedTime,
        timestamp: currentTime
    };
    
    buzzerResults.push(result);
    
    res.json({ status: 'recorded', result });
});

app.get("/api/buzzer/results", (req, res) => {
    const sortedResults = buzzerResults
        .slice()
        .sort((a, b) => a.time - b.time);
    
    res.json({ 
        results: sortedResults, 
        startTime: buzzerStartTime,
        isActive: buzzerStartTime !== null
    });
});





// Simple API
app.get("/hello", (req, res) => {
	data = data + 1;
    res.json({ message: 'Hello World' }); // content-type: application/json
});

app.get("/getData", (req, res) => {
    res.json({ data }); // content-type: application/json
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --- serve Angular build ---
// --- your APIs ---
app.get('/api/hello', (req, res) => res.json({ message: 'Api Hello World' }));

// --- serve Angular build (from angular.json -> outputPath: dist/ion-outing) ---
const staticDir = path.join(__dirname, '..', 'ion-outing', 'dist', 'ion-outing', 'browser');
app.use(express.static(staticDir));

// SPA fallback for any non-API route (works on Express 5)
app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
