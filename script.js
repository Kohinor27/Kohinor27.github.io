// ===== Intro Page =====
document.addEventListener('DOMContentLoaded', () => {
const intro = document.getElementById('intro');
const quizPage = document.getElementById('quizPage');
const introStartBtn = document.getElementById('startQuiz');

if (introStartBtn && intro && quizPage) {
    introStartBtn.addEventListener('click', () => {
        intro.classList.add('hidden');
        quizPage.classList.remove('hidden');
    });
} else {
    console.warn("Could not find startQuiz, intro, or quizPage in the DOM");
}
});

// ===== Quiz Settings =====
const SHUFFLE_QUESTIONS = true;
const CHOICES_PER_QUESTION = 4;

// ===== Data =====
const COUNTRIES = [
    { country: "United Kingdom", capital: "London" },
    { country: "France", capital: "Paris" },
    { country: "Germany", capital: "Berlin" },
    { country: "Italy", capital: "Rome" },
    { country: "Spain", capital: "Madrid" },
    { country: "Portugal", capital: "Lisbon" },
    { country: "Netherlands", capital: "Amsterdam" },
    { country: "United States", capital: "Wasington DC" },
    { country: "Canada", capital: "Ottawa" },
    { country: "Mexico", capital: "Mexico City" },
    { country: "Brazil", capital: "Brasília" },
    { country: "Argentina", capital: "Buenos Aires" },
    { country: "China", capital: "Beijing" },
    { country: "Japan", capital: "Tokyo" },
    { country: "India", capital: "New Delhi" },
    { country: "Russia", capital: "Moscow" },
    { country: "Australia", capital: "Canberra" },
];

// ===== Helpers =====
const $ = (sel) => document.querySelector(sel) ;
function shuffle(arr) { const a=arr.slice();  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a; }
function sample(arr,n){return shuffle(arr).slice(0,n);}
function buildQuestionPool(length){
    const base = SHUFFLE_QUESTIONS ? shuffle(COUNTRIES) : COUNTRIES.slice();
    const pool = (length==='all')? base: base.slice(0,Math.min(length,base.length));
    return pool.map(item => {
        const other = COUNTRIES.filter(x=>x.capital!==item.capital).map(x=>x.capital);
        const distractors = sample(other, CHOICES_PER_QUESTION - 1);
        const choices = shuffle([item.capital, ...distractors]);
        return {prompt: `What is the capital of ${item.country}?`, choices, correctIndex: choices.indexOf(item.capital), answer: item.capital};
    });

}

// ===== State =====
let questions=[], index=0, answrs=[];

// ===== Navigation helper =====
function setNavState() {
    const onFirst = index === 0;
    const onLast = index === questions.length - 1;
    const answered = answers[index] != null;

    prevBtn.disabled = onFirst;
    nextBtn.disabled = onLast || !answered;
    submitBtn.disabled = !onLast || !answered;

// lock the question count AFTER leaving the first question
lengthSel.disabled = !onFirst;

}

// =====UI Wiring =====
const startBtn = $("#startQuiz"), resetBtn=$("#reset"), lengthSel=$("#length");
const progressEI=$("#progress"), questionEI=$("#question"), answersForm=$("#answers");
const prevBtn=$("#prev"), nextBtn=$("#next"), submitBtn=$("#submit");
const resultsPage=$("#resultsPage"), scoreEI=$("#score"), reviewEI=$("#review");
const retryBtn = $("#retry");
const backIntroBtn = $("#backIntro");

lengthSel.addEventListener("change", () => {
    if (index === 0) {
     const len = lengthSel.value;
     questions = buildQuestionsPool(len);
     answers = Array(questions.length).fill(null);
     setNavState();
     updateUI();
    }
});

// START - go from Intro -> Quiz
startBtn.addEventListener("click", () => {
    const len=lengthSel.value; questions=buildQuestionPool(len);
    index=0; answers=Array(questions.length).fill(null);
    
    // show/hide
    resultsPage.classList.add("hidden"); 
    intro.classList.add("hidden")
    quizPage.classList.remove("hidden")
    // button states
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    submitBtn.disabled = true;
    resetBtn.disabled = false;

    updateUI();
});

// RESET - stay on Quiz, clear the round
resetBtn.addEventListener("click", () => {
    index = 0;
    answers = Array(questionEI.length).fill(null);

    prevBtn.disabled = true;
    nextBtn.disabled = true;
    submitBtn.disabled = true;
    questionsEI.textContent="";
    answersForm.innerHTML=""; 
    progressEI.textContent="Ready when you are.";
    resultsPage.classList.add("hidden");
});

// PREV / NEXT - just move around the quiz (no show/hide)
prevBtn.addEventListener("click", () => { 
   if(index>0){index--; updateUI(); } 
});
nextBtn.addEventListener("click", () => { 
    if(index < questions.length-1){index++; updateUI(); } 
});
     
// SUBMIT - go from Quiz -> Results
submitBtn.addEventListener("click", () => {
    let correct=0; answers.forEach((a,i) => { if(a===questions[i].correctIndex) correct++; });
    const pct=Math.round((correct/questions.length)*100);
    scoreEI.textContent=`You scored ${correct} out of ${questions.length} (${pct}%)`;

    reviewEI.innerHTML="";
    questions.forEach((q,i) => {
        const row=document.createElement("div");
        row.className="row"+(answers[i]===q.correctIndex?"correct":"incorrect");
        const userAnswer=answers[i]!==null ? q.choices[answers[i]] : "No answer";
        row.innerHTML=`<strong>Q${i+1}:</strong> ${q.prompt}<br/>
        <em>Your answer:</em> ${userAnswer}<br/><em>Correct answer:</em> ${q.answer}`;
        reviewEI.appendChild(row);
    });

    // show/hide
    quizPage.classList.add("hidden");
    resultsPage.classList.remove("hidden");

    // now scroll (results are visable)
    resultsPage.scrollIntoView({ behavior: "smooth", block: "start" });

    // lock actions until Retry/Back
    submitBtn.disabled = true;

});

// RETRY - Results -> (fresh round)

retryBtn.addEventListener("click", () => {
    startBtn.disabled=false;
     resetBtn.disabled=true;
      submitBtn.disabled=true;
    resultsPage.classList.add("hidden");
     questionEI.textContent="Ready when you are.";
});

backIntroBtn.addEventListener("click", () => {
    resultsPage.classList.add("hidden"); 
    quizPage.classList.add("hidden");
    intro.classList.remove("hidden");
    startBtn.disabled=false;
    resetBtn.disabled=true; 
    submitBtn.disabled=true;
    questionEI.textContent=""; 
    answersForm.innerHTML=""; 
    progressEI.textContent="Ready when you are.";
});

function updateUI(){
    const q=questions[index];
    progressEI.textContent=`Question ${index+1} of ${questions.length}`;
    questionEI.textContent=q.prompt; answersForm.innerHTML="";
    q.choices.forEach((choice,i) => {
        const id=`q${index}_choice${i}`, label=document.createElement("label");
        label.className="answers"; label.setAttribute("for",id);
        const input = document.createElement("input");
        input.type="radio"; input.name="answer"; input.id=id; input.value=i;
        input.checked=answers[index]===i; input.addEventListener("change", () => {
            answers[index]=i; 
            setNavState();
         });
        const span=document.createElement("span"); span.textContent=choice;
        label.appendChild(input); label.appendChild(span);
        answersForm.appendChild(label);
    });

    setNavState();
}
