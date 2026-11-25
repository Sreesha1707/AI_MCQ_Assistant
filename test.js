const response = await fetch("http://localhost:3000/generate-mcqs", {
    method: "POST",

    headers: {
        "Content-Type": "application/json"
    },

    body: JSON.stringify({
        webpageText: "Photosynthesis is the process by which green plants use sunlight, water and carbon dioxide to produce glucose and oxygen."
    })
});

const data = await response.json();

console.log(data);