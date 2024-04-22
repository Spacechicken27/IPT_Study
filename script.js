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
    updateScore();
    document.getElementById("quizContainer").innerHTML = '';
    startQuiz();
}

function startQuiz(){
    const studySetIndex = document.getElementById('studySetSelect').value;
    const questionType = document.querySelector('input[name="questionType"]:checked').value;
    document.getElementById('studySetSelection').style.display = 'none';
    document.getElementById('categoriesContainer').style.display = 'none';
    document.getElementById('questionType').style.display = 'none';
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
                currentStudySetQuestions.push(question);
                totalQuestions++;
            });
        }
    });

    if(document.getElementById("randomizeQuestions").checked){
        currentStudySetQuestions = randomizeElements(currentStudySetQuestions)
    }

    currentQuestionIndex = 0;
    score = 0;
    updateScore();

    startBtn = document.getElementById("startQuiz");
    startBtn.style.display='none';
    homeBtn = document.getElementById("homeBtn");
    homeBtn.style.display='block';
    homeBtn.addEventListener('click', goHome);

    showQuestion();
}

function goHome(){
    console.info("going home");
    document.getElementById('studySetSelection').style.display = 'block';
    document.getElementById('categoriesContainer').style.display = 'block';
    document.getElementById('questionType').style.display = 'block';
    document.getElementById('ExtraInfo').style.display = 'block';
    document.getElementById('statusBar').style.display = 'none';
    quizContainer = document.getElementById('quizContainer');
    quizContainer.innerHTML = '';
    //studySets=[];
    currentStudySetQuestions = [];
    currentQuestionIndex = 0;
    score = 0;
    totalQuestions = 0;

    
    homeBtn = document.getElementById("homeBtn");
    startBtn = document.getElementById("startQuiz");
    homeBtn.style.display='none';
    startBtn.style.display='block';
    
}

function randomizeElements(array){
    let shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap
    }
    return shuffled;
}

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

function createMultipleChoiceQuestion(quizContainer,questionText,currentQuestion){
    questionText.textContent = currentQuestion.multiple_choice_prompt;
    quizContainer.appendChild(questionText);

    if (currentQuestion.image){
        const img = document.createElement('img');
        img.src = currentQuestion.image;
        img.style.width = '100%';
        img.style.maxWidth = '500px';
        img.style.marginTop = '10px';
        img.style.height = 'auto'; 
        img.style.display = 'block';
        img.style.margin = 'auto'; 
        img.onload = function() {
            // Calculate double the image's natural width
            const doubleNaturalWidth = img.naturalWidth * 2;
        
            // Set maxWidth to the smaller of 500px or double the image's natural width
            img.style.maxWidth = Math.min(500, doubleNaturalWidth) + 'px';
        };
        quizContainer.appendChild(img);
    }

    const options = getRandomElements(currentQuestion.wrong_options,4); // rand grab 4 incorrect answers
    options.push(currentQuestion.answer); // add correct answer
    options.sort(() => Math.random() - 0.5); // reshuffle with correct answer

    options.forEach(option =>{
        const button = document.createElement('button');
        button.textContent = option;
        button.onclick = () => checkMultipleChoiceAnswer(option, currentQuestion,button, quizContainer);
        quizContainer.appendChild(button);
    });
}

function createFillInTheBlankQuestion(quizContainer,currentQuestion){
    const promptParts = currentQuestion.fill_blank_prompt.split("_____");

    const part1 = document.createElement('span');
    part1.textContent = promptParts[0];
    quizContainer.appendChild(part1);

    const input = document.createElement('input');
    input.type = 'text';
    input.style.dipslay = 'inline-block';
    input.style.width='80px'; //hm
    quizContainer.appendChild(input);

    if(promptParts[1]){
        const part2 = document.createElement('span');
        part2.textContent = promptParts[1];
        part2.classList.add('part2');
        quizContainer.appendChild(part2);
    }

    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    submitButton.onclick = () => checkFillInTheBlankAnswer(input.value, currentQuestion, input);
    quizContainer.appendChild(submitButton);
}

