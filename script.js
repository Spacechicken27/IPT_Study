let studySets=[];
let currentStudySetQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let totalQuestions = 0;

function loadStudySets(){
    const studySetSelect = document.getElementById('studySetSelect');

    studySetSelect.innerHTML = ''; // cleaning existing options

    studySets.forEach((set, index) => {
        const option = document.createElement('option');
        option.value = index; // Use index as value to easily retrieve the set later
        option.textContent = set.setName;
        studySetSelect.appendChild(option);
    });

    studySetSelect.addEventListener('change',function() {
        const selectedSetIndex = this.value;
        if (selectedSetIndex !== ''){
            displayCategories(studySets[selectedSetIndex].categories);
        } else {
            document.getElementById('categoryCheckboxes').innerHTML = '';
        }
    });
}

function displayCategories(categories){
    const container = document.getElementById('categoryCheckboxes');
    container.innerHTML = ''; // Clear previous categories

    categories.forEach((category, index) => {
        // Create a checkbox for each category
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'category_' + index;
        console.info("Created: ", checkbox.id);
        checkbox.checked = true; 
        checkbox.value = index;
        checkbox.name = 'categoryCheckbox';
        

        // Create a label for the checkbox
        const label = document.createElement('label');
        label.htmlFor = 'category_' + index;
        label.textContent = category.categoryName;

        // Append the checkbox and label to the container
        container.appendChild(checkbox);
        container.appendChild(label);
        container.appendChild(document.createElement('br')); // Line break for readability
    });
}

function restartQuiz(){
    console.info("RESTARTING QUIZ.. HOPEFULLy");
    currentQuestionIndex = 0;
    score = 0;
    totalQuestions = 0;
    document.getElementById("score").textContent = `Score: ${score}`; // Assuming you have an element to display the score
    document.getElementById("questionNumber").textContent = `Question: ${currentQuestionIndex}/${totalQuestions}`
    document.getElementById("scorePercent").textContent = `Correct: ${(score/currentQuestionIndex) *100}`
    document.getElementById("quizContainer").innerHTML = '';
    startQuiz();
}

function startQuiz(){
    const studySetIndex = document.getElementById('studySetSelect').value;
    const questionType = document.querySelector('input[name="questionType"]:checked').value;
    console.info("Got to Start Quiz")
    console.info("questionType: ", questionType)
    // Reset current questions and score
    totalQuestions = 0;
    studySets[studySetIndex].categories.forEach((category,index) => {
        //console.info("for each studySet Category: ", category)
        
        if(document.getElementById('category_'+index).checked){
            category.questions.forEach(question => {

                if (document.getElementById("rangeWithMinMax").checked){
                    console.info("Chose range with max and min")
                    currentStudySetQuestions.push(question);
                    totalQuestions++;
                } else if(document.getElementById("onlyRange").checked && question.type === "range"){
                    console.info("Question is range question")
                    currentStudySetQuestions.push(question);
                    totalQuestions++;
                } else if (document.getElementById("onlyMinMax").checked && (question.type === "min" || question.type === "max")){
                    console.info("quesiton is min/max question")
                    currentStudySetQuestions.push(question);
                    totalQuestions++;
                }
                
                //}
            });
        }
    });
    if(document.getElementById("randomizeQuestions").checked){
        currentStudySetQuestions = randomizeElements(currentStudySetQuestions)
    }
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById("score").textContent = `Score: ${score}`; // Assuming you have an element to display the score
    document.getElementById("questionNumber").textContent = `Question: ${currentQuestionIndex}/${totalQuestions}`
    document.getElementById("scorePercent").textContent = `Correct: ${(score/currentQuestionIndex) *100}`

    if(document.getElementById("restartQuiz") == null){
        startBtn = document.getElementById("startQuiz");
        const restartButton = document.createElement("button");
        restartButton.textContent = "Restart Quiz";
        restartButton.id = "restartQuiz";
        restartButton.className = startBtn.className; // Copy classes
        restartButton.style.cssText = startBtn.style.cssText; // Copy styles
        restartButton.style.backgroundColor = "#D8863B";
        restartButton.addEventListener("click", restartQuiz);
        startBtn.parentNode.replaceChild(restartButton, this);
    }

    showQuestion();
}

