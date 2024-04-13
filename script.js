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
    document.getElementById('studySetSelection').style.display = 'none';
    document.getElementById('categoriesContainer').style.display = 'none';
    document.getElementById('questionType').style.display = 'none';
    document.getElementById('rangeMinMaxInfo').style.display = 'none';
    document.getElementById('ExtraInfo').style.display = 'none';
    document.getElementById('statusBar').style.display = 'flex';
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
    // Shuffle array using Fisher-Yates algorithm\
    console.info("Array To Get Rand Elements: ", array)
    if (!Array.isArray(array) || array.length === 0) {
        console.warn("getRandomElements was called with an invalid array:", array);
        return [];
    } 
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
            questionText.textContent = currentQuestion.multiple_choice_prompt;
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

        } else if (questionType === "matching"){
            questionText.textContent = currentQuestion.procedure_prompt || currentQuestion.multiple_choice_prompt;
            //console.info("Question Text:", questionText.textContent)
            quizContainer.appendChild(questionText);

            const matchingContainer = document.createElement('div');
            matchingContainer.id = 'matchingContainer';
            quizContainer.appendChild(matchingContainer);

            const leftList = document.createElement('ul');
            leftList.classList.add('list');
            leftList.id = 'leftList';
            const rightList = document.createElement('ul');
            rightList.classList.add('list');
            rightList.id = 'rightList';
            console.info("currentQuestion.wrong_options:", currentQuestion)
            const options = getRandomElements(currentQuestion.wrong_options,4); // rand grab 4 incorrect answers
            currentQuestion.procedure_answer.forEach((step,index)=>{
                options.push(step)
            });
            options.sort(() => Math.random() - 0.5);

            options.forEach((step, index)=>{
                const listItem = document.createElement('li');
                listItem.classList.add('list-item');
                listItem.textContent = step;
                listItem.draggable = true;
                listItem.id = `step-item-${index}`;
                leftList.appendChild(listItem);
            });

            matchingContainer.appendChild(leftList);
            matchingContainer.appendChild(rightList);

            document.querySelectorAll('.list-item').forEach(item => {
                item.addEventListener('dragstart', function() {
                    draggableItem = this;
                    setTimeout(() => this.classList.add('dragging'), 0);
                });
        
                item.addEventListener('dragend', function() {
                    draggableItem = null;
                    this.classList.remove('dragging');
                });
            });
        
            document.querySelectorAll('.list').forEach(list => {
                list.addEventListener('dragover', function(e) {
                    e.preventDefault();
                    const afterElement = getDragAfterElement(list, e.clientY);
                    const draggable = document.querySelector('.dragging');
                    if (afterElement == null) {
                        list.appendChild(draggable);
                    } else {
                        list.insertBefore(draggable, afterElement);
                    }
                });
            });

            function getDragAfterElement(list, y) {
                const draggableElements = [...list.querySelectorAll('.list-item:not(.dragging)')];
        
                return draggableElements.reduce((closest, child) => {
                    const box = child.getBoundingClientRect();
                    const offset = y - box.top - box.height / 2;
                    if (offset < 0 && offset > closest.offset) {
                        return { offset: offset, element: child };
                    } else {
                        return closest;
                    }
                }, { offset: Number.NEGATIVE_INFINITY }).element;
            }
            const submitButton = document.createElement('button');
            submitButton.id = 'submitButton';
            submitButton.textContent = 'Submit';
            submitButton.onclick = () => {
                // Collect and send the answer
                const answerList = [];
                rightList.querySelectorAll('li').forEach(item => {
                    answerList.push(item.textContent);
                });
                selectProcedureAnswer(answerList, submitButton); // Assuming selectAnswer can handle array input
            };
            submitButton.style.display = 'none';
            quizContainer.appendChild(submitButton);

        }

        console.info("HELPPDAFP")
        if(document.getElementById("showAnswers").checked){
            console.info("show answers is checked")
            
        } 
    } else {
        // Quiz complete
        document.getElementById("score").innerHTML = '';
        document.getElementById("quizContainer").innerHTML = `Quiz Complete! Your score: ${score}`;
    }
}

function proceedToNextQuestion(delay=1000){
    setTimeout(()=>{
        currentQuestionIndex++;
        showQuestion();
    }, delay);
}