function createMultipleResponseQuestion(quizContainer,questionText,currentQuestion){
    questionText.textContent = currentQuestion.multiple_choice_prompt;
    quizContainer.appendChild(questionText);

    if (currentQuestion.image){
        const img = document.createElement('img');
        img.src = currentQuestion.image;
        img.style.width = '100%';
        img.style.maxWidth = '500px';
        img.style.marginTop = '10px';
        img.style.height = 'auto'; 
        img.style.display = 'block';
        img.style.margin = 'auto'; 
        img.onload = function() {
            // Calculate double the image's natural width
            const doubleNaturalWidth = img.naturalWidth * 2;
        
            // Set maxWidth to the smaller of 500px or double the image's natural width
            img.style.maxWidth = Math.min(500, doubleNaturalWidth) + 'px';
        };
        quizContainer.appendChild(img);
    }

    const options = getRandomElements(currentQuestion.wrong_options,4); // rand grab 4 incorrect answers
    options.push(...currentQuestion.answer);
    // currentQuestion.procedure_answer.forEach((step,index)=>{
    //     options.push(step)
    // });
    options.sort(() => Math.random() - 0.5);

    options.forEach(option =>{
        const button = document.createElement('button');
        button.textContent = option;
        button.style.backgroundColor = '#b768a2';
        button.className = 'option-button';
        button.onclick = function() {
            // Toggle selected class on button click
            button.classList.toggle('selected');
            if(button.classList.contains('selected')){
                button.style.backgroundColor = '#800080';
            } else {
                button.style.backgroundColor = '#b768a2';
            }
        };
        quizContainer.appendChild(button);
    });

    const submitButton = document.createElement('button');
    submitButton.id = 'submitButton';
    submitButton.textContent = 'Submit';
    submitButton.onclick = function() {
        checkMultipleResponseAnswer(currentQuestion.answer);
    };
    quizContainer.appendChild(submitButton);
}

function createProcedureQuestion(quizContainer,questionText,currentQuestion){
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
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        item.addEventListener('touchstart', handleTouchStart, { passive: false });
       // item.addEventListener('touchmove', handleTouchMove, { passive: false });
        item.addEventListener('touchend', handleTouchEnd, { passive: false });
    });

    document.querySelectorAll('.list').forEach(list => {
        list.addEventListener('dragover', handleDragOver);
        list.addEventListener('touchmove', handleDragOver, { passive: false });
    });

    const submitButton = document.createElement('button');
    submitButton.id = 'submitButton';
    submitButton.textContent = 'Submit';
    submitButton.onclick = () => {
        // Collect and send the answer
        const answerList = [];
        rightList.querySelectorAll('li').forEach(item => {
            answerList.push(item.textContent);
        });
        checkProcedureAnswer(answerList, currentQuestion,submitButton, leftList, rightList); // Assuming selectAnswer can handle array input
    };
    //submitButton.style.display = 'none';
    quizContainer.appendChild(submitButton);
}

