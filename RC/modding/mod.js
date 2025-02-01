// Sample Mod for Rabbit Clicker Game

// Add a custom variable to track player score
moddingAPI.addVariable("score", 0);

// Function to increase the score by 20
moddingAPI.addButton("Increase Score by 20", function() {
    let currentScore = moddingAPI.getVariable("score");
    moddingAPI.setVariable("score", currentScore + 20);
    moddingAPI.log("Score updated to: " + moddingAPI.getVariable("score"));
    moddingAPI.alert("Your score is now: " + moddingAPI.getVariable("score"));
});

// Function to show current score
moddingAPI.addButton("Show Current Score", function() {
    moddingAPI.alert("Current Score: " + moddingAPI.getVariable("score"));
});

// Adding an image of a rabbit
moddingAPI.addImage("https://example.com/rabbit.png", "Cute Rabbit");

// Function to change image on a button click
moddingAPI.addButton("Change Rabbit Image", function() {
    const rabbitImage = document.querySelector('img[alt="Cute Rabbit"]');
    if (rabbitImage) {
        rabbitImage.src = "https://example.com/another_rabbit.png"; // Change this URL to a valid image
        moddingAPI.log("Rabbit image changed!");
    } else {
        moddingAPI.alert("No rabbit image to change.");
    }
});

// Adding sound effects
moddingAPI.addButton("Play Catch Sound", function() {
    moddingAPI.playSound("https://example.com/catch_sound.mp3");
});

// Button to simulate receiving food and playing a sound
moddingAPI.addButton("Receive 50 Food", function() {
    let currentFood = moddingAPI.getFoodCount();
    moddingAPI.setFoodCount(currentFood + 50);
    moddingAPI.playSound("https://example.com/food_reward_sound.mp3");

    moddingAPI.alert("You've received 50 food! Total food: " + moddingAPI.getFoodCount());
});

// Button to simulate a rabbit-catching frenzy
moddingAPI.addButton("Catch 5 Rabbits", function() {
    let currentRabbits = moddingAPI.getRabbitCount();
    moddingAPI.setRabbitCount(currentRabbits + 5);
    moddingAPI.alert("You've caught 5 rabbits! Total rabbits: " + moddingAPI.getRabbitCount());
    moddingAPI.playSound("https://example.com/catch_sound.mp3");
});