function selectAnswer(user_answer, element) {
    console.info("Select Answer Argument (index): ", user_answer);
    //currentQuestionIndex++;
    const currentQuestion = currentStudySetQuestions[currentQuestionIndex];
    const correctAnswer = currentQuestion.answer;
    const showAnswers = document.getElementById("showAnswers");
    if(showAnswers.checked){
        var qvalid = 'correct';
        if (user_answer === correctAnswer) {
            score++;
            element.classList.add('correct');
            element.classList.remove('incorrect');
        } else {
            qvalid = 'incorrect';
            element.classList.add('incorrect'); // Add class to trigger incorrect answer animation
            element.classList.remove('correct');
            document.body.classList.add('body-flash'); // Add class to flash the background
            setTimeout(() => document.body.classList.remove('body-flash'), 1000); // Remove class after animation
        }
        document.querySelectorAll('button').forEach(button => {
            if (button.textContent === correctAnswer){
                button.classList.add('correct');
                button.classList.remove('incorrect');
            }
            if(button.closest('div').id == "quizContainer"){
                button.onclick = null;
            }
        });
        if(document.getElementById("submitButton") == null){

            const overrideButton = document.createElement('button');
            overrideButton.id = 'overrideButton';
            overrideButton.textContent = 'Override';
            overrideButton.style.width = '50%';  // Set width to 50%
            //overrideButton.style.transition = 'background-color 0.3s ease'; // Smooth transition
            overrideButton.style.backgroundColor = '#8d541e';
            //overrideButton.onmouseover = () => { overrideButton.style.backgroundColor = '#9b5410'; }; // Darken on hover
            //overrideButton.onmouseout = () => { overrideButton.style.backgroundColor = '#a26933'; }; // Revert on mouse out
            overrideButton.onclick = () => {
                // Add your function logic for what happens when the Override button is clicked
                console.log("Override button clicked");
            };

            const continueButton = document.createElement('button');
            continueButton.id = 'continueButton';
            continueButton.textContent = 'Continue';
            continueButton.style.width = '50%';  // Set width to 50%
            continueButton.style.backgroundColor = '#32ad61';
            //continueButton.style.transition = 'background-color 0.3s ease'; // Smooth transition
            //continueButton.onmouseover = () => { continueButton.style.backgroundColor = '#00ab66'; }; // Darken on hover
            //continueButton.onmouseout = () => { continueButton.style.backgroundColor = '#00c06a'; }; // Revert on mouse out
            continueButton.onclick = () =>{
                proceedToNextQuestion(100)
            }

            const buttonContainer = document.createElement('div');
            buttonContainer.style.display = 'flex';  // Use flexbox to align buttons in a row
            buttonContainer.appendChild(overrideButton);
            buttonContainer.appendChild(continueButton);
            quizContainer.appendChild(buttonContainer);
        }
        showAnswers.style.display = 'block';
    } else {
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
        proceedToNextQuestion(1000)
        
    }
    
}

function arraysEqual(array1, array2){
    if (array1.length !== array2.length) {
        return false;
    }
    for (let i = 0; i < array1.length; i++) {
        if (array1[i] !== array2[i]) {
            return false;
        }
    }
    return true;
}

function selectProcedureAnswer(user_answer, element) {
    console.info("Select Procedure Answer Argument (index): ", user_answer);
    
    //currentQuestionIndex++;
    const correctAnswer = currentStudySetQuestions[currentQuestionIndex].procedure_answer;
    console.info("Select Procedure Answer: ", correctAnswer);
    if (arraysEqual(user_answer, correctAnswer)) {
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

// Add drag and drop helper functions
function dragStart(event) {
    event.dataTransfer.setData("text/plain", event.target.id);
}

function allowDrop(event) {
    event.preventDefault();
}

function dragOver(event) {
    event.preventDefault(); // Necessary to allow dropping
}

function drop(event) {
    event.preventDefault();
    var data = event.dataTransfer.getData("text");
    var draggedElement = document.getElementById(data);
    event.target.appendChild(draggedElement);
}
// function drop(event) {
//     event.preventDefault();
//     const id = event.dataTransfer.getData("text/plain");
//     const draggableElement = document.getElementById(id);
//     const dropZone = event.target;
//     //const list = document.getElementById('procedureSteps') || dropZone.parentNode;

//     if (dropZone.tagName === 'LI') { // Ensures dropping only on list items
//         list.insertBefore(draggableElement, dropZone.nextSibling);
//     }
// }

function dragEnter(event) {
    if (event.target.tagName === 'LI') {
        event.target.style.background = 'lightgray';
    }
}

function dragLeave(event) {
    if (event.target.tagName === 'LI') {
        event.target.style.background = '';
    }
}

function dragLeave(event){

}

function verifyProcedureOrder(){

}