function showQuestion() {
    updateScore();
    console.info("current Study Set Questions:", currentStudySetQuestions)
    if (currentQuestionIndex < currentStudySetQuestions.length) {
        document.getElementById("questionNumber").textContent = `Question: ${currentQuestionIndex}/${currentStudySetQuestions.length}`
        const currentQuestion = currentStudySetQuestions[currentQuestionIndex];
        const quizContainer = document.getElementById("quizContainer");
        const preferQuestionType = document.querySelector('input[name="questionType"]:checked').value;
        const questionType = currentQuestion.type;
        quizContainer.innerHTML = ''; // Clear previous question
        
        const questionText = document.createElement('div');
        questionText.style.textAlign = 'center';
        let flag = 0;
        if(preferQuestionType==="fillInTheBlank"){
            if (currentQuestion.fill_blank_prompt){
                flag =1;
            }
        }
        // Step 1: check if doing multiple choice, fill in blank, or random
        if (flag == 1){
            createFillInTheBlankQuestion(quizContainer,currentQuestion);
        } else if (questionType === "multiple_choice"){
            createMultipleChoiceQuestion(quizContainer,questionText,currentQuestion);
        } else if (questionType === "procedure"){
            createProcedureQuestion(quizContainer,questionText,currentQuestion);
        } else if (questionType === "multiple_response"){
            createMultipleResponseQuestion(quizContainer, questionText, currentQuestion);
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

function checkMultipleChoiceAnswer(user_answer, currentQuestion, element, options){
    correctAnswer = currentQuestion.answer;
    user_correct = false;
    if (user_answer === correctAnswer) {
        updateScore(true);
        element.classList.add('correct');
        element.classList.remove('incorrect');
        user_correct = true;
        items = options.querySelectorAll('button');
        items.forEach(option =>{ 
            if(option.id != "overrideButton" && option.id != "continueButton"){
                option.onclick = () => {};
            }
            
        })
    } else {
        element.classList.add('incorrect'); // Add class to trigger incorrect answer animation
        element.classList.remove('correct');
        items = options.querySelectorAll('button');
        items.forEach(option =>{ 
            if(option.id != "overrideButton" && option.id != "continueButton"){
                option.onclick = () => {};
                if (option.textContent === correctAnswer){
                    console.info("found correct one")
                    option.classList.add('correct');
                }
            }
            
        });

        document.body.classList.add('body-flash'); // Add class to flash the background
        setTimeout(() => document.body.classList.remove('body-flash'), 1000); // Remove class after animation
    }
    createContinueButton(user_correct);
    //proceedToNextQuestion(1000)
}

function checkFillInTheBlankAnswer(user_answer, currentQuestion, element){
    correctAnswer = currentQuestion.answer;
    user_correct = false;
    if (user_answer === correctAnswer) {
        updateScore(true);
        element.classList.add('correct');
        element.classList.remove('incorrect');
        user_correct = true;
    } else {
        const elements = document.querySelectorAll('span');
        console.info(elements);
        // Loop through each element
        elements.forEach(element => {
            // Find the 'span' within the element
            console.info("elementssss");
            if (element.classList.contains('part2')) {
                // Change the text content of the 'span' to 'currentQuestion.answer'
                console.info("changing spannn");
                element.textContent = element.textContent.replace(/type: ".*?"/, `answer: "${currentQuestion.answer}"`);
                //element.textContent = currentQuestion.answer;
                element.style.color='green';
            }
        });

        element.classList.add('incorrect'); // Add class to trigger incorrect answer animation
        element.classList.remove('correct');
        document.body.classList.add('body-flash'); // Add class to flash the background
        setTimeout(() => document.body.classList.remove('body-flash'), 1000); // Remove class after animation
    }
    createContinueButton(user_correct);
    //proceedToNextQuestion(1000)
}

function checkProcedureAnswer(user_answer, currentQuestion, element, leftList=null, rightList=null){
    correctAnswer = currentQuestion.procedure_answer;
    user_correct = false;
    element.onclick = () => {};
    if (arraysEqual(user_answer, correctAnswer)){
        updateScore(true);
        element.classList.add('correct');
        element.classList.remove('incorrect');
        user_correct = true;
        items = rightList.querySelectorAll('li');
        items.forEach((item, index)=> {
            item.classList.add('correct');
            item.draggable = false;
        });
        items = leftList.querySelectorAll('li');
        items.forEach((item, index)=> {
            item.draggable = false;
        });
    } else {
        element.classList.add('incorrect'); // Add class to trigger incorrect answer animation
        element.classList.remove('correct');
        console.info("rightList:");
        console.info(rightList);
        items = rightList.querySelectorAll('li');
        items.forEach((item, index)=> {
            const text = item.textContent;
            if(correctAnswer[index]===text){
                item.classList.add('correct');
            } else if (correctAnswer.includes(text)){
                item.classList.add('incorrectSelected');
            } else {
                item.classList.add('incorrect');
            }
        });
        items = leftList.querySelectorAll('li');
        items.forEach((item, index)=>{
            item.parentNode.removeChild(item);
        })
        LeftListTitle = document.createElement('li')
        //LeftListTitle.classList.add('list-item');
        //LeftListTitle.textContent = '\\/ Correct Procedure \\/';
        //LeftListTitle.draggable = false;
        //LeftListTitle.id = `correct-procedure-item`;
        //leftList.appendChild(LeftListTitle);

        correctAnswer.forEach((step, index)=>{
            const listItem = document.createElement('li');
            listItem.classList.add('list-item');
            listItem.textContent = step;
            listItem.draggable = false;
            listItem.id = `step-item-${index}`;
            listItem.style.backgroundColor = '#28a745';
            //listItem.classList.add('correct');
            leftList.appendChild(listItem);
        });

        document.body.classList.add('body-flash'); // Add class to flash the background
        setTimeout(() => document.body.classList.remove('body-flash'), 1000); // Remove class after animation
    }
    createContinueButton(user_correct);
}

function updateScore(increase){
    if(increase != null){
        if (increase){
            score++;
        } else {
            score--
        }
    }
    document.getElementById("score").textContent = `Score: ${score}`; // Assuming you have an element to display the score
    document.getElementById("questionNumber").textContent = `Question: ${currentQuestionIndex}/${totalQuestions}`
    document.getElementById("scorePercent").textContent = `Correct: ${(score/currentQuestionIndex) *100}`
}

function checkMultipleResponseAnswer(correct_answers){
    const allButtons = document.querySelectorAll('.option-button');

    // Highlight correct and incorrect answers
    allButtons.forEach(button => {
        const isCorrect = correct_answers.includes(button.textContent);
        const isSelected = button.classList.contains('selected');

        if (isSelected) {
            if (isCorrect) {
                button.classList.add('correct'); // Add class to trigger correct answer animation
            } else {
                button.classList.add('incorrect'); // Add class to trigger incorrect answer animation
                document.body.classList.add('body-flash'); // Add class to flash the background
                setTimeout(() => document.body.classList.remove('body-flash'), 1000); // Remove class after animation
            }
        } else if (isCorrect) {
            console.info("incorrect not selected");
            button.classList.add('incorrectSelected'); // Ensure all correct answers are highlighted
        }

        // Disable button clicks after submission
        button.onclick = null;
    });
    createContinueButton();
}

function createContinueButton(user_correct){
    if(document.getElementById("continueButton") == null){

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
            if(user_correct){
                updateScore(false);
                document.body.classList.add('body-flash');
                setTimeout(() => document.body.classList.remove('body-flash'), 1000);
            } else {
                updateScore(true);
                document.body.classList.add('good-body-flash');
                setTimeout(() => document.body.classList.remove('good-body-flash'), 1000);
            }
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
        updateScore(true);
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

function handleDragStart(event) {
    draggableItem = this;
    setTimeout(() => this.classList.add('dragging'), 0);
    event.dataTransfer.setData("text/plain", event.target.id); // For desktop compatibility
}

function handleTouchStart(event) {
    event.preventDefault();
    draggableItem = this;
    setTimeout(() => this.classList.add('dragging'), 0);
}

function handleDragEnd(event) {
    draggableItem = null;
    this.classList.remove('dragging');
}

function handleTouchEnd(event) {
    event.preventDefault();
    if (!draggableItem) {
        console.info("No draggable item in handleTouchEnd");
        return;
    }
    draggableItem.classList.remove('dragging');
    draggableItem.style.position = '';
    draggableItem.style.zIndex = '';
    draggableItem.style.left = '';
    draggableItem.style.top = '';

    const touchX = event.changedTouches[0].clientX;
    const touchY = event.changedTouches[0].clientY;

    // Determine the closest list by touch point
    const targetList = findClosestList(touchX, touchY);
    
    if (targetList) {
        const afterElement = getDragAfterElement(targetList, touchY);
        if (afterElement == null) {
            targetList.appendChild(draggableItem);
        } else {
            targetList.insertBefore(draggableItem, afterElement);
        }
    }
    draggableItem = null;
}

function handleDragOver(event) {
    event.preventDefault();
    const dragOverY = event.clientY || (event.touches && event.touches[0].clientY);
    const afterElement = getDragAfterElement(event.target.closest('.list'), dragOverY);
    const draggable = document.querySelector('.dragging');
    if (afterElement == null) {
        event.target.closest('.list').appendChild(draggable);
    } else {
        event.target.closest('.list').insertBefore(draggable, afterElement);
    }
}

function handleTouchMove(event) {
    event.preventDefault();
    if (!draggableItem) {
        console.info("No draggable item in handleTouchMove");
        return;
    }
    const touch = event.touches[0];
    draggableItem.style.position = ''; // Use 'fixed' for position to work properly on mobile
    //draggableItem.style.left = '${touch.clientX}px';
    //draggableItem.style.top = '${touch.clientY}px';
    draggableItem.style.left = `${touch.pageX - draggableItem.offsetWidth / 2}px`;
    draggableItem.style.top = `${touch.pageY - draggableItem.offsetHeight / 2}px`;
}

function findClosestList(touchX, touchY) {
    // Get the bounding rectangles of both lists
    const leftListRect = document.getElementById('leftList').getBoundingClientRect();
    const rightListRect = document.getElementById('rightList').getBoundingClientRect();

    // Calculate the distance to each list
    const distanceToLeftList = Math.abs(leftListRect.left + leftListRect.width / 2 - touchX) + Math.abs(leftListRect.top + leftListRect.height / 2 - touchY);
    const distanceToRightList = Math.abs(rightListRect.left + rightListRect.width / 2 - touchX) + Math.abs(rightListRect.top + rightListRect.height / 2 - touchY);

    // Return the closest list based on the minimum distance
    return distanceToLeftList <= distanceToRightList ? document.getElementById('leftList') : document.getElementById('rightList');
}


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
/*
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
*/