function randomizeElements(array){
    let shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap
    }
    return shuffled;
}
// Function to get random elements from the array
function getRandomElements(array, count) {
    // Shuffle array using Fisher-Yates algorithm
    let shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap
    }
    // Return the first `count` elements of the shuffled array
    return shuffled.slice(0, count);
}

function showQuestion() {
    document.getElementById("score").textContent = `Score: ${score}`; // Assuming you have an element to display the score
    //document.getElementById("questionNumber").textContent = `Question: ${currentQuestionIndex}/${totalQuestions}`
    //document.getElementById("scorePercent").textContent = `Correct: ${(score/currentQuestionIndex) *100}`
    console.info("current Study Set Questions:", currentStudySetQuestions)
    if (currentQuestionIndex < currentStudySetQuestions.length) {
        document.getElementById("questionNumber").textContent = `Question: ${currentQuestionIndex}/${currentStudySetQuestions.length}`
        const currentQuestion = currentStudySetQuestions[currentQuestionIndex];
        const quizContainer = document.getElementById("quizContainer");
        const questionType = document.querySelector('input[name="questionType"]:checked').value;
        quizContainer.innerHTML = ''; // Clear previous question
        
        const questionText = document.createElement('div');
        questionText.style.textAlign = 'center';
        let val = 0;
        if(questionType==="randomChoice"){
            val = Math.floor(Math.random() * 2) + 1;
        }
        // Step 1: check if doing multiple choice, fill in blank, or random
        if (questionType === "multipleChoice" || val == 1){
            questionText.textContent = currentQuestion.multiple_choice_prompt
            quizContainer.appendChild(questionText);

            const options = getRandomElements(currentQuestion.wrong_options,4); // rand grab 4 incorrect answers
            options.push(currentQuestion.answer); // add correct answer
            options.sort(() => Math.random() - 0.5); // reshuffle with correct answer

            options.forEach(option =>{
                const button = document.createElement('button');
                button.textContent = option;
                button.onclick = () => selectAnswer(option, button);
                quizContainer.appendChild(button);
            });
        } else if (questionType === "fillInTheBlank" || val == 2){

            const promptParts = currentQuestion.fill_blank_prompt.split("_____");

            const part1 = document.createElement('span');
            part1.textContent = promptParts[0];
            quizContainer.appendChild(part1);

            const input = document.createElement('input');
            input.type = 'text';
            input.style.dipslay = 'inline-block';
            input.style.width='50px'; //hm
            quizContainer.appendChild(input);

            if(promptParts[1]){
                const part2 = document.createElement('span');
                part2.textContent = promptParts[1];
                quizContainer.appendChild(part2);
            }

            const submitButton = document.createElement('button');
            submitButton.textContent = 'Submit';
            submitButton.onclick = () => selectAnswer(input.value, submitButton);
            quizContainer.appendChild(submitButton);

        }
    } else {
        // Quiz complete
        document.getElementById("score").innerHTML = '';
        document.getElementById("quizContainer").innerHTML = `Quiz Complete! Your score: ${score}`;
    }
}

function selectAnswer(user_answer, element) {
    console.info("Select Answer Argument (index): ", user_answer);
    //currentQuestionIndex++;
    const correctAnswer = currentStudySetQuestions[currentQuestionIndex].answer;
    if (user_answer === correctAnswer) {
        score++;
        element.classList.add('correct');
        element.classList.remove('incorrect');
    } else {
        element.classList.add('incorrect'); // Add class to trigger incorrect answer animation
        element.classList.remove('correct');
        document.body.classList.add('body-flash'); // Add class to flash the background
        setTimeout(() => document.body.classList.remove('body-flash'), 1000); // Remove class after animation
    }
    setTimeout(()=>{
        currentQuestionIndex++;
        showQuestion();
    }, 1000);
    
}

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    fetch('questions.json') // Adjust the path as necessary
        .then(response => response.json())
        .then(data => {
            // Assuming 'studySets' is the variable where you want to store your loaded data
            studySets = data.studySets;
            console.info("loaded the study Sets:", studySets)
            loadStudySets(); // Populate your dropdown or perform other initialization tasks here
            displayCategories(studySets[0].categories); // have categories displayed on start
        })
        .catch(error => console.error('Error loading study sets:', error));
    document.getElementById('startQuiz').addEventListener('click', startQuiz);
});